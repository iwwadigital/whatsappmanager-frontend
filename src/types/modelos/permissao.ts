/** Model: App\Models\Permissao\Permissao (tabela "permissoes"). */
export interface Permissao {
  id: number;
  nome: string;
  /** Chave no padrão recurso.acao (ex.: "usuario.ver"). */
  permissao: string;
  descricao: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Dados enviados no cadastro/edição de permissão. */
export interface DadosPermissao {
  nome: string;
  permissao: string;
  descricao: string | null;
}
