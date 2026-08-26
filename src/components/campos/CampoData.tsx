import Label from "../form/Label";

interface CampoDataProps {
  id: string;
  /** Sem rótulo o campo fica compacto, para a barra de filtros. */
  label?: string;
  /** Data no formato ISO (YYYY-MM-DD), como a API espera. */
  valor: string;
  aoAlterar: (valor: string) => void;
  /** Limites do seletor (ex.: data final nunca antes da inicial). */
  minimo?: string;
  maximo?: string;
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  desabilitado?: boolean;
  className?: string;
  /** Texto lido por leitores de tela quando não há rótulo. */
  descricao?: string;
}

/** Campo de data (YYYY-MM-DD), usado em formulários e em filtros. */
export default function CampoData({
  id,
  label,
  valor,
  aoAlterar,
  minimo,
  maximo,
  erro,
  dica,
  obrigatorio = false,
  desabilitado = false,
  className = "",
  descricao,
}: CampoDataProps) {
  const classesEstado = erro
    ? "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500"
    : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800";

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {obrigatorio && <span className="text-error-500">*</span>}
        </Label>
      )}

      <input
        id={id}
        name={id}
        type="date"
        value={valor}
        min={minimo}
        max={maximo}
        disabled={desabilitado}
        aria-label={label ?? descricao}
        onChange={(evento) => aoAlterar(evento.target.value)}
        className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:outline-hidden focus:ring-3 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-900 dark:text-white/90 dark:[color-scheme:dark] ${classesEstado}`}
      />

      {(erro ?? dica) && (
        <p
          className={`mt-1.5 text-xs ${erro ? "text-error-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          {erro ?? dica}
        </p>
      )}
    </div>
  );
}
