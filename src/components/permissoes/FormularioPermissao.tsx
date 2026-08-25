import { useEffect, useState, type FormEvent } from "react";
import CampoTexto from "../campos/CampoTexto";
import CampoTextarea from "../campos/CampoTextarea";
import Carregador from "../campos/Carregador";
import Button from "../ui/button/Button";
import { MensagemErro } from "../crud/EstadosLista";
import type { ErrosValidacao } from "../../types/api";
import type { DadosPermissao, Permissao } from "../../types/modelos";

interface FormularioPermissaoProps {
  registro?: Permissao | null;
  salvando: boolean;
  erros: ErrosValidacao;
  erroGeral?: string | null;
  aoEnviar: (dados: DadosPermissao) => void;
  aoCancelar: () => void;
}

export default function FormularioPermissao({
  registro,
  salvando,
  erros,
  erroGeral,
  aoEnviar,
  aoCancelar,
}: FormularioPermissaoProps) {
  const [nome, setNome] = useState("");
  const [permissao, setPermissao] = useState("");
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    setNome(registro?.nome ?? "");
    setPermissao(registro?.permissao ?? "");
    setDescricao(registro?.descricao ?? "");
  }, [registro]);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    aoEnviar({
      nome,
      permissao,
      descricao: descricao.trim() === "" ? null : descricao,
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
          placeholder="Ex.: Visualizar usuários"
          erro={erros.nome?.[0]}
        />

        <CampoTexto
          id="permissao"
          label="Chave da permissão"
          obrigatorio
          valor={permissao}
          aoAlterar={setPermissao}
          placeholder="usuario.ver"
          dica="Padrão recurso.acao, apenas letras minúsculas, números e underline."
          erro={erros.permissao?.[0]}
        />

        <div className="sm:col-span-2">
          <CampoTextarea
            id="descricao"
            label="Descrição"
            valor={descricao}
            aoAlterar={setDescricao}
            placeholder="Descreva o que esta permissão libera"
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
