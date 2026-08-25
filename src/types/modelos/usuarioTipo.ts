import type { Permissao } from "./permissao";

/** Model: App\Models\Usuario\UsuarioTipo (tabela "usuarios_tipos"). */
export interface UsuarioTipo {
  id: number;
  nome: string;
  /** Devolvido apenas no show (o index não carrega o relacionamento). */
  permissoes?: Permissao[];
  created_at?: string | null;
  updated_at?: string | null;
}

/** Dados enviados no cadastro/edição de tipo de usuário. */
export interface DadosUsuarioTipo {
  nome: string;
  /** Ids das permissões vinculadas (sync no controller). */
  permissoes: number[];
}
