import { useCallback, useEffect, useState, type FormEvent } from "react";
import CampoAutocomplete from "../campos/CampoAutocomplete";
import CampoTexto from "../campos/CampoTexto";
import CampoTextarea from "../campos/CampoTextarea";
import Carregador from "../campos/Carregador";
import CampoDoCadastro from "./CampoDoCadastro";
import Button from "../ui/button/Button";
import { MensagemErro } from "../crud/EstadosLista";
import {
  cadastrosTiposApi,
  listarCamposDoTipo,
  listarTiposDeCampo,
} from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import {
  metaParaEnvio,
  valorParaFormulario,
} from "../../utils/camposPersonalizados";
import type { ErrosValidacao } from "../../types/api";
import type {
  Cadastro,
  CadastroTipo,
  CampoPersonalizado,
  DadosCadastro,
  TipoCampoCatalogo,
} from "../../types/modelos";

export interface EnvioCadastro {
  dados: DadosCadastro;
  /** Arquivos escolhidos e ainda não enviados, por caminho do campo. */
  arquivos: Record<string, File | null>;
}

interface FormularioCadastroProps {
  registro?: Cadastro | null;
  salvando: boolean;
  erros: ErrosValidacao;
  erroGeral?: string | null;
  aoEnviar: (envio: EnvioCadastro) => void;
  aoRemoverArquivo?: (caminho: string) => void;
  aoCancelar: () => void;
}

/**
 * Formulário compartilhado pelo cadastro e pela edição de um cadastro.
 *
 * A metade de cima é fixa (tipo, nome, descrição). A de baixo é montada na
 * hora, a partir de duas consultas:
 *
 * | Consulta | Para quê |
 * | --- | --- |
 * | `GET /cadastros-campos-tipos` | o catálogo: o que cada tipo de campo é |
 * | `GET /cadastros-tipos/{id}/campos` | a declaração do tipo escolhido |
 *
 * Trocar o tipo troca o conjunto de campos, então a declaração é buscada de
 * novo — e os valores dos campos que continuam existindo são mantidos.
 */
