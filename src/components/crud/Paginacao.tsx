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

/** Paginação ligada ao bloco "pagination" devolvido pela API. */
export default function Paginacao({
  paginacao,
  aoMudarPagina,
  desabilitado = false,
}: PaginacaoProps) {
  if (!paginacao || paginacao.last_page <= 1) {
    return null;
  }

  const { current_page: atual, last_page: total, from, to } = paginacao;
  const classeBotao =
    "flex h-10 items-center justify-center rounded-lg px-3.5 text-sm font-medium text-gray-700 hover:bg-brand-500 hover:text-white disabled:pointer-events-none disabled:opacity-50 dark:text-gray-400 dark:hover:text-white";

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-800 sm:flex-row">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Mostrando {from ?? 0} a {to ?? 0} de {paginacao.total} registro(s)
      </p>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          disabled={desabilitado || atual <= 1}
          onClick={() => aoMudarPagina(atual - 1)}
          className={classeBotao}
        >
          Anterior
        </button>

        <ul className="hidden items-center gap-0.5 sm:flex">
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
                      : "text-gray-700 hover:bg-brand-500 hover:text-white dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {pagina}
                </button>
              )}
            </li>
          ))}
        </ul>

        <span className="text-sm font-medium text-gray-700 dark:text-gray-400 sm:hidden">
          Página {atual} de {total}
        </span>

        <button
          type="button"
          disabled={desabilitado || atual >= total}
          onClick={() => aoMudarPagina(atual + 1)}
          className={classeBotao}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
