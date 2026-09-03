import type {
  CampoPersonalizado,
  GrupoCamposPersonalizados,
  TipoCampoCatalogo,
} from "../types/modelos";
import { gerarSlug } from "./slug";

/**
 * Apoio das telas de campos personalizados.
 *
 * Espelha `App\Support\CamposPersonalizados` e `App\Cadastros\Campos` no que
 * a tela precisa saber — **e só isso**. A lista de tipos não está aqui: ela
 * vem da API (`listarTiposDeCampo`), para um tipo novo no back não exigir
 * uma alteração no front.
 */

/** Mesmo formato aceito pelo back (`CamposPersonalizados::CHAVE_REGEX`). */
export const CHAVE_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Chave de um campo (ou de uma opção) a partir do texto digitado.
 *
 * É o mesmo slug das demais chaves do sistema — no back,
 * `CamposPersonalizados::gerarChave()` também é `Str::slug` —, então
 * reaproveita o utilitário em vez de manter uma segunda implementação.
 */
export const gerarChave = gerarSlug;

/** Um campo em branco, pronto para entrar na lista. */
export function campoVazio(tipoPadrao: string): CampoPersonalizado {
  return {
    label: "",
    key: "",
    type: tipoPadrao,
    required: false,
    values: null,
    taxonomy: null,
    accept_file: null,
    repeater: null,
  };
}

/** Um grupo em branco (os campos de um tipo de cadastro). */
export function grupoVazio(): GrupoCamposPersonalizados {
  return { cadastro_tipo: "", campos: [] };
}

/** O tipo do catálogo correspondente a um campo; `undefined` se sumiu. */
export function tipoDoCampo(
  catalogo: TipoCampoCatalogo[],
  campo: CampoPersonalizado,
): TipoCampoCatalogo | undefined {
  return catalogo.find((tipo) => tipo.chave === campo.type);
}

/**
 * Zera os atributos que o tipo escolhido **não** usa.
 *
 * Trocar um campo de `select` para `date` não pode deixar as opções antigas
 * penduradas: elas iriam para o banco e voltariam a valer se o tipo fosse
 * trocado de volta sem querer.
 *
 * Atributo que esta versão do front não conhece é **mantido**: uma
 * configuração gravada por uma versão mais nova sobrevive a uma mais antiga.
 */
export function ajustarAtributos(
  campo: CampoPersonalizado,
  tipo: TipoCampoCatalogo | undefined,
  catalogo: TipoCampoCatalogo[],
): CampoPersonalizado {
  const usados = new Set((tipo?.atributos ?? []).map((atributo) => atributo.chave));

  // Todos os atributos que o catálogo inteiro conhece: são os únicos que
  // podem ser zerados com segurança.
  const conhecidos = new Set(
    catalogo.flatMap((item) => item.atributos.map((atributo) => atributo.chave)),
  );

  const ajustado: CampoPersonalizado = { ...campo };

  conhecidos.forEach((chave) => {
    if (!usados.has(chave)) {
      ajustado[chave] = null;
    }
  });

  return ajustado;
}

/**
 * O valor inicial de um atributo recém-habilitado, pelo formato dele.
 *
 * Formato desconhecido vira `null` — o campo aparece marcado como não
 * suportado em vez de a tela quebrar.
 */
export function valorInicialDoAtributo(formato: string): unknown {
  switch (formato) {
    case "lista_opcoes":
      return [{ label: "", key: "" }];
    case "lista_campos":
      return [];
    default:
      return "";
  }
}

/**
 * Os campos declarados para um tipo de cadastro, pelo slug dele — o espelho
 * de `CamposPersonalizados::camposDoTipo()`.
 */
export function camposDoTipo(
  definicao: GrupoCamposPersonalizados[] | null | undefined,
  slug: string | null | undefined,
): CampoPersonalizado[] {
  if (!definicao || !slug) return [];

  return definicao.find((grupo) => grupo.cadastro_tipo === slug)?.campos ?? [];
}

/**
 * O `accept` de um `<input type="file">` para o grupo de formatos escolhido.
 * Grupo "todos" (ou desconhecido) devolve vazio: aceita qualquer arquivo.
 */
export function aceitosDoGrupo(
  atributoFormatos: { chave: string; formatos?: string[] }[],
  grupo: string | null | undefined,
): string {
  const formatos = atributoFormatos.find((item) => item.chave === grupo)?.formatos;

  return formatos && formatos.length > 0
    ? formatos.map((extensao) => `.${extensao}`).join(",")
    : "";
}

/* ------------------------- Valores do cadastro -------------------------- */

/**
 * O valor que o formulário guarda, a partir do que a API devolveu.
 *
 * O estado do formulário espelha o `meta` da API — inclusive o `{id, nome}`
 * de um `taxonomy`, para o autocomplete conseguir mostrar o nome do que já
 * está escolhido sem uma segunda consulta. A conversão para o formato que a
 * API recebe acontece só no envio ({@link valorParaEnvio}).
 */
export function valorParaFormulario(
  campo: CampoPersonalizado,
  valor: unknown,
): unknown {
  if (campo.type === "repeater") {
    return Array.isArray(valor) ? valor : [];
  }

  return valor ?? "";
}

/**
 * O valor que vai para a API.
 *
 * Campo gravado fora do formulário (o `file`) devolve `undefined` e é
 * omitido do payload: quem cuida dele é a rota de upload, e mandá-lo aqui
 * apagaria o arquivo já anexado.
 */
export function valorParaEnvio(
  campo: CampoPersonalizado,
  valor: unknown,
  catalogo: TipoCampoCatalogo[],
): unknown {
  const tipo = tipoDoCampo(catalogo, campo);

  if (tipo?.gravado_fora_do_formulario) {
    return undefined;
  }

  if (campo.type === "taxonomy") {
    if (valor && typeof valor === "object" && "id" in valor) {
      return (valor as { id: number }).id;
    }

    return valor === "" ? null : valor;
  }

  if (campo.type === "repeater") {
    const linhas = Array.isArray(valor) ? valor : [];
    const subcampos = campo.repeater ?? [];

    return linhas.map((linha) => {
      const convertida: Record<string, unknown> = {};

      subcampos.forEach((subcampo) => {
        const conteudo = valorParaEnvio(
          subcampo,
          (linha as Record<string, unknown>)[subcampo.key],
          catalogo,
        );

        if (conteudo !== undefined) {
          convertida[subcampo.key] = conteudo;
        }
      });

      return convertida;
    });
  }

  return valor === "" ? null : valor;
}

/**
 * O payload `meta` inteiro, pronto para o store/update.
 */
export function metaParaEnvio(
  campos: CampoPersonalizado[],
  valores: Record<string, unknown>,
  catalogo: TipoCampoCatalogo[],
): Record<string, unknown> {
  const meta: Record<string, unknown> = {};

  campos.forEach((campo) => {
    const valor = valorParaEnvio(campo, valores[campo.key], catalogo);

    if (valor !== undefined) {
      meta[campo.key] = valor;
    }
  });

  return meta;
}

/** Uma linha em branco de repetidor, com os subcampos já presentes. */
export function linhaVazia(
  subcampos: CampoPersonalizado[],
): Record<string, unknown> {
  const linha: Record<string, unknown> = {};

  subcampos.forEach((subcampo) => {
    linha[subcampo.key] = subcampo.type === "repeater" ? [] : "";
  });

  return linha;
}
