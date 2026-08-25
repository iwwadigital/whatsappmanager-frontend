import type { ReactNode } from "react";
import { Link } from "react-router";

interface BotaoNovoProps {
  para: string;
  children: ReactNode;
}

/** Botão principal da barra de listagem (ex.: "Novo usuário"). */
export default function BotaoNovo({ para, children }: BotaoNovoProps) {
  return (
    <Link
      to={para}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
    >
      {children}
    </Link>
  );
}
