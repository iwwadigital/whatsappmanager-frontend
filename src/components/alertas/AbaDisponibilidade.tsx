import CampoAlternador from "../campos/CampoAlternador";
import CampoData from "../campos/CampoData";
import CampoSelect from "../campos/CampoSelect";
import CampoTexto from "../campos/CampoTexto";
import Label from "../form/Label";
import { PlusIcon, TrashBinIcon } from "../../icons";
import {
  TRECHO_IDA,
  TRECHO_VOLTA,
  ehAmarrado,
  opcoesMes,
  temVolta,
} from "../../utils/alertas";
import { inserirApos } from "../../utils/camposPersonalizados";
import { mesesEmBranco, parDeDatasVazio } from "./formulario";
import type { ErrosValidacao } from "../../types/api";
import type { DadosAlertaDisponibilidade } from "../../types/modelos";

interface AbaDisponibilidadeProps {
  itinerario: number;
  ida: DadosAlertaDisponibilidade[];
  volta: DadosAlertaDisponibilidade[];
  aoAlterarIda: (linhas: DadosAlertaDisponibilidade[]) => void;
  aoAlterarVolta: (linhas: DadosAlertaDisponibilidade[]) => void;
  /** Algum tipo de grupo escolhido é gratuito? Liga a coluna "Esconder". */
  temGrupoGratuito: boolean;
  erros: ErrosValidacao;
  desabilitado: boolean;
}

/**
 * A aba "Disponibilidade", que tem três formas conforme o itinerário:
 *
 * | Itinerário | O que aparece |
 * | --- | --- |
 * | Somente ida | um repetidor de mês + dias |
 * | Ida e volta | dois repetidores, o de ida e o de volta |
 * | Ida e volta amarrado | um repetidor de pares de datas |
 *
 * Nos dois primeiros o repetidor **já abre com os doze meses** a partir do
 * vigente — quem preenche marca os dias nos meses que interessam em vez de
 * adicionar mês a mês. As linhas em branco existem só aqui: a API grava apenas
 * as que tiverem dias.
 *
 * **`dias` é um campo de texto livre**, e é assim de propósito: quem preenche
 * escreve "01,02,03,21" ou "01 (02), 03 (04), 31 (01)", com o dia de volta
 * entre parênteses. Não há formato fechado, e um seletor de datas impediria a
 * notação que essas pessoas já usam.
 *
 * A coluna "Esconder" só aparece quando algum tipo de grupo escolhido é
 * gratuito: ela marca o mês que fica de fora da mensagem enviada a esses
 * grupos.
 */
