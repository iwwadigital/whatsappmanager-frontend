import type { CadastroTipoResumo } from "./cadastroTipo";
import type { CampoPersonalizado } from "./campoPersonalizado";

/** Valor devolvido por um campo do tipo `file`. */
export interface ValorArquivo {
  caminho: string;
  url: string;
  nome: string;
}

/** Valor devolvido por um campo do tipo `taxonomy`. */
export interface ValorTaxonomia {
  id: number;
  /** Nulo quando o cadastro apontado foi excluído. */
  nome: string | null;
}

/** Uma linha de um campo do tipo `repeater`. */
export type LinhaRepetidor = Record<string, unknown>;

/**
 * Os valores dos campos personalizados, na chave (`key`) de cada campo.
 *
 * O tipo do valor depende do tipo do campo: texto e data vêm como string,
 * `select` como a key da opção, `file` como {@link ValorArquivo},
 * `taxonomy` como {@link ValorTaxonomia} e `repeater` como uma lista de
 * linhas. Campo de tipo desconhecido volta como texto puro.
 */
export type MetaCadastro = Record<string, unknown>;

/** Model: App\Models\Cadastro\Cadastro (tabela "cadastros"). */
export interface Cadastro {
  id: number;
  cadastro_tipo_id: number;
  nome: string;
  descricao: string | null;
  tipo?: CadastroTipoResumo | null;
  /**
   * A declaração dos campos personalizados do **tipo** deste cadastro, como
   * a empresa a configurou. Vem no show/store/update — não na listagem.
   */
  declaracao?: CampoPersonalizado[];
  /** Os valores preenchidos. Também só no show/store/update. */
  meta?: MetaCadastro;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Dados enviados no cadastro/edição de um cadastro. */
export interface DadosCadastro {
  cadastro_tipo_id: number;
  nome: string;
  descricao: string | null;
  /** Valores dos campos personalizados, na chave de cada campo. */
  meta: Record<string, unknown>;
}
