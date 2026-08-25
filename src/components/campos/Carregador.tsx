interface CarregadorProps {
  /** Tamanho do ícone (classe utilitária size-*). */
  tamanho?: string;
  className?: string;
}

/** Loader circular reaproveitado nos estados de carregamento. */
export default function Carregador({
  tamanho = "size-5",
  className = "",
}: CarregadorProps) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={`inline-block animate-spin text-gray-200 dark:text-gray-700 ${className}`}
    >
      <svg
        className={tamanho}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="3" />
        <path
          d="M18.5 10C18.5 5.30558 14.6944 1.5 10 1.5"
          className="stroke-brand-500"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
