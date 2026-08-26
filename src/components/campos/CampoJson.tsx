import TextArea from "../form/input/TextArea";
import Label from "../form/Label";

interface CampoJsonProps {
  id: string;
  label: string;
  /** Texto do editor (JSON em formato livre). */
  valor: string;
  aoAlterar: (valor: string) => void;
  placeholder?: string;
  linhas?: number;
  /** Mensagem de erro devolvida pela API (errors.<campo>[0]). */
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  desabilitado?: boolean;
}

/** Objeto/lista devolvido pela API vira o texto exibido no editor. */
export function jsonParaTexto(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") {
    return "";
  }

  return JSON.stringify(valor, null, 2);
}

/** O texto do editor volta a ser JSON; vazio vira null. */
export function textoParaJson(texto: string): unknown {
  if (texto.trim() === "") {
    return null;
  }

  return JSON.parse(texto);
}

/** Vazio é válido; qualquer outro conteúdo precisa ser um JSON legítimo. */
export function jsonValido(texto: string): boolean {
  try {
    textoParaJson(texto);

    return true;
  } catch {
    return false;
  }
}

/** Editor de JSON livre, com aviso imediato quando o conteúdo não compila. */
export default function CampoJson({
  id,
  label,
  valor,
  aoAlterar,
  placeholder = '{\n  "campo": "valor"\n}',
  linhas = 6,
  erro,
  dica,
  obrigatorio = false,
  desabilitado = false,
}: CampoJsonProps) {
  const erroFormato = jsonValido(valor)
    ? undefined
    : "JSON inválido: revise o conteúdo antes de salvar.";

  const mensagem = erro ?? erroFormato;

  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {obrigatorio && <span className="text-error-500">*</span>}
      </Label>
      <TextArea
        rows={linhas}
        value={valor}
        placeholder={placeholder}
        disabled={desabilitado}
        error={Boolean(mensagem)}
        hint={mensagem ?? dica}
        onChange={aoAlterar}
        className="font-mono"
      />
    </div>
  );
}
