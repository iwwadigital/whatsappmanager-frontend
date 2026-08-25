import { SearchIcon } from "../../icons";

interface CampoBuscaProps {
  id?: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  placeholder?: string;
  /** Ícone de lupa à esquerda (use apenas no campo principal da barra). */
  comIcone?: boolean;
  className?: string;
  desabilitado?: boolean;
}

/** Campo de texto compacto da barra das listagens (sem rótulo). */
export default function CampoBusca({
  id = "busca",
  valor,
  aoAlterar,
  placeholder = "Buscar...",
  comIcone = true,
  className = "xl:w-[300px]",
  desabilitado = false,
}: CampoBuscaProps) {
  return (
    <div className={`relative ${className}`}>
      {comIcone && (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <SearchIcon className="size-5 fill-current" />
        </span>
      )}
      <input
        id={id}
        type="text"
        value={valor}
        placeholder={placeholder}
        disabled={desabilitado}
        aria-label={placeholder}
        onChange={(evento) => aoAlterar(evento.target.value)}
        className={`h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
          comIcone ? "pl-11" : "pl-4"
        }`}
      />
    </div>
  );
}
