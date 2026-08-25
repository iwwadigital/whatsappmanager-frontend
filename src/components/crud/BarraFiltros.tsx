import type { FormEvent, ReactNode } from "react";
import Button from "../ui/button/Button";

interface BarraFiltrosProps {
  /** Campos do formulário de filtragem. */
  children: ReactNode;
  aoFiltrar: () => void;
  aoLimpar: () => void;
  filtrando?: boolean;
}

/** Formulário de filtragem das listagens (espelha os scopes do Model). */
export default function BarraFiltros({
  children,
  aoFiltrar,
  aoLimpar,
  filtrando = false,
}: BarraFiltrosProps) {
  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    aoFiltrar();
  };

  return (
    <form
      onSubmit={enviar}
      className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-6"
    >
      <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
        Filtros
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button size="sm" disabled={filtrando}>
          Filtrar
        </Button>
        <button
          type="button"
          onClick={aoLimpar}
          disabled={filtrando}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