export default function AbaDisponibilidade({
  itinerario,
  ida,
  volta,
  aoAlterarIda,
  aoAlterarVolta,
  temGrupoGratuito,
  erros,
  desabilitado,
}: AbaDisponibilidadeProps) {
  const amarrado = ehAmarrado(itinerario);
  const comVolta = temVolta(itinerario) && !amarrado;

  /** Limpa os dias e as marcações, sem tirar os meses da tela. */
  const limpar = () => {
    const zerar = (linhas: DadosAlertaDisponibilidade[]) =>
      linhas.map((linha) => ({
        ...linha,
        dias: "",
        data_ida: null,
        data_volta: null,
        esconder_gratis: false,
      }));

    aoAlterarIda(amarrado ? [] : zerar(ida));
    aoAlterarVolta(zerar(volta));
  };

  /** "Esconder todos" força a marcação em todas as linhas dos dois trechos. */
  const esconderTodos = (marcado: boolean) => {
    const marcar = (linhas: DadosAlertaDisponibilidade[]) =>
      linhas.map((linha) => ({ ...linha, esconder_gratis: marcado }));

    aoAlterarIda(marcar(ida));
    aoAlterarVolta(marcar(volta));
  };

  const todosEscondidos =
    [...ida, ...volta].length > 0 &&
    [...ida, ...volta].every((linha) => linha.esconder_gratis);

  return (
    <div>
      {/* --------------------------- Cabeçalho --------------------------- */}
      <div className="mb-5 flex flex-col gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-end">
        {temGrupoGratuito && !amarrado && (
          <div className="sm:w-56">
            <CampoAlternador
              id="esconder-todos"
              label="Esconder todos"
              descricao={todosEscondidos ? "Sim" : "Não"}
              valor={todosEscondidos}
              aoAlterar={esconderTodos}
              desabilitado={desabilitado}
            />
          </div>
        )}

        <button
          type="button"
          onClick={limpar}
          disabled={desabilitado}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
        >
          <TrashBinIcon className="size-5 fill-current" />
          Limpar dados
        </button>
      </div>

      {amarrado ? (
        <>
          <Label>
            Dias Ida e Volta<span className="text-error-500">*</span>
          </Label>
          <ParesDeDatas
            linhas={ida}
            aoAlterar={aoAlterarIda}
            erros={erros}
            desabilitado={desabilitado}
          />
        </>
      ) : (
        <div className="space-y-8">
          <div>
            <Label>
              Datas encontradas para os trechos de IDA
              <span className="text-error-500">*</span>
            </Label>
            <Meses
              linhas={ida}
              aoAlterar={aoAlterarIda}
              trecho={TRECHO_IDA}
              deslocamento={0}
              comEsconder={temGrupoGratuito}
              erros={erros}
              desabilitado={desabilitado}
            />
          </div>

          {comVolta && (
            <div>
              <Label>
                Datas encontradas para os trechos de VOLTA
                <span className="text-error-500">*</span>
              </Label>
              <Meses
                linhas={volta}
                aoAlterar={aoAlterarVolta}
                trecho={TRECHO_VOLTA}
                // Os erros da API vêm em uma lista só, e as linhas de volta
                // entram nela depois das de ida.
                deslocamento={ida.length}
                comEsconder={temGrupoGratuito}
                erros={erros}
                desabilitado={desabilitado}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface MesesProps {
  linhas: DadosAlertaDisponibilidade[];
  aoAlterar: (linhas: DadosAlertaDisponibilidade[]) => void;
  trecho: number;
  deslocamento: number;
  comEsconder: boolean;
  erros: ErrosValidacao;
  desabilitado: boolean;
}

/**
 * O repetidor de mês + dias.
 *
 * No desktop os campos de uma linha ficam lado a lado; no mobile cada um ocupa
 * a largura inteira, empilhados — um select de mês espremido ao lado de um
 * campo de texto não é usável em 400px.
 */
function Meses({
  linhas,
  aoAlterar,
  trecho,
  deslocamento,
  comEsconder,
  erros,
  desabilitado,
}: MesesProps) {
  const alterar = (
    indice: number,
    mudanca: Partial<DadosAlertaDisponibilidade>,
  ) => {
    aoAlterar(
      linhas.map((linha, posicao) =>
        posicao === indice ? { ...linha, ...mudanca } : linha,
      ),
    );
  };

  if (linhas.length === 0) {
    return (
      <button
        type="button"
        onClick={() => aoAlterar(mesesEmBranco(trecho))}
        disabled={desabilitado}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
      >
        <PlusIcon className="size-5 fill-current" />
        Abrir os doze meses
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {linhas.map((linha, indice) => {
        const posicao = deslocamento + indice;

        return (
          <div
            key={indice}
            className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800 sm:grid-cols-12 sm:items-start"
          >
            <div className="sm:col-span-3">
              <CampoSelect
                id={`mes-${trecho}-${indice}`}
                label="Mês"
                ocultarPlaceholder
                valor={linha.mes === null ? "" : String(linha.mes)}
                aoAlterar={(valor) =>
                  alterar(indice, { mes: valor === "" ? null : Number(valor) })
                }
                opcoes={opcoesMes()}
                erro={erros[`disponibilidades.${posicao}.mes`]?.[0]}
                desabilitado={desabilitado}
              />
            </div>

            <div className={comEsconder ? "sm:col-span-6" : "sm:col-span-9"}>
              <CampoTexto
                id={`dias-${trecho}-${indice}`}
                label="Dias"
                valor={linha.dias ?? ""}
                aoAlterar={(valor) => alterar(indice, { dias: valor })}
                placeholder="01,02,03 (04), 21 ou 31 (01)"
                erro={erros[`disponibilidades.${posicao}.dias`]?.[0]}
                desabilitado={desabilitado}
              />
            </div>

            {comEsconder && (
              <div className="sm:col-span-3">
                <CampoAlternador
                  id={`esconder-${trecho}-${indice}`}
                  label="Esconder"
                  descricao={linha.esconder_gratis ? "Sim" : "Não"}
                  valor={linha.esconder_gratis}
                  aoAlterar={(valor) =>
                    alterar(indice, { esconder_gratis: valor })
                  }
                  desabilitado={desabilitado}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ParesDeDatasProps {
  linhas: DadosAlertaDisponibilidade[];
  aoAlterar: (linhas: DadosAlertaDisponibilidade[]) => void;
  erros: ErrosValidacao;
  desabilitado: boolean;
}

/**
 * O repetidor do itinerário amarrado: pares de ida e volta casadas.
 *
 * Aqui as linhas são adicionadas uma a uma — diferente dos meses, não existe
 * um conjunto previsível para abrir de antemão.
 */
function ParesDeDatas({
  linhas,
  aoAlterar,
  erros,
  desabilitado,
}: ParesDeDatasProps) {
  const alterar = (
    indice: number,
    mudanca: Partial<DadosAlertaDisponibilidade>,
  ) => {
    aoAlterar(
      linhas.map((linha, posicao) =>
        posicao === indice ? { ...linha, ...mudanca } : linha,
      ),
    );
  };

  return (
    <div className="space-y-3">
      {linhas.map((linha, indice) => (
        <div
          key={indice}
          className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800 sm:grid-cols-12 sm:items-start"
        >
          <div className="sm:col-span-5">
            <CampoData
              id={`data-ida-${indice}`}
              label="Data de ida"
              obrigatorio
              valor={linha.data_ida ?? ""}
              aoAlterar={(valor) =>
                alterar(indice, { data_ida: valor === "" ? null : valor })
              }
              erro={erros[`disponibilidades.${indice}.data_ida`]?.[0]}
              desabilitado={desabilitado}
            />
          </div>

          <div className="sm:col-span-5">
            <CampoData
              id={`data-volta-${indice}`}
              label="Data de volta"
              obrigatorio
              // A volta nunca é antes da ida: o seletor já nem a oferece.
              minimo={linha.data_ida ?? undefined}
              valor={linha.data_volta ?? ""}
              aoAlterar={(valor) =>
                alterar(indice, { data_volta: valor === "" ? null : valor })
              }
              erro={erros[`disponibilidades.${indice}.data_volta`]?.[0]}
              desabilitado={desabilitado}
            />
          </div>

          <div className="flex gap-3 sm:col-span-2 sm:pt-8">
            <button
              type="button"
              title="Adicionar par abaixo"
              onClick={() =>
                aoAlterar(inserirApos(linhas, indice, parDeDatasVazio()))
              }
              disabled={desabilitado}
              className="text-gray-500 transition hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400"
            >
              <PlusIcon className="size-5 fill-current" />
            </button>
            <button
              type="button"
              title="Remover par"
              onClick={() =>
                aoAlterar(linhas.filter((_, posicao) => posicao !== indice))
              }
              disabled={desabilitado}
              className="text-gray-500 transition hover:text-error-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-error-500"
            >
              <TrashBinIcon className="size-5 fill-current" />
            </button>
          </div>
        </div>
      ))}

      {linhas.length === 0 && (
        <button
          type="button"
          onClick={() => aoAlterar([parDeDatasVazio()])}
          disabled={desabilitado}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
        >
          <PlusIcon className="size-5 fill-current" />
          Adicionar par de datas
        </button>
      )}
    </div>
  );
}
