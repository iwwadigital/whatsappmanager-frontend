/**
 * Campos personalizados de cadastro — o espelho de `App\Cadastros\Campos`.
 *
 * A **declaração** vive em `empresas.cadastros_campos_personalizados` e o
 * **valor** em `cadastros_meta`. Esta tela não conhece a lista de tipos: ela
 * pergunta à API (`GET /cadastros-campos-tipos`) e se monta a partir da
 * resposta. Tipo novo no back aparece aqui sozinho, desde que reaproveite um
 * `formato` de atributo que o front já sabe desenhar.
 */

/** Formatos de atributo que a tela sabe desenhar (`Atributo::FORMATO_*`). */
export type FormatoAtributo =
  | "lista_opcoes"
  | "tipo_cadastro"
  | "formato_arquivo"
  | "lista_campos";

/** Uma opção fixa de um atributo (ex.: os grupos de formato de arquivo). */
export interface OpcaoAtributo {
  chave: string;
  rotulo: string;
  formatos?: string[];
}

/** Um atributo extra da declaração de um campo (`values`, `taxonomy`...). */
export interface AtributoCampo {
  chave: string;
  rotulo: string;
  formato: FormatoAtributo | string;
  obrigatorio: boolean;
  opcoes: OpcaoAtributo[];
}

/** Um tipo de campo do catálogo (`GET /cadastros-campos-tipos`). */
export interface TipoCampoCatalogo {
  chave: string;
  rotulo: string;
  atributos: AtributoCampo[];
  permite_dentro_de_repeater: boolean;
  /** O valor não é preenchido no formulário (o `file` sobe por upload). */
  gravado_fora_do_formulario: boolean;
}

/** Uma opção de um campo do tipo `select`. */
export interface OpcaoCampo {
  label: string;
  key: string;
}

/**
 * A declaração de um campo, como fica gravada no JSON.
 *
 * O índice aberto é proposital: um atributo que esta versão do front não
 * conhece precisa **sobreviver** a uma edição, e não ser descartado.
 */
export interface CampoPersonalizado {
  label: string;
  key: string;
  type: string;
  required: boolean;
  values?: OpcaoCampo[] | null;
  taxonomy?: string | null;
  accept_file?: string | null;
  repeater?: CampoPersonalizado[] | null;
  [atributo: string]: unknown;
}

/** Um grupo da configuração: os campos de um tipo de cadastro. */
export interface GrupoCamposPersonalizados {
  /** Slug do tipo de cadastro a que estes campos pertencem. */
  cadastro_tipo: string;
  campos: CampoPersonalizado[];
}

/**
 * O conteúdo de `empresas.cadastros_campos_personalizados`.
 *
 * Nulo quando a empresa ainda não configurou nenhum campo — a coluna é
 * nullable, e a API devolve `null`.
 */
export type CamposPersonalizados = GrupoCamposPersonalizados[] | null;
