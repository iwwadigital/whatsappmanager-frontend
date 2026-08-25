import Label from "../form/Label";

interface CampoAlternadorProps {
  id: string;
  label: string;
  /** Texto ao lado do alternador (ex.: "Ativo" / "Inativo"). */
  descricao?: string;
  valor: boolean;
  aoAlterar: (valor: boolean) => void;
  erro?: string;
  desabilitado?: boolean;
}

/** Alternador (switch) controlado, com o visual do tema. */
export default function CampoAlternador({
  id,
  label,
  descricao,
  valor,
  aoAlterar,
  erro,
  desabilitado = false,
}: CampoAlternadorProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={valor}
        disabled={desabilitado}
        onClick={() => aoAlterar(!valor)}
        className={`flex h-11 items-center gap-3 text-sm font-medium ${
          desabilitado
            ? "cursor-not-allowed text-gray-400"
            : "cursor-pointer text-gray-700 dark:text-gray-400"
        }`}
      >
        <span className="relative">
          <span
            className={`block h-6 w-11 rounded-full transition duration-150 ease-linear ${
              desabilitado
                ? "bg-gray-100 dark:bg-gray-800"
                : valor
                  ? "bg-brand-500"
                  : "bg-gray-200 dark:bg-white/10"
            }`}
          />
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 transform rounded-full bg-white shadow-theme-sm duration-150 ease-linear ${
              valor ? "translate-x-full" : "translate-x-0"
            }`}
          />
        </span>
        {descricao}
      </button>
      {erro && <p className="mt-1.5 text-xs text-error-500">{erro}</p>}
    </div>
  );
}
