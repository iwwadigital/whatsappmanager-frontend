import type { ReactNode } from "react";

interface ItemDetalheProps {
  rotulo: string;
  children: ReactNode;
}

/** Linha rótulo/valor das páginas de visualização. */
export default function ItemDetalhe({ rotulo, children }: ItemDetalheProps) {
  return (
    <div className="border-b border-gray-100 py-3.5 last:border-0 dark:border-gray-800">
      <dt className="text-theme-xs uppercase text-gray-500 dark:text-gray-400">
        {rotulo}
      </dt>
      <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">
        {children}
      </dd>
    </div>
  );
}
