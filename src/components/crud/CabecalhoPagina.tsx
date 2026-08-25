import type { ReactNode } from "react";
import { Link } from "react-router";

export interface ItemTrilha {
  rotulo: string;
  caminho?: string;
}

interface CabecalhoPaginaProps {
  titulo: string;
  trilha?: ItemTrilha[];
  /** Botões da direita (ex.: "Novo usuário"). */
  acoes?: ReactNode;
}

/** Título da página + trilha de navegação + ações, no padrão do tema. */
export default function CabecalhoPagina({
  titulo,
  trilha = [],
  acoes,
}: CabecalhoPaginaProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {titulo}
        </h2>
        <nav className="mt-1">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link
                to="/"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Início
              </Link>
            </li>
            {trilha.map((item) => (
              <li
                key={item.rotulo}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              >
                <span aria-hidden="true">/</span>
                {item.caminho ? (
                  <Link
                    to={item.caminho}
                    className="hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {item.rotulo}
                  </Link>
                ) : (
                  <span className="text-gray-800 dark:text-white/90">
                    {item.rotulo}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {acoes && <div className="flex flex-wrap items-center gap-3">{acoes}</div>}
    </div>
  );
}
