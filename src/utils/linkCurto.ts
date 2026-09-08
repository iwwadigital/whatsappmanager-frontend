import type { CampoPersonalizado } from "../types/modelos";
import { gerarSlug } from "./slug";

/**
 * Onde o botão "Gerar link curto" aparece.
 *
 * É uma regra **da tela**, e por isso mora aqui: a API não sabe (nem precisa
 * saber) em que campo o link vai parar — `POST /cadastros/link-curto` recebe
 * uma URL e devolve o endereço curto, e serve a qualquer outra área.
 *
 * O acordo é de nome: um cadastro do tipo **Link Curto** com os campos
 * personalizados **Url longo** e **Url curto** ganha o botão ao lado da url
 * longo; clicar nele preenche a url curto, que continua editável à mão.
 *
 * A comparação é feita pelo slug da `key` **ou** do `label`, então tanto
 * `url-longo` quanto `url_longo` ou "Url Longo" são reconhecidos — quem
 * configura os campos digita o rótulo, não a chave.
 */

/** Slug do tipo de cadastro que ganha o botão. */
export const TIPO_LINK_CURTO = "link-curto";

/** O campo com a URL de origem. */
export const CAMPO_URL_LONGO = "url-longo";

/** O campo que recebe o link gerado. */
export const CAMPO_URL_CURTO = "url-curto";

/** O tipo de cadastro (pelo slug) é o "Link Curto"? */
export function ehTipoLinkCurto(slug: string | null | undefined): boolean {
  return Boolean(slug) && gerarSlug(String(slug)) === TIPO_LINK_CURTO;
}

/** O campo é a "Url longo"? */
export function ehCampoUrlLongo(campo: CampoPersonalizado): boolean {
  return combina(campo, CAMPO_URL_LONGO);
}

/** O campo declarado como "Url curto", quando o tipo tiver um. */
export function campoUrlCurto(
  campos: CampoPersonalizado[],
): CampoPersonalizado | undefined {
  return campos.find((campo) => combina(campo, CAMPO_URL_CURTO));
}

/** A chave (ou o rótulo) do campo corresponde ao nome esperado? */
function combina(campo: CampoPersonalizado, esperado: string): boolean {
  return (
    gerarSlug(campo.key ?? "") === esperado ||
    gerarSlug(campo.label ?? "") === esperado
  );
}