export default function FormularioCadastro({
  registro,
  salvando,
  erros,
  erroGeral,
  aoEnviar,
  aoRemoverArquivo,
  aoCancelar,
}: FormularioCadastroProps) {
  const [tipo, setTipo] = useState<{ id: number; nome: string } | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const [catalogo, setCatalogo] = useState<TipoCampoCatalogo[]>([]);
  const [campos, setCampos] = useState<CampoPersonalizado[]>([]);
  const [valores, setValores] = useState<Record<string, unknown>>({});
  const [arquivos, setArquivos] = useState<Record<string, File | null>>({});

  const [carregandoCampos, setCarregandoCampos] = useState(false);
  const [erroCampos, setErroCampos] = useState<string | null>(null);

  /* O catálogo é o mesmo para todo o sistema: uma consulta só. */
  useEffect(() => {
    let ativo = true;

    listarTiposDeCampo()
      .then((tipos) => ativo && setCatalogo(tipos))
      .catch((falha) => ativo && setErroCampos(mensagemDoErro(falha)));

    return () => {
      ativo = false;
    };
  }, []);

  /* Preenche o formulário com o registro em edição. */
  useEffect(() => {
    setNome(registro?.nome ?? "");
    setDescricao(registro?.descricao ?? "");
    setTipo(
      registro?.tipo ? { id: registro.tipo.id, nome: registro.tipo.nome } : null,
    );

    const declarados = registro?.declaracao ?? [];
    setCampos(declarados);
    setValores(valoresIniciais(declarados, registro?.meta ?? {}));
  }, [registro]);

  /**
   * A declaração do tipo escolhido.
   *
   * O registro em edição já vem com ela, então a consulta só acontece quando
   * o tipo muda para outro — inclusive na tela de cadastro, onde ele começa
   * vazio.
   */
  const carregarCampos = useCallback(
    async (tipoId: number) => {
      setCarregandoCampos(true);
      setErroCampos(null);

      try {
        const declarados = await listarCamposDoTipo(tipoId);

        setCampos(declarados);
        // Os valores dos campos que continuam existindo são preservados: a
        // troca de tipo não pode apagar o que já estava digitado.
        setValores((atuais) => valoresIniciais(declarados, atuais));
      } catch (falha) {
        setCampos([]);
        setErroCampos(mensagemDoErro(falha));
      } finally {
        setCarregandoCampos(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!tipo) {
      setCampos([]);

      return;
    }

    // Na abertura da edição a declaração já veio junto do registro.
    if (registro && registro.cadastro_tipo_id === tipo.id) {
      return;
    }

    void carregarCampos(tipo.id);
  }, [tipo, registro, carregarCampos]);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (!tipo) return;

    aoEnviar({
      dados: {
        cadastro_tipo_id: tipo.id,
        nome,
        descricao: descricao.trim() === "" ? null : descricao.trim(),
        meta: metaParaEnvio(campos, valores, catalogo),
      },
      arquivos,
    });
  };

  return (
    <form
      onSubmit={enviar}
      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-6"
    >
      {erroGeral && (
        <div className="mb-5">
          <MensagemErro mensagem={erroGeral} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <CampoAutocomplete<CadastroTipo>
          id="cadastro_tipo_id"
          label="Tipo de cadastro"
          obrigatorio
          valor={tipo?.id ?? null}
          rotuloSelecionado={tipo?.nome ?? ""}
          aoSelecionar={(item) =>
            setTipo(item ? { id: item.id, nome: item.nome } : null)
          }
          buscar={async (termo) => {
            const resultado = await cadastrosTiposApi.listar({
              nome: termo,
              por_pagina: 10,
            });

            return resultado.itens;
          }}
          obterValor={(item) => item.id}
          obterRotulo={(item) => item.nome}
          obterDescricao={(item) => item.slug}
          dica="É o tipo que define os campos personalizados deste cadastro."
          erro={erros.cadastro_tipo_id?.[0]}
        />

        <CampoTexto
          id="nome"
          label="Nome"
          obrigatorio
          valor={nome}
          aoAlterar={setNome}
          placeholder="Latam"
          erro={erros.nome?.[0]}
        />

        <div className="sm:col-span-2">
          <CampoTextarea
            id="descricao"
            label="Descrição"
            valor={descricao}
            aoAlterar={setDescricao}
            placeholder="Uma descrição curta deste cadastro"
            dica="Até 100 caracteres."
            erro={erros.descricao?.[0]}
          />
        </div>
      </div>

      {/* ------------------------ Campos personalizados ------------------- */}
      {tipo && (
        <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-800">
          <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
            Campos personalizados
          </h3>

          {carregandoCampos && (
            <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Carregador tamanho="size-4" />
              Carregando os campos deste tipo...
            </p>
          )}

          {!carregandoCampos && erroCampos && (
            <MensagemErro mensagem={erroCampos} />
          )}

          {!carregandoCampos && !erroCampos && campos.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Este tipo de cadastro ainda não tem campos personalizados
              configurados.
            </p>
          )}

          {!carregandoCampos && campos.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {campos.map((campo) => (
                <CampoDoCadastro
                  key={campo.key}
                  campo={campo}
                  catalogo={catalogo}
                  valor={valores[campo.key]}
                  aoAlterar={(conteudo) =>
                    setValores((atuais) => ({
                      ...atuais,
                      [campo.key]: conteudo,
                    }))
                  }
                  caminho={campo.key}
                  erros={erros}
                  arquivos={arquivos}
                  aoSelecionarArquivo={(caminho, arquivo) =>
                    setArquivos((atuais) => ({ ...atuais, [caminho]: arquivo }))
                  }
                  aoRemoverArquivo={(caminho) => aoRemoverArquivo?.(caminho)}
                  podeAnexar={Boolean(registro)}
                  desabilitado={salvando}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          disabled={salvando || !tipo}
          startIcon={salvando ? <Carregador tamanho="size-4" /> : undefined}
        >
          Salvar
        </Button>
        <button
          type="button"
          onClick={aoCancelar}
          disabled={salvando}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

/**
 * Os valores iniciais de um conjunto de campos, aproveitando o que já existe.
 *
 * Campo que sai da declaração some do formulário, mas o valor dele **não é
 * enviado zerado**: o back só mexe no que está declarado, então o conteúdo
 * antigo continua guardado.
 */
function valoresIniciais(
  campos: CampoPersonalizado[],
  atuais: Record<string, unknown>,
): Record<string, unknown> {
  const valores: Record<string, unknown> = {};

  campos.forEach((campo) => {
    valores[campo.key] = valorParaFormulario(campo, atuais[campo.key]);
  });

  return valores;
}
