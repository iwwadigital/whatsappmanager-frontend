import { formatarTelefone } from "../components/campos/CampoTelefone";

/** Datas chegam da API no fuso America/Sao_Paulo, como "YYYY-MM-DD HH:mm:ss". */
export function formatarDataHora(valor?: string | null): string {
  if (!valor) {
    return "—";
  }

  const partes = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(valor);

  if (!partes) {
    return valor;
  }

  const [, ano, mes, dia, hora, minuto] = partes;

  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

/** Somente a data, sem a hora. */
export function formatarData(valor?: string | null): string {
  const completo = formatarDataHora(valor);

  return completo === "—" ? completo : completo.split(" ")[0];
}

/** Texto vazio vira traço, para não deixar célula em branco na tabela. */
export function ouTraco(valor?: string | null): string {
  return valor && valor.trim() !== "" ? valor : "—";
}

/**
 * Número de telefone válido no Brasil, só com dígitos — espelha a constante
 * `Membro::NUMERO_REGEX` da API: DDD (11 a 99) + celular (9 + 8 dígitos)
 * ou fixo (2 a 8 + 7 dígitos).
 */
export const NUMERO_REGEX = /^[1-9][1-9](?:9\d{8}|[2-8]\d{7})$/;

/** Tira a máscara: é assim que o número vai para a API. */
export function somenteDigitos(valor?: string | null): string {
  return (valor ?? "").replace(/\D/g, "");
}

/** O número informado é um telefone válido? */
export function numeroValido(valor?: string | null): boolean {
  return NUMERO_REGEX.test(somenteDigitos(valor));
}

/** Número gravado sem máscara → (00) 00000-0000; vazio vira traço. */
export function formatarNumero(valor?: string | null): string {
  return valor && valor.trim() !== "" ? formatarTelefone(valor) : "—";
}
