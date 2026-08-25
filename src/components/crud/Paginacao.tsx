import type { Paginacao as DadosPaginacao } from "../../types/api";

interface PaginacaoProps {
  paginacao: DadosPaginacao | null;
  aoMudarPagina: (pagina: number) => void;
  desabilitado?: boolean;
}

/** Lista de páginas exibidas, com reticências quando há muitas. */
function montarPaginas(atual: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, indice) => indice + 1);
  }

  const paginas: (number | "...")[] = [1];
  const inicio = Math.max(2, atual - 1);
  const fim = Math.min(total - 1, atual + 1);

  if (inicio > 2) {
    paginas.push("...");
  }

  for (let pagina = inicio; pagina <= fim; pagina += 1) {
    paginas.push(pagina);
  }

  if (fim < total - 1) {
    paginas.push("...");
  }

  paginas.push(total);

  return paginas;
}

const CLASSE_NAVEGACAO =
  "flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200";

/** Paginação ligada ao bloco "pagination" devolvido pela API. */
export default function Paginacao({
  paginacao,
  aoMudarPagina,
  desabilitado = false,
}: PaginacaoProps) {
  if (!paginacao || paginacao.last_page <= 1) {
    return null;
  }

  const { current_page: atual, last_page: total } = paginacao;

  return (
    <div className="flex justify-end">
      <div className="flex items-center justify-center gap-4 px-3 py-3">
        <button
          type="button"
          disabled={desabilitado || atual <= 1}
          onClick={() => aoMudarPagina(atual - 1)}
          className={CLASSE_NAVEGACAO}
        >
          Anterior
        </button>

        <ul className="flex items-center gap-1">
          {montarPaginas(atual, total).map((pagina, indice) => (
            <li key={`${pagina}-${indice}`}>
              {pagina === "..." ? (
                <span className="flex h-10 w-10 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  type="button"
                  disabled={desabilitado}
                  onClick={() => aoMudarPagina(pagina)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
                    pagina === atual
                      ? "bg-brand-500 text-white"
                      : "text-gray-700 hover:bg-brand-500/[0.08] hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500"
                  }`}
                >
                  {pagina}
                </button>
              )}
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={desabilitado || atual >= total}
          onClick={() => aoMudarPagina(atual + 1)}
          className={CLASSE_NAVEGACAO}
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
