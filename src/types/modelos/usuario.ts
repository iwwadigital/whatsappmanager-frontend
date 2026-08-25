import type { Empresa } from "./empresa";
import type { UsuarioTipo } from "./usuarioTipo";

/** Model: App\Models\Usuario\Usuario (tabela "usuarios"). */
export interface Usuario {
  id: number;
  empresa_id: number | null;
  usuario_tipo_id: number;
  nome: string;
  email: string;
  telefone: string | null;
  status: boolean;
  empresa?: Empresa | null;
  tipo?: UsuarioTipo | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Dados enviados no cadastro/edição de usuário. */
export interface DadosUsuario {
  empresa_id: number | null;
  usuario_tipo_id: number | null;
  nome: string;
  email: string;
  /** Ausente na edição significa "manter a senha atual". */
  senha?: string;
  telefone: string | null;
  status: boolean;
}
