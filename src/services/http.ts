import type {
  ErrosValidacao,
  ParametrosListagem,
  RespostaApi,
  TipoResposta,
} from "../types/api";
import { lerEmpresaAtivaId, lerToken, limparSessao } from "./armazenamento";

/** Evento disparado quando a API responde 401 (token ausente/expirado). */
export const EVENTO_SESSAO_EXPIRADA = "wm:sessao-expirada";

/**
 * Cabeçalho com a empresa escolhida no header. Vai em toda requisição
 * autenticada; o middleware `empresa` da API o ignora para usuários que já
 * têm empresa própria.
 */
export const CABECALHO_EMPRESA = "X-Empresa-Id";

const URL_BASE = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"
).replace(/\/+$/, "");

export type MetodoHttp = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Erro padronizado: toda falha da API chega às telas por aqui. */
export class ErroApi extends Error {
  readonly status: number;
  readonly tipo: TipoResposta;
  readonly erros: ErrosValidacao;
  readonly resposta: RespostaApi | null;

  constructor(
    mensagem: string,
    status: number,
    tipo: TipoResposta,
    erros: ErrosValidacao = {},
    resposta: RespostaApi | null = null,
  ) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
    this.tipo = tipo;
    this.erros = erros;
    this.resposta = resposta;
  }

  get ehValidacao(): boolean {
    return this.tipo === "validacao";
  }

  get ehSemPermissao(): boolean {
    return this.tipo === "sem_permissao" || this.status === 403;
  }
}

/** Monta a query string ignorando valores vazios. */
export function montarParametros(parametros: ParametrosListagem = {}): string {
  const busca = new URLSearchParams();

  Object.entries(parametros).forEach(([chave, valor]) => {
    if (valor === null || valor === undefined || valor === "") {
      return;
    }

    busca.append(chave, String(valor));
  });

  const consulta = busca.toString();

  return consulta ? `?${consulta}` : "";
}

/** Token da sessão + empresa ativa: o contexto de toda requisição autenticada. */
function cabecalhosAutenticacao(): Record<string, string> {
  const cabecalhos: Record<string, string> = {};
  const token = lerToken();

  if (token) {
    cabecalhos.Authorization = `Bearer ${token}`;
  }

  const empresaId = lerEmpresaAtivaId();

  if (empresaId !== null) {
    cabecalhos[CABECALHO_EMPRESA] = String(empresaId);
  }

  return cabecalhos;
}

function montarCabecalhos(autenticar: boolean, temCorpo: boolean): HeadersInit {
  const cabecalhos: Record<string, string> = {
    Accept: "application/json",
  };

  if (temCorpo) {
    cabecalhos["Content-Type"] = "application/json";
  }

  if (autenticar) {
    Object.assign(cabecalhos, cabecalhosAutenticacao());
  }

  return cabecalhos;
}

function tratarSessaoExpirada(): void {
  limparSessao();
  window.dispatchEvent(new CustomEvent(EVENTO_SESSAO_EXPIRADA));
}

export interface OpcoesRequisicao {
  metodo?: MetodoHttp;
  caminho: string;
  parametros?: ParametrosListagem;
  dados?: unknown;
  /** Envia o token Bearer (padrão: sim). */
  autenticar?: boolean;
}

/**
 * Requisição geral da aplicação: injeta o token, envia/recebe JSON,
 * trata 401 (derruba a sessão) e converte qualquer falha em ErroApi.
 */
export async function requisitar({
  metodo = "GET",
  caminho,
  parametros,
  dados,
  autenticar = true,
}: OpcoesRequisicao): Promise<RespostaApi> {
  const temCorpo = dados !== undefined && metodo !== "GET";
  const url = `${URL_BASE}/${caminho.replace(/^\/+/, "")}${montarParametros(parametros)}`;

  let resposta: Response;

  try {
    resposta = await fetch(url, {
      method: metodo,
      headers: montarCabecalhos(autenticar, temCorpo),
      body: temCorpo ? JSON.stringify(dados) : undefined,
    });
  } catch {
    throw new ErroApi(
      "Não foi possível se comunicar com o servidor. Verifique sua conexão.",
      0,
      "erro_servidor",
    );
  }

  let corpo: RespostaApi | null = null;

  try {
    corpo = (await resposta.json()) as RespostaApi;
  } catch {
    corpo = null;
  }

  if (resposta.status === 401) {
    tratarSessaoExpirada();
  }

  if (!resposta.ok) {
    throw new ErroApi(
      corpo?.message ?? "Não foi possível concluir a operação.",
      resposta.status,
      corpo?.type ?? "erro_servidor",
      corpo?.errors ?? {},
      corpo,
    );
  }

  if (!corpo) {
    throw new ErroApi(
      "Resposta inválida do servidor.",
      resposta.status,
      "erro_servidor",
    );
  }

  return corpo;
}

export interface OpcoesDownload {
  caminho: string;
  parametros?: ParametrosListagem;
  /** Nome sugerido do arquivo; sem ele o nome vem do Content-Disposition. */
  nomeArquivo?: string;
}

/** Baixa um arquivo da API respeitando o token e o tratamento de erros. */
export async function baixarArquivo({
  caminho,
  parametros,
  nomeArquivo,
}: OpcoesDownload): Promise<void> {
  const url = `${URL_BASE}/${caminho.replace(/^\/+/, "")}${montarParametros(parametros)}`;

  const resposta = await fetch(url, {
    method: "GET",
    headers: cabecalhosAutenticacao(),
  });

  if (resposta.status === 401) {
    tratarSessaoExpirada();
  }

  const tipoConteudo = resposta.headers.get("Content-Type") ?? "";

  // Falha vem no envelope JSON, mesmo em rota de download.
  if (!resposta.ok || tipoConteudo.includes("application/json")) {
    let corpo: RespostaApi | null = null;

    try {
      corpo = (await resposta.json()) as RespostaApi;
    } catch {
      corpo = null;
    }

    throw new ErroApi(
      corpo?.message ?? "Não foi possível baixar o arquivo.",
      resposta.status,
      corpo?.type ?? "erro_servidor",
      corpo?.errors ?? {},
      corpo,
    );
  }

  const disposicao = resposta.headers.get("Content-Disposition") ?? "";
  const nomeDaResposta = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposicao)?.[1];
  const blob = await resposta.blob();
  const urlObjeto = window.URL.createObjectURL(blob);
  const ancora = document.createElement("a");

  ancora.href = urlObjeto;
  ancora.download = nomeArquivo ?? decodeURIComponent(nomeDaResposta ?? "arquivo");
  document.body.appendChild(ancora);
  ancora.click();
  ancora.remove();
  window.URL.revokeObjectURL(urlObjeto);
}

/** Mensagem amigável para qualquer erro capturado em tela. */
export function mensagemDoErro(erro: unknown): string {
  if (erro instanceof ErroApi) {
    return erro.message;
  }

  if (erro instanceof Error && erro.message) {
    return erro.message;
  }

  return "Não foi possível concluir a operação.";
}
