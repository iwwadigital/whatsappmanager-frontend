import Input from "../form/input/InputField";
import Label from "../form/Label";

interface CampoTextoProps {
  id: string;
  label: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  tipo?: "text" | "email" | "number" | "tel" | "date";
  placeholder?: string;
  /** Mensagem de erro devolvida pela API (errors.<campo>[0]). */
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  desabilitado?: boolean;
}

export default function CampoTexto({
  id,
  label,
  valor,
  aoAlterar,
  tipo = "text",
  placeholder,
  erro,
  dica,
  obrigatorio = false,
  desabilitado = false,
}: CampoTextoProps) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {obrigatorio && <span className="text-error-500">*</span>}
      </Label>
      <Input
        id={id}
        name={id}
        type={tipo}
        value={valor}
        placeholder={placeholder}
        disabled={desabilitado}
        error={Boolean(erro)}
        hint={erro ?? dica}
        onChange={(evento) => aoAlterar(evento.target.value)}
      />
    </div>
  );
}
