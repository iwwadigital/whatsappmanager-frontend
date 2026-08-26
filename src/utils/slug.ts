/** Marcas de acento separadas pela normalização NFD. */
const ACENTOS = /[̀-ͯ]/g;

/**
 * Slug no mesmo formato do backend (GrupoTipo::gerarSlug, via Str::slug):
 * minúsculas, sem acentos, palavras separadas por hífen.
 */
export function gerarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(ACENTOS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}
