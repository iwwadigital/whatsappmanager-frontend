import {
  DDI_PADRAO,
  formatarTelefoneInternacional,
} from "../components/campos/CampoTelefone";

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
 * Número do Brasil, só com dígitos — espelha `Membro::NUMERO_REGEX_BR` da
 * API: DDI 55 + DDD (11 a 99) + celular (9 + 8 dígitos) ou fixo (2 a 8 + 7).
 */
export const NUMERO_REGEX_BR = /^55[1-9][1-9](?:9\d{8}|[2-8]\d{7})$/;

/**
 * Demais países (E.164), espelhando `Membro::NUMERO_REGEX_INTERNACIONAL`:
 * código do país (nunca começa em zero) + assinante, de 8 a 15 dígitos.
 */
export const NUMERO_REGEX_INTERNACIONAL = /^[1-9]\d{7,14}$/;

/** Tira a máscara: é assim que o número vai para a API. */
export function somenteDigitos(valor?: string | null): string {
  return (valor ?? "").replace(/\D/g, "");
}

/**
 * O número informado é um telefone válido?
 *
 * Com DDI 55 vale a regra completa do Brasil; nos demais países, só o
 * formato E.164 — a mesma decisão da API.
 */
export function numeroValido(valor?: string | null): boolean {
  const digitos = somenteDigitos(valor);

  return digitos.startsWith(DDI_PADRAO)
    ? NUMERO_REGEX_BR.test(digitos)
    : NUMERO_REGEX_INTERNACIONAL.test(digitos);
}

/** Número gravado sem máscara → +55 (00) 00000-0000; vazio vira traço. */
export function formatarNumero(valor?: string | null): string {
  return valor && valor.trim() !== ""
    ? formatarTelefoneInternacional(valor)
    : "—";
}

/**
 * Data/hora da API ("YYYY-MM-DD HH:mm:ss") → valor do input
 * `datetime-local` ("YYYY-MM-DDTHH:mm"). Vazio devolve string vazia.
 */
export function paraCampoDataHora(valor?: string | null): string {
  if (!valor) {
    return "";
  }

  const partes = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(valor);

  return partes ? `${partes[1]}T${partes[2]}` : "";
}

/**
 * Valor do input `datetime-local` → o formato que a API grava.
 * Campo em branco vira null (remove o agendamento).
 */
export function deCampoDataHora(valor: string): string | null {
  if (valor.trim() === "") {
    return null;
  }

  return `${valor.replace("T", " ")}:00`.slice(0, 19);
}
