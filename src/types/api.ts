/**
 * Contrato de retorno da API (envelope padronizado do Laravel).
 * Fonte de verdade: htdocs/REGRAS-DO-PROJETO.md — seção 2.
 */

export type TipoResposta =
  | "sucesso"
  | "criado"
  | "info"
  | "aviso"
  | "erro"
  | "nao_autenticado"
  | "sem_permissao"
  | "nao_encontrado"
  | "alerta"
  | "validacao"
  | "erro_servidor";

/** Erros de validação (422): chave do campo => lista de mensagens. */
export type ErrosValidacao = Record<string, string[]>;

/** Bloco "pagination" devolvido pela trait RespostaPadrao. */
export interface Paginacao {
  per_page: number;
  last_page: number;
  prev: string | null;
  next: string | null;
  total: number;
  current_page: number;
  from: number | null;
  to: number | null;
}

/**
 * Envelope da API. A chave dos dados é dinâmica (nomeada pelo recurso),
 * por isso o índice aberto — nunca leia "data".
 */
export interface RespostaApi {
  success: boolean;
  type: TipoResposta;
  message: string;
  pagination?: Paginacao | null;
  errors?: ErrosValidacao;
  timestamp?: string;
  [chave: string]: unknown;
}

/** Parâmetros aceitos por qualquer listagem paginada. */
export interface ParametrosListagem {
  page?: number;
  por_pagina?: number;
  [filtro: string]: string | number | boolean | null | undefined;
}

/** Resultado normalizado de uma listagem. */
export interface ResultadoLista<T> {
  itens: T[];
  paginacao: Paginacao | null;
  mensagem: string;
  /** Verdadeiro quando a API respondeu "aviso" (nenhum registro encontrado). */
  vazio: boolean;
}

/** Variante visual (componente Alert) correspondente ao tipo da resposta. */
export function varianteDoTipo(
  tipo: TipoResposta,
): "success" | "error" | "warning" | "info" {
  switch (tipo) {
    case "sucesso":
    case "criado":
      return "success";
    case "info":
      return "info";
    case "aviso":
    case "alerta":
      return "warning";
    default:
      return "error";
  }
}
