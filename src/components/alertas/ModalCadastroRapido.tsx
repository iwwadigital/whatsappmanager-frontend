import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import CampoTexto from "../campos/CampoTexto";
import CampoTextarea from "../campos/CampoTextarea";
import Carregador from "../campos/Carregador";
import CampoDoCadastro from "../cadastros/CampoDoCadastro";
import { MensagemErro } from "../crud/EstadosLista";
import {
  cadastrosApi,
  listarCamposDoTipo,
  listarTiposDeCampo,
} from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import {
  metaParaEnvio,
  valorParaFormulario,
} from "../../utils/camposPersonalizados";
import type { ErrosValidacao } from "../../types/api";
import type {
  Cadastro,
  CadastroTipo,
  CampoPersonalizado,
  TipoCampoCatalogo,
} from "../../types/modelos";

interface ModalCadastroRapidoProps {
  aberto: boolean;
  /** O tipo do cadastro a criar — fixo: o modal é do campo que o abriu. */
  tipo: CadastroTipo | null;
  aoFechar: () => void;
  /** Recebe o cadastro criado, para a tela já marcá-lo como selecionado. */
  aoCriar: (cadastro: Cadastro) => void;
}

/**
 * Cadastro rápido de um ponto de atenção, link útil ou rodapé, sem sair do
 * alerta.
 *
 * **Não reaproveita o `FormularioCadastro`** de propósito: aquele é um
 * `<form>` com o seu próprio botão de salvar, e o alerta também é um — um
 * `<form>` dentro do outro não é HTML válido, e o submit de dentro dispararia
 * o de fora. Aqui os campos são os mesmos (`CampoDoCadastro`), montados a
 * partir da mesma declaração, mas o envio é um botão comum.
 *
 * O tipo vem fixo de quem abriu o modal, então não há o seletor de tipo — é o
 * que a especificação pede com "o modal deve ser condizente com o tipo de
 * cadastro em que ele está".
 *
 * Campo do tipo `file` fica de fora: o upload exige o cadastro já criado, e
 * aqui ele nasce e some da tela no mesmo clique. Quem precisa anexar arquivo
 * usa a tela de cadastros.
 */
export default function ModalCadastroRapido({
  aberto,
  tipo,
  aoFechar,
  aoCriar,
}: ModalCadastroRapidoProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [catalogo, setCatalogo] = useState<TipoCampoCatalogo[]>([]);
  const [campos, setCampos] = useState<CampoPersonalizado[]>([]);
  const [valores, setValores] = useState<Record<string, unknown>>({});

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  /* O formulário recomeça vazio a cada abertura. */
  useEffect(() => {
    if (!aberto) return;

    setNome("");
    setDescricao("");
    setValores({});
    setErros({});
    setErroGeral(null);
  }, [aberto]);

  /* Catálogo e declaração do tipo: só quando o modal está aberto. */
  useEffect(() => {
    if (!aberto || !tipo) return;

    let ativo = true;
    setCarregando(true);

    Promise.all([listarTiposDeCampo(), listarCamposDoTipo(tipo.id)])
      .then(([tipos, declarados]) => {
        if (!ativo) return;

        setCatalogo(tipos);
        setCampos(declarados);
        setValores(
          Object.fromEntries(
            declarados.map((campo) => [
              campo.key,
              valorParaFormulario(campo, undefined),
            ]),
          ),
        );
      })
      .catch((falha) => ativo && setErroGeral(mensagemDoErro(falha)))
      .finally(() => ativo && setCarregando(false));

    return () => {
      ativo = false;
    };
  }, [aberto, tipo]);

  const salvar = async () => {
    if (!tipo) return;

    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      const criado = await cadastrosApi.criar({
        cadastro_tipo_id: tipo.id,
        nome,
        descricao: descricao.trim() === "" ? null : descricao.trim(),
        meta: metaParaEnvio(campos, valores, catalogo),
      });

      aoCriar(criado);
      aoFechar();
    } catch (falha) {
      if (falha instanceof ErroApi && falha.ehValidacao) {
        setErros(falha.erros);
      } else {
        setErroGeral(mensagemDoErro(falha));
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      isOpen={aberto}
      onClose={aoFechar}
      // O "X" do `Modal` também é um `<button>` sem `type`, e este modal vive
      // dentro do `<form>` do alerta: deixá-lo ligado faria fechar o modal
      // submeter o alerta. O "Cancelar" abaixo faz o mesmo trabalho.
      showCloseButton={false}
      className="m-4 max-w-2xl rounded-2xl bg-white p-5 dark:bg-gray-900 lg:p-8"
    >
      <h4 className="mb-1 text-lg font-medium text-gray-800 dark:text-white/90">
        Novo registro
      </h4>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        {tipo ? tipo.nome : "Carregando..."}
      </p>

      {erroGeral && (
        <div className="mb-5">
          <MensagemErro mensagem={erroGeral} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <CampoTexto
          id="cadastro-rapido-nome"
          label="Nome"
          obrigatorio
          valor={nome}
          aoAlterar={setNome}
          erro={erros.nome?.[0]}
          desabilitado={salvando}
        />

        <div className="sm:col-span-2">
          <CampoTextarea
            id="cadastro-rapido-descricao"
            label="Descrição"
            valor={descricao}
            aoAlterar={setDescricao}
            linhas={2}
            dica="Até 100 caracteres."
            erro={erros.descricao?.[0]}
            desabilitado={salvando}
          />
        </div>
      </div>

      {carregando && (
        <p className="mt-5 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Carregador tamanho="size-4" />
          Carregando os campos deste tipo...
        </p>
      )}

      {!carregando && campos.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-800">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {campos.map((campo) => (
              <CampoDoCadastro
                key={campo.key}
                campo={campo}
                catalogo={catalogo}
                valor={valores[campo.key]}
                aoAlterar={(conteudo) =>
                  setValores((atuais) => ({ ...atuais, [campo.key]: conteudo }))
                }
                caminho={campo.key}
                erros={erros}
                arquivos={{}}
                aoSelecionarArquivo={() => {}}
                aoRemoverArquivo={() => {}}
                podeAnexar={false}
                desabilitado={salvando}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {/*
          `type="button"` é obrigatório aqui: o `Modal` do tema renderiza
          inline (não usa portal), então este botão fica **dentro do
          `<form>` do alerta** — e um `<button>` sem type dentro de um form é
          submit. Sem isto, salvar o cadastro rápido enviaria o alerta inteiro.
          É o mesmo motivo de o `Button` do tema não servir: ele não aceita
          `type`.
        */}
        <button
          type="button"
          onClick={salvar}
          disabled={salvando || carregando || !tipo}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
        >
          {salvando && <Carregador tamanho="size-4" />}
          Salvar
        </button>
        <button
          type="button"
          onClick={aoFechar}
          disabled={salvando}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
