import Badge from "../../ui/badge/Badge";
import { tipoDoCampo } from "../../../utils/camposPersonalizados";
import type {
  AtributoCampo,
  CadastroTipo,
  CampoPersonalizado,
  GrupoCamposPersonalizados,
  OpcaoCampo,
  TipoCampoCatalogo,
} from "../../../types/modelos";

interface ResumoCamposPersonalizadosProps {
  grupos: GrupoCamposPersonalizados[];
  catalogo: TipoCampoCatalogo[];
  /** Para trocar o slug gravado pelo nome do tipo de cadastro. */
  tiposDeCadastro: CadastroTipo[];
}

/**
 * A configuração de campos personalizados da empresa, só de leitura.
 *
 * É o "grupo de campos" do ACF: um cartão por tipo de cadastro, e dentro
 * dele a lista dos campos com o nome, a chave gravada, o tipo e o que o tipo
 * escolhido configurou (as opções de um select, o tipo apontado por um
 * vínculo, os formatos de um arquivo).
 *
 * Como o construtor, ela não conhece a lista de tipos: lê o catálogo da API
 * e descreve o que encontrar. Tipo que sumiu do catálogo aparece marcado, em
 * vez de desaparecer da tela.
 */
export default function ResumoCamposPersonalizados({
  grupos,
  catalogo,
  tiposDeCadastro,
}: ResumoCamposPersonalizadosProps) {
  const nomeDoTipo = (slug: string) =>
    tiposDeCadastro.find((tipo) => tipo.slug === slug)?.nome ?? slug;

  return (
    <div className="space-y-5">
      {grupos.map((grupo, indice) => (
        <section
          key={`${grupo.cadastro_tipo}-${indice}`}
          className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]">
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                {nomeDoTipo(grupo.cadastro_tipo) || "Tipo não informado"}
              </h4>
              <p className="mt-0.5 font-mono text-theme-xs text-gray-500 dark:text-gray-400">
                {grupo.cadastro_tipo || "—"}
              </p>
            </div>
            <Badge size="sm" color="light">
              {grupo.campos.length === 1
                ? "1 campo"
                : `${grupo.campos.length} campos`}
            </Badge>
          </header>

          {grupo.campos.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Nenhum campo declarado para este tipo.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {grupo.campos.map((campo, posicao) => (
                <LinhaCampo
                  key={`${campo.key}-${posicao}`}
                  campo={campo}
                  catalogo={catalogo}
                  tiposDeCadastro={tiposDeCadastro}
                />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

interface LinhaCampoProps {
  campo: CampoPersonalizado;
  catalogo: TipoCampoCatalogo[];
  tiposDeCadastro: CadastroTipo[];
}

/** Um campo da configuração: nome, chave, tipo e o que ele configurou. */
function LinhaCampo({ campo, catalogo, tiposDeCadastro }: LinhaCampoProps) {
  const tipo = tipoDoCampo(catalogo, campo);

  // Os campos de dentro de um repetidor são desenhados recuados, e não como
  // mais uma linha da descrição.
  const subcampos = (tipo?.atributos ?? []).find(
    (atributo) => atributo.formato === "lista_campos",
  );

  const descricoes = (tipo?.atributos ?? [])
    .filter((atributo) => atributo.formato !== "lista_campos")
    .map((atributo) => ({
      atributo,
      texto: descreverAtributo(atributo, campo[atributo.chave], tiposDeCadastro),
    }))
    .filter((item) => item.texto !== "");

  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {campo.label || "Campo sem nome"}
          </p>
          <p className="mt-0.5 font-mono text-theme-xs text-gray-500 dark:text-gray-400">
            {campo.key || "—"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {campo.required && (
            <Badge size="sm" color="warning">
              Obrigatório
            </Badge>
          )}
          <Badge size="sm" color={tipo ? "info" : "error"}>
            {tipo?.rotulo ?? `${campo.type} (tipo não reconhecido)`}
          </Badge>
        </div>
      </div>

      {descricoes.length > 0 && (
        <dl className="mt-2 space-y-1">
          {descricoes.map(({ atributo, texto }) => (
            <div key={atributo.chave} className="flex flex-wrap gap-2">
              <dt className="text-theme-xs text-gray-500 dark:text-gray-400">
                {atributo.rotulo}:
              </dt>
              <dd className="text-theme-xs text-gray-700 dark:text-gray-300">
                {texto}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {subcampos && (
        <div className="mt-3 border-l-2 border-gray-200 pl-3 dark:border-gray-800">
          <p className="mb-1 text-theme-xs text-gray-500 dark:text-gray-400">
            {subcampos.rotulo}
          </p>

          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {((campo[subcampos.chave] as CampoPersonalizado[]) ?? []).map(
              (subcampo, posicao) => (
                <LinhaCampo
                  key={`${subcampo.key}-${posicao}`}
                  campo={subcampo}
                  catalogo={catalogo}
                  tiposDeCadastro={tiposDeCadastro}
                />
              ),
            )}
          </ul>
        </div>
      )}
    </li>
  );
}

/**
 * O valor de um atributo em texto, pelo `formato` que o back declarou — o
 * espelho de leitura do `EditorAtributo`.
 *
 * Formato que esta versão não descreve devolve vazio: a linha some, em vez
 * de mostrar um JSON cru.
 */
function descreverAtributo(
  atributo: AtributoCampo,
  valor: unknown,
  tiposDeCadastro: CadastroTipo[],
): string {
  if (atributo.formato === "lista_opcoes") {
    const opcoes = (Array.isArray(valor) ? valor : []) as OpcaoCampo[];

    return opcoes.map((opcao) => opcao.label || opcao.key).join(", ");
  }

  if (atributo.formato === "tipo_cadastro" && typeof valor === "string") {
    return tiposDeCadastro.find((tipo) => tipo.slug === valor)?.nome ?? valor;
  }

  if (typeof valor === "string" && atributo.opcoes.length > 0) {
    return atributo.opcoes.find((opcao) => opcao.chave === valor)?.rotulo ?? valor;
  }

  return typeof valor === "string" ? valor : "";
}
