/** Tipo de cadastro no formato reduzido (vínculo com o cadastro). */
export interface CadastroTipoResumo {
  id: number;
  nome: string;
  /**
   * Chave estável do tipo. É por ela que apontam os campos personalizados
   * da empresa e o atributo `taxonomy` de um campo.
   */
  slug: string;
}

/** Model: App\Models\Cadastro\CadastroTipo (tabela "cadastros_tipos"). */
export interface CadastroTipo extends CadastroTipoResumo {
  empresa_id?: number;
  /** Quantos cadastros usam este tipo (withCount do controller). */
  cadastros_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Dados enviados no cadastro/edição de tipo de cadastro. */
export interface DadosCadastroTipo {
  nome: string;
  slug: string;
}
