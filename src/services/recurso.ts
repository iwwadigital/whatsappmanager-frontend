import type {
  ParametrosListagem,
  RespostaApi,
  ResultadoLista,
} from "../types/api";
import { baixarArquivo, requisitar } from "./http";

export interface ConfiguracaoRecurso {
  /** Caminho do recurso na API, sem barras (ex.: "usuarios"). */
  caminho: string;
  /** Chave dinâmica devolvida na listagem (ex.: "usuarios"). */
  chaveLista: string;
  /** Chave dinâmica devolvida no item (ex.: "usuario"). */
  chaveItem: string;
}

export interface Recurso<T, D> {
  configuracao: ConfiguracaoRecurso;
  listar(parametros?: ParametrosListagem): Promise<ResultadoLista<T>>;
  mostrar(id: number | string): Promise<T>;
  criar(dados: D): Promise<T>;
  atualizar(id: number | string, dados: D): Promise<T>;
  remover(id: number | string): Promise<string>;
  baixar(opcoes?: {
    caminho?: string;
    parametros?: ParametrosListagem;
    nomeArquivo?: string;
  }): Promise<void>;
}

function extrairItem<T>(resposta: RespostaApi, chave: string): T {
  return resposta[chave] as T;
}

/**
 * Fábrica do CRUD: um único ponto para get (index), show, post,
 * update, delete e download de qualquer recurso da API.
 */
export function criarRecurso<T, D>(
  configuracao: ConfiguracaoRecurso,
): Recurso<T, D> {
  const { caminho, chaveLista, chaveItem } = configuracao;

  return {
    configuracao,

    /** GET /<recurso> — listagem paginada e filtrada. */
    async listar(parametros: ParametrosListagem = {}) {
      const resposta = await requisitar({ caminho, parametros });

      // "aviso" = nenhum registro encontrado (HTTP 200, success false).
      const vazio = resposta.type === "aviso";
      const itens = vazio ? [] : ((resposta[chaveLista] as T[] | undefined) ?? []);

      return {
        itens,
        paginacao: resposta.pagination ?? null,
        mensagem: resposta.message,
        vazio,
      };
    },

    /** GET /<recurso>/{id} */
    async mostrar(id) {
      const resposta = await requisitar({ caminho: `${caminho}/${id}` });

      return extrairItem<T>(resposta, chaveItem);
    },

    /** POST /<recurso> */
    async criar(dados) {
      const resposta = await requisitar({
        metodo: "POST",
        caminho,
        dados,
      });

      return extrairItem<T>(resposta, chaveItem);
    },

    /** PUT /<recurso>/{id} */
    async atualizar(id, dados) {
      const resposta = await requisitar({
        metodo: "PUT",
        caminho: `${caminho}/${id}`,
        dados,
      });

      return extrairItem<T>(resposta, chaveItem);
    },

    /** DELETE /<recurso>/{id} — devolve a mensagem de sucesso. */
    async remover(id) {
      const resposta = await requisitar({
        metodo: "DELETE",
        caminho: `${caminho}/${id}`,
      });

      return resposta.message;
    },

    /** GET de arquivo (ex.: exportação da listagem). */
    async baixar(opcoes = {}) {
      await baixarArquivo({
        caminho: opcoes.caminho ?? `${caminho}/download`,
        parametros: opcoes.parametros,
        nomeArquivo: opcoes.nomeArquivo,
      });
    },
  };
}
