import { useEffect, useState, type FormEvent } from "react";
import CampoTextarea from "../campos/CampoTextarea";
import CampoTexto from "../campos/CampoTexto";
import Carregador from "../campos/Carregador";
import Button from "../ui/button/Button";
import { MensagemErro } from "../crud/EstadosLista";
import type { ErrosValidacao } from "../../types/api";
import type { AcaoTipo, DadosAcaoTipo } from "../../types/modelos";

interface FormularioAcaoTipoProps {
  /** Registro em edição; ausente no cadastro. */
  registro?: AcaoTipo | null;
  salvando: boolean;
  erros: ErrosValidacao;
  erroGeral?: string | null;
  aoEnviar: (dados: DadosAcaoTipo) => void;
  aoCancelar: () => void;
}

/** Formulário compartilhado pelas telas de cadastro e edição. */
export default function FormularioAcaoTipo({
  registro,
  salvando,
  erros,
  erroGeral,
  aoEnviar,
  aoCancelar,
}: FormularioAcaoTipoProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [funcao, setFuncao] = useState("");

  useEffect(() => {
    setNome(registro?.nome ?? "");
    setDescricao(registro?.descricao ?? "");
    setFuncao(registro?.funcao ?? "");
  }, [registro]);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    aoEnviar({
      nome,
      descricao: descricao.trim() === "" ? null : descricao.trim(),
      funcao,
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
        <CampoTexto
          id="nome"
          label="Nome"
          obrigatorio
          valor={nome}
          aoAlterar={setNome}
          placeholder="Criar grupo"
          erro={erros.nome?.[0]}
        />

        <CampoTexto
          id="funcao"
          label="Função"
          obrigatorio
          valor={funcao}
          aoAlterar={setFuncao}
          placeholder="grupo.criar"
          dica="Chave da função que o robô executa, no formato recurso.acao."
          erro={erros.funcao?.[0]}
        />

        <div className="sm:col-span-2">
          <CampoTextarea
            id="descricao"
            label="Descrição"
            valor={descricao}
            aoAlterar={setDescricao}
            placeholder="O que este tipo de ação faz"
            erro={erros.descricao?.[0]}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          disabled={salvando}
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
