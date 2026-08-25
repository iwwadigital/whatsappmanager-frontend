import TextArea from "../form/input/TextArea";
import Label from "../form/Label";

interface CampoTextareaProps {
  id: string;
  label: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  placeholder?: string;
  linhas?: number;
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  desabilitado?: boolean;
}

export default function CampoTextarea({
  id,
  label,
  valor,
  aoAlterar,
  placeholder = "",
  linhas = 4,
  erro,
  dica,
  obrigatorio = false,
  desabilitado = false,
}: CampoTextareaProps) {
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
        error={Boolean(erro)}
        hint={erro ?? dica}
        onChange={aoAlterar}
      />
    </div>
  );
}
