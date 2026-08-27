import Tooltip from "../ui/tooltip/Tooltip";

interface TextoTruncadoProps {
  texto?: string | null;
  /** Quantidade de caracteres exibida antes das reticências. */
  limite?: number;
}

/**
 * Célula de texto longo: mostra o começo e revela o conteúdo completo em um
 * tooltip. Texto curto (ou vazio) é exibido direto, sem tooltip.
 */
export default function TextoTruncado({
  texto,
  limite = 50,
}: TextoTruncadoProps) {
  const conteudo = texto?.trim() ?? "";

  if (conteudo === "") {
    return <>—</>;
  }

  if (conteudo.length <= limite) {
    return <>{conteudo}</>;
  }

  return (
    <Tooltip
      content={
        <span className="block w-56 whitespace-normal break-words text-left sm:w-72">
          {conteudo}
        </span>
      }
    >
      <span className="cursor-help border-b border-dotted border-gray-300 dark:border-gray-600">
        {`${conteudo.slice(0, limite)}…`}
      </span>
    </Tooltip>
  );
}
