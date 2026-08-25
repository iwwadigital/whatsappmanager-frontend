import type { Empresa } from "./empresa";
import type { UsuarioTipo } from "./usuarioTipo";

/** Formato devolvido por Usuario::paraRetorno() (login e /eu). */
export interface UsuarioAutenticado {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  status: boolean;
  empresa: Empresa | null;
  tipo: UsuarioTipo | null;
  /** Chaves no padrão recurso.acao, herdadas do tipo de usuário. */
  permissoes: string[];
}

/** Bloco "autenticacao" devolvido pelo login. */
export interface Autenticacao {
  token: string;
  tipo_token: string;
  usuario: UsuarioAutenticado;
}
