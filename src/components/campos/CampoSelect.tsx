import Label from "../form/Label";
import { ChevronDownIcon } from "../../icons";

export interface OpcaoSelect {
  valor: string;
  rotulo: string;
}

interface CampoSelectProps {
  id: string;
  /** Sem rótulo o campo fica compacto, para a barra de filtros. */
  label?: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  opcoes: OpcaoSelect[];
  /** Texto da primeira opção (valor vazio). */
  placeholder?: string;
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  desabilitado?: boolean;
  className?: string;
}

/** Select controlado (o Select do tema guarda estado próprio). */
export default function CampoSelect({
  id,
  label,
  valor,
  aoAlterar,
  opcoes,
  placeholder = "Selecione",
  erro,
  dica,
  obrigatorio = false,
  desabilitado = false,
  className = "",
}: CampoSelectProps) {
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
      <div className="relative">
        <select
          id={id}
          name={id}
          value={valor}
          disabled={desabilitado}
          aria-label={label ?? placeholder}
          onChange={(evento) => aoAlterar(evento.target.value)}
          className={`h-11 w-full appearance-none rounded-lg border bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-40 dark:bg-gray-900 dark:disabled:bg-gray-800 ${classesEstado} ${
            valor
              ? "text-gray-800 dark:text-white/90"
              : "text-gray-400 dark:text-gray-400"
          }`}
        >
          <option
            value=""
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {placeholder}
          </option>
          {opcoes.map((opcao) => (
            <option
              key={opcao.valor}
              value={opcao.valor}
              className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
            >
              {opcao.rotulo}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
      </div>
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
