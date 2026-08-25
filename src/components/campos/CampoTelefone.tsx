import CampoTexto from "./CampoTexto";

interface CampoTelefoneProps {
  id: string;
  label: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  placeholder?: string;
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  desabilitado?: boolean;
}

/** Aplica a máscara (00) 00000-0000 respeitando o limite de 15 caracteres da API. */
export function formatarTelefone(entrada: string): string {
  const numeros = entrada.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 6) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }

  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

export default function CampoTelefone({
  id,
  label,
  valor,
  aoAlterar,
  placeholder = "(00) 00000-0000",
  erro,
  dica,
  obrigatorio = false,
  desabilitado = false,
}: CampoTelefoneProps) {
  return (
    <CampoTexto
      id={id}
      label={label}
      tipo="tel"
      valor={valor}
      placeholder={placeholder}
      erro={erro}
      dica={dica}
      obrigatorio={obrigatorio}
      desabilitado={desabilitado}
      aoAlterar={(novo) => aoAlterar(formatarTelefone(novo))}
    />
  );
}
