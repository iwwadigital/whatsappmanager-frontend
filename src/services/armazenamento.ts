import type { EmpresaResumo, UsuarioAutenticado } from "../types/modelos";

/** Chaves usadas no localStorage. */
const CHAVE_TOKEN = "wm.token";
const CHAVE_USUARIO = "wm.usuario";
const CHAVE_EMPRESA = "wm.empresa";

/** Empresa usada enquanto o usuário sem vínculo não escolher outra. */
export const EMPRESA_PADRAO_ID = 1;

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

/**
 * Empresa ativa — o recorte de conteúdo escolhido no seletor do header.
 * Guardada junto com o usuário, e enviada à API no cabeçalho X-Empresa-Id.
 */
export function lerEmpresaAtiva(): EmpresaResumo | null {
  try {
    const bruto = window.localStorage.getItem(CHAVE_EMPRESA);

    return bruto ? (JSON.parse(bruto) as EmpresaResumo) : null;
  } catch {
    return null;
  }
}

/** Id da empresa ativa; null quando ainda não há empresa gravada. */
export function lerEmpresaAtivaId(): number | null {
  return lerEmpresaAtiva()?.id ?? null;
}

export function gravarEmpresaAtiva(empresa: EmpresaResumo): void {
  try {
    window.localStorage.setItem(CHAVE_EMPRESA, JSON.stringify(empresa));
  } catch {
    /* armazenamento indisponível */
  }
}

export function limparSessao(): void {
  try {
    window.localStorage.removeItem(CHAVE_TOKEN);
    window.localStorage.removeItem(CHAVE_USUARIO);
    window.localStorage.removeItem(CHAVE_EMPRESA);
  } catch {
    /* armazenamento indisponível */
  }
}
