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
  /**
   * Número com DDI (E.164), como o dos membros: a máscara vira
   * `+55 (00) 00000-0000` e aceita também números de fora do Brasil.
   */
  internacional?: boolean;
}

/** DDI do Brasil — o padrão do formulário de membros. */
export const DDI_PADRAO = "55";

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

/**
 * Máscara de número com DDI (E.164, no máximo 15 dígitos).
 *
 * Com DDI 55 o número recebe a máscara do Brasil — `+55 (11) 99999-8888`.
 * Nos demais países não dá para agrupar sem uma base de planos de numeração,
 * então fica `+` seguido dos dígitos.
 */
export function formatarTelefoneInternacional(entrada: string): string {
  const digitos = entrada.replace(/\D/g, "").slice(0, 15);

  if (digitos === "") {
    return "";
  }

  if (!digitos.startsWith(DDI_PADRAO)) {
    return `+${digitos}`;
  }

  // Brasil: DDI + DDD + assinante, no máximo 13 dígitos.
  const nacional = digitos.slice(0, 13).slice(2);

  if (nacional.length <= 2) {
    return `+${DDI_PADRAO} ${nacional}`.trimEnd();
  }

  const ddd = nacional.slice(0, 2);
  const assinante = nacional.slice(2);

  if (assinante.length <= 4) {
    return `+${DDI_PADRAO} (${ddd}) ${assinante}`;
  }

  if (assinante.length <= 8) {
    return `+${DDI_PADRAO} (${ddd}) ${assinante.slice(0, 4)}-${assinante.slice(4)}`;
  }

  return `+${DDI_PADRAO} (${ddd}) ${assinante.slice(0, 5)}-${assinante.slice(5)}`;
}

export default function CampoTelefone({
  id,
  label,
  valor,
  aoAlterar,
  placeholder,
  erro,
  dica,
  obrigatorio = false,
  desabilitado = false,
  internacional = false,
}: CampoTelefoneProps) {
  const formatar = internacional
    ? formatarTelefoneInternacional
    : formatarTelefone;

  return (
    <CampoTexto
      id={id}
      label={label}
      tipo="tel"
      valor={valor}
      placeholder={
        placeholder ??
        (internacional ? "+55 (00) 00000-0000" : "(00) 00000-0000")
      }
      erro={erro}
      dica={dica}
      obrigatorio={obrigatorio}
      desabilitado={desabilitado}
      aoAlterar={(novo) => aoAlterar(formatar(novo))}
    />
  );
}
