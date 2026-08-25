import type { UsuarioAutenticado } from "../types/modelos";

/** Chaves usadas no localStorage. */
const CHAVE_TOKEN = "wm.token";
const CHAVE_USUARIO = "wm.usuario";

export function lerToken(): string | null {
  try {
    return window.localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function gravarToken(token: string): void {
  try {
    window.localStorage.setItem(CHAVE_TOKEN, token);
  } catch {
    /* armazenamento indisponível (aba anônima, cookies bloqueados) */
  }
}

export function lerUsuario(): UsuarioAutenticado | null {
  try {
    const bruto = window.localStorage.getItem(CHAVE_USUARIO);

    return bruto ? (JSON.parse(bruto) as UsuarioAutenticado) : null;
  } catch {
    return null;
  }
}

export function gravarUsuario(usuario: UsuarioAutenticado): void {
  try {
    window.localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
  } catch {
    /* armazenamento indisponível */
  }
}

export function limparSessao(): void {
  try {
    window.localStorage.removeItem(CHAVE_TOKEN);
    window.localStorage.removeItem(CHAVE_USUARIO);
  } catch {
    /* armazenamento indisponível */
  }
}
