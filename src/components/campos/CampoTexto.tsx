import type { ReactNode } from "react";
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
  /**
   * Botão (ou qualquer conteúdo) à direita do campo, na mesma linha.
   *
   * É o que põe o "Gerar link curto" ao lado da url longo, sem que o campo
   * precise conhecer a ação: quem desenha a tela decide o que vai ali.
   */
  acao?: ReactNode;
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
  acao,
}: CampoTextoProps) {
  const campo = (
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
  );

  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {obrigatorio && <span className="text-error-500">*</span>}
      </Label>
      {acao ? (
        <div className="flex items-start gap-2">
          <div className="flex-1">{campo}</div>
          {acao}
        </div>
      ) : (
        campo
      )}
    </div>
  );
}
