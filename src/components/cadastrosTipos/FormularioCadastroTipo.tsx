import { useEffect, useState, type FormEvent } from "react";
import CampoTexto from "../campos/CampoTexto";
import Carregador from "../campos/Carregador";
import Button from "../ui/button/Button";
import { MensagemErro } from "../crud/EstadosLista";
import { gerarSlug } from "../../utils/slug";
import type { ErrosValidacao } from "../../types/api";
import type { CadastroTipo, DadosCadastroTipo } from "../../types/modelos";

interface FormularioCadastroTipoProps {
  /** Registro em edição; ausente no cadastro. */
  registro?: CadastroTipo | null;
  salvando: boolean;
  erros: ErrosValidacao;
  erroGeral?: string | null;
  aoEnviar: (dados: DadosCadastroTipo) => void;
  aoCancelar: () => void;
}

/** Formulário compartilhado pelas telas de cadastro e edição. */
export default function FormularioCadastroTipo({
  registro,
  salvando,
  erros,
  erroGeral,
  aoEnviar,
  aoCancelar,
}: FormularioCadastroTipoProps) {
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    setNome(registro?.nome ?? "");
    setSlug(registro?.slug ?? "");
    // Na edição o slug já existe: não é regerado ao mexer no nome.
    setSlugManual(Boolean(registro));
  }, [registro]);

  const alterarNome = (valor: string) => {
    setNome(valor);

    if (!slugManual) {
      setSlug(gerarSlug(valor));
    }
  };

  const alterarSlug = (valor: string) => {
    setSlugManual(true);
    setSlug(gerarSlug(valor));
  };

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    aoEnviar({
      nome,
      slug: slug.trim() === "" ? gerarSlug(nome) : slug,
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
          aoAlterar={alterarNome}
          placeholder="Companhia aérea"
          erro={erros.nome?.[0]}
        />

        <CampoTexto
          id="slug"
          label="Slug"
          obrigatorio
          valor={slug}
          aoAlterar={alterarSlug}
          placeholder="companhia-aerea"
          dica="Gerado a partir do nome; pode ser ajustado. É por ele que os campos personalizados apontam para este tipo."
          erro={erros.slug?.[0]}
        />
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
