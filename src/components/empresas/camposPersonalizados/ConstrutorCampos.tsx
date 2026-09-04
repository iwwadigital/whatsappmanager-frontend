import CampoSelect from "../../campos/CampoSelect";
import EditorCampo from "./EditorCampo";
import {
  campoVazio,
  grupoVazio,
  inserirApos,
  tipoPadraoDoCatalogo,
} from "../../../utils/camposPersonalizados";
import type { ErrosValidacao } from "../../../types/api";
import type {
  CadastroTipo,
  CampoPersonalizado,
  GrupoCamposPersonalizados,
  TipoCampoCatalogo,
} from "../../../types/modelos";
import { TrashBinIcon, PlusIcon } from "../../../icons";
import { gruposApi } from "../../../services/api";

interface ConstrutorCamposProps {
  valor: GrupoCamposPersonalizados[];
  aoAlterar: (grupos: GrupoCamposPersonalizados[]) => void;
  catalogo: TipoCampoCatalogo[];
  tiposDeCadastro: CadastroTipo[];
  erros: ErrosValidacao;
  desabilitado?: boolean;
}

/** Prefixo dos erros que a API devolve para este campo. */
const RAIZ = "cadastros_campos_personalizados";

/**
 * O construtor de campos personalizados da empresa.
 *
 * Substitui o antigo textarea de JSON: a estrutura é a mesma que vai para
 * `empresas.cadastros_campos_personalizados`, mas montada em formulários.
 *
 * São dois níveis:
 *
 * 1. **grupos** — um por tipo de cadastro (`cadastro_tipo`, gravado pelo slug);
 * 2. **campos** — a declaração de cada campo daquele tipo.
 *
 * A lista de tipos de campo vem do catálogo da API, nunca escrita aqui.
 *
 * Os dois "+" de cada linha (o do grupo e o do campo) inserem o item novo
 * **logo abaixo** daquele em que se clicou; o botão "Adicionar campo", no pé
 * do grupo, continua acrescentando no fim.
 */
export default function ConstrutorCampos({
  valor,
  aoAlterar,
  catalogo,
  tiposDeCadastro,
  erros,
  desabilitado = false,
}: ConstrutorCamposProps) {
  const tipoPadrao = tipoPadraoDoCatalogo(catalogo);

  const alterarGrupo = (
    indice: number,
    mudanca: Partial<GrupoCamposPersonalizados>,
  ) =>
    aoAlterar(
      valor.map((grupo, posicao) =>
        posicao === indice ? { ...grupo, ...mudanca } : grupo,
      ),
    );

  const alterarCampos = (indice: number, campos: CampoPersonalizado[]) =>
    alterarGrupo(indice, { campos });

  // Um tipo de cadastro por grupo: os já usados saem da lista dos outros.
  const usados = valor.map((grupo) => grupo.cadastro_tipo);

  return (
    <div className="space-y-5">
      {erros[RAIZ]?.[0] && (
        <p className="text-theme-xs text-error-500">{erros[RAIZ][0]}</p>
      )}

      {valor.map((grupo, indice) => (
        <div
          key={indice}
          className="border-b border-gray-200 py-5 dark:border-gray-800"
        >
          <div className="relative mb-6 flex flex-wrap items-start justify-between gap-3">
            <CampoSelect
              id={`grupo-${indice}-tipo`}
              label="Tipo de cadastro"
              obrigatorio
              valor={grupo.cadastro_tipo}
              aoAlterar={(slug) => alterarGrupo(indice, { cadastro_tipo: slug })}
              opcoes={tiposDeCadastro
                .filter(
                  (tipo) =>
                    tipo.slug === grupo.cadastro_tipo ||
                    !usados.includes(tipo.slug),
                )
                .map((tipo) => ({ valor: tipo.slug, rotulo: tipo.nome }))}
              dica="Os campos abaixo aparecem nos cadastros deste tipo."
              erro={erros[`${RAIZ}.${indice}.cadastro_tipo`]?.[0]}
              desabilitado={desabilitado}
              className="w-full"
            />
            <div className="flex absolute -top-3 right-0 gap-3">
              <button
                type="button"
                title="Adicionar tipo de cadastro abaixo"
                onClick={() =>
                  aoAlterar(inserirApos(valor, indice, grupoVazio(tipoPadrao)))
                }
                disabled={desabilitado}
                className="h-11 text-theme-xs text-gray-500  hover:text-brand-600 dark:text-gray-400 disabled:cursor-not-allowed  disabled:opacity-50"
              >
                <PlusIcon className="size-5 fill-current" />
              </button>
              <button
                type="button"
                title="Remover tipo de cadastro"
                onClick={() =>
                  aoAlterar(valor.filter((_, posicao) => posicao !== indice))
                }
                disabled={desabilitado}
                className="h-11 text-gray-500 transition hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500"
              >
                <TrashBinIcon className="size-5 fill-current" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {grupo.campos.map((campo, posicao) => (
              <EditorCampo
                key={posicao}
                campo={campo}
                catalogo={catalogo}
                tiposDeCadastro={tiposDeCadastro}
                aoAlterar={(alterado) =>
                  alterarCampos(
                    indice,
                    grupo.campos.map((item, atual) =>
                      atual === posicao ? alterado : item,
                    ),
                  )
                }
                aoAdicionarAbaixo={() =>
                  alterarCampos(
                    indice,
                    inserirApos(grupo.campos, posicao, campoVazio(tipoPadrao)),
                  )
                }
                aoRemover={() =>
                  alterarCampos(
                    indice,
                    grupo.campos.filter((_, atual) => atual !== posicao),
                  )
                }
                caminhoErro={`${RAIZ}.${indice}.campos.${posicao}`}
                erros={erros}
                desabilitado={desabilitado}
              />
            ))}
          </div>

          {erros[`${RAIZ}.${indice}.campos`]?.[0] && (
            <p className="mt-3 text-theme-xs text-error-500">
              {erros[`${RAIZ}.${indice}.campos`][0]}
            </p>
          )}
          {grupo.campos.length === 0 ? (
              <button
              type="button"
              onClick={() =>
                alterarCampos(indice, [...grupo.campos, campoVazio(tipoPadrao)])
              }
              disabled={desabilitado}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Adicionar campo
            </button> 
          ) : null}
          
        </div>
      ))}

      {/* Sem nenhum grupo não há onde clicar no "+" da linha: um botão
          solitário devolve a tela ao estado inicial. */}
      {valor.length === 0 && (
        <button
          type="button"
          onClick={() => aoAlterar([grupoVazio(tipoPadrao)])}
          disabled={desabilitado}
          className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar tipo de cadastro
        </button>
      )}
    </div>
  );
}
