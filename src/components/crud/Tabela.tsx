import type { ReactNode } from "react";
import { TableCell } from "../ui/table";

/** Classe da faixa do cabeçalho da tabela. */
export const CLASSE_CABECALHO =
  "border-t border-gray-100 dark:border-white/[0.05]";

const CLASSE_TH = "px-4 py-3 border border-gray-100 dark:border-white/[0.05]";

const CLASSE_TD =
  "px-4 py-4 border border-gray-100 dark:border-white/[0.05] text-theme-sm whitespace-nowrap";

interface CelulaCabecalhoProps {
  children: ReactNode;
  className?: string;
}

/** Célula de cabeçalho (th) no padrão das listagens. */
export function CelulaCabecalho({
  children,
  className = "",
}: CelulaCabecalhoProps) {
  return (
    <TableCell isHeader className={`${CLASSE_TH} ${className}`}>
      <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">
        {children}
      </p>
    </TableCell>
  );
}

interface CelulaProps {
  children?: ReactNode;
  /** Primeira coluna da linha, com mais destaque. */
  destaque?: boolean;
  className?: string;
}

/** Célula de conteúdo (td) no padrão das listagens. */
export function Celula({
  children,
  destaque = false,
  className = "",
}: CelulaProps) {
  const cor = destaque
    ? "font-medium text-gray-800 dark:text-white"
    : "font-normal text-gray-800 dark:text-gray-400";

  return (
    <TableCell className={`${CLASSE_TD} ${cor} ${className}`}>
      {children}
    </TableCell>
  );
}
