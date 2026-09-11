import { useEffect, useState } from "react";
import CampoAlternador from "../campos/CampoAlternador";
import CampoAutocomplete from "../campos/CampoAutocomplete";
import CampoSelect from "../campos/CampoSelect";
import CampoTexto from "../campos/CampoTexto";
import { MensagemErro } from "../crud/EstadosLista";
import { PlusIcon, TrashBinIcon } from "../../icons";
import {
  buscarCadastrosDoTipo,
  listarCadastrosDoTipo,
} from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import {
  TIPO_MOEDA,
  TIPO_PROGRAMA_FIDELIDADE,
  siglaDaMoeda,
  temVolta,
} from "../../utils/alertas";
import { inserirApos } from "../../utils/camposPersonalizados";
import { programaVazio, type LinhaPrograma } from "./formulario";
import type { ErrosValidacao } from "../../types/api";
import type { Cadastro } from "../../types/modelos";
import type { OpcaoSelect } from "../campos/CampoSelect";

interface AbaProgramasProps {
  itinerario: number;
  programas: LinhaPrograma[];
  aoAlterar: (programas: LinhaPrograma[]) => void;
  erros: ErrosValidacao;
  desabilitado: boolean;
}

/**
 * A aba "Programas de fidelidade": um repetidor com o custo da oferta em cada
 * programa.
 *
 * Os campos de volta **somem** quando o itinerário é "somente ida" — não é só
 * uma questão de espaço: a API zera esses campos nesse caso, e deixá-los na
 * tela prometeria um valor que não seria gravado.
 *
 * Os botões são os mesmos do repetidor de campos personalizados (**+** insere
 * a linha logo abaixo daquela em que se clicou, a lixeira remove), para o
 * repetidor do alerta não se comportar diferente do resto do sistema.
 */
export default function AbaProgramas({
  itinerario,
  programas,
  aoAlterar,
  erros,
  desabilitado,
}: AbaProgramasProps) {
  const { moedas, carregando, erro: erroMoedas } = useMoedas();
  const comVolta = temVolta(itinerario);

  const alterar = <C extends keyof LinhaPrograma>(
    indice: number,
    campo: C,
    valor: LinhaPrograma[C],
  ) => {
    aoAlterar(
      programas.map((programa, posicao) =>
        posicao === indice ? { ...programa, [campo]: valor } : programa,
      ),
    );
  };

  return (
    <div className="space-y-4">
      {/* A moeda das taxas é obrigatória: sem a lista, o formulário não tem
          como ser salvo, e um select vazio não explicaria por quê. */}
      {erroMoedas && <MensagemErro mensagem={erroMoedas} />}

      {programas.map((programa, indice) => (
        <div
          key={indice}
          className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-theme-xs font-medium text-gray-500 dark:text-gray-400">
              Programa {indice + 1}
            </span>

            <div className="flex gap-3">
              <button
                type="button"
                title="Adicionar programa abaixo"
                onClick={() =>
                  aoAlterar(inserirApos(programas, indice, programaVazio()))
                }
                disabled={desabilitado}
                className="text-gray-500 transition hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400"
              >
                <PlusIcon className="size-5 fill-current" />
              </button>
              <button
                type="button"
                title="Remover programa"
                onClick={() =>
                  aoAlterar(programas.filter((_, posicao) => posicao !== indice))
                }
                disabled={desabilitado}
                className="text-gray-500 transition hover:text-error-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-error-500"
              >
                <TrashBinIcon className="size-5 fill-current" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <CampoAutocomplete<Cadastro>
              id={`programa-${indice}`}
              label="Programa de fidelidade"
              obrigatorio
              valor={programa.programa_id}
              rotuloSelecionado={programa.programa_nome}
              aoSelecionar={(item) =>
                aoAlterar(
                  programas.map((linha, posicao) =>
                    posicao === indice
                      ? {
                          ...linha,
                          programa_id: item?.id ?? null,
                          programa_nome: item?.nome ?? "",
                        }
                      : linha,
                  ),
                )
              }
              buscar={(termo) =>
                buscarCadastrosDoTipo(TIPO_PROGRAMA_FIDELIDADE, termo)
              }
              obterValor={(item) => item.id}
              obterRotulo={(item) => item.nome}
              erro={erros[`programas.${indice}.programa_id`]?.[0]}
              desabilitado={desabilitado}
            />

            <CampoAlternador
              id={`melhor-escolha-${indice}`}
              label="Melhor escolha"
              descricao={programa.melhor_escolha ? "Sim" : "Não"}
              valor={programa.melhor_escolha}
              aoAlterar={(valor) => alterar(indice, "melhor_escolha", valor)}
              desabilitado={desabilitado}
            />
          </div>

          {/* ------------------------------ Ida ------------------------------ */}
          <fieldset className="mt-5">
            <legend className="mb-3 text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Ida
            </legend>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <CampoTexto
                id={`custo-ida-${indice}`}
                label="Custo da ida (milhas)"
                obrigatorio
                tipo="number"
                valor={texto(programa.custo_ida)}
                aoAlterar={(valor) =>
                  alterar(indice, "custo_ida", numero(valor))
                }
                erro={erros[`programas.${indice}.custo_ida`]?.[0]}
                desabilitado={desabilitado}
              />

              <CampoTexto
                id={`custo-ida-maximo-${indice}`}
                label="Custo máximo da ida (milhas)"
                tipo="number"
                valor={texto(programa.custo_ida_maximo)}
                aoAlterar={(valor) =>
                  alterar(indice, "custo_ida_maximo", numero(valor))
                }
                dica="Deixe vazio quando o custo for único."
                erro={erros[`programas.${indice}.custo_ida_maximo`]?.[0]}
                desabilitado={desabilitado}
              />

              <CampoSelect
                id={`moeda-ida-${indice}`}
                label="Moeda das taxas de ida"
                obrigatorio
                valor={texto(programa.custo_ida_taxa_moeda_id)}
                aoAlterar={(valor) =>
                  alterar(indice, "custo_ida_taxa_moeda_id", numero(valor))
                }
                opcoes={moedas}
                placeholder={carregando ? "Carregando..." : "Selecione"}
                erro={erros[`programas.${indice}.custo_ida_taxa_moeda_id`]?.[0]}
                desabilitado={desabilitado || carregando}
              />

              <CampoTexto
                id={`taxa-ida-${indice}`}
                label="Custo das taxas de ida"
                obrigatorio
                tipo="number"
                valor={texto(programa.custo_ida_taxa)}
                aoAlterar={(valor) =>
                  alterar(indice, "custo_ida_taxa", numero(valor))
                }
                erro={erros[`programas.${indice}.custo_ida_taxa`]?.[0]}
                desabilitado={desabilitado}
              />
            </div>
          </fieldset>

          {/* ----------------------------- Volta ----------------------------- */}
          {comVolta && (
            <fieldset className="mt-5">
              <legend className="mb-3 text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Volta
              </legend>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <CampoTexto
                  id={`custo-volta-${indice}`}
                  label="Custo da volta (milhas)"
                  obrigatorio
                  tipo="number"
                  valor={texto(programa.custo_volta)}
                  aoAlterar={(valor) =>
                    alterar(indice, "custo_volta", numero(valor))
                  }
                  erro={erros[`programas.${indice}.custo_volta`]?.[0]}
                  desabilitado={desabilitado}
                />

                <CampoTexto
                  id={`custo-volta-maximo-${indice}`}
                  label="Custo máximo da volta (milhas)"
                  tipo="number"
                  valor={texto(programa.custo_volta_maximo)}
                  aoAlterar={(valor) =>
                    alterar(indice, "custo_volta_maximo", numero(valor))
                  }
                  dica="Deixe vazio quando o custo for único."
                  erro={erros[`programas.${indice}.custo_volta_maximo`]?.[0]}
                  desabilitado={desabilitado}
                />

                <CampoSelect
                  id={`moeda-volta-${indice}`}
                  label="Moeda das taxas de volta"
                  obrigatorio
                  valor={texto(programa.custo_volta_taxa_moeda_id)}
                  aoAlterar={(valor) =>
                    alterar(indice, "custo_volta_taxa_moeda_id", numero(valor))
                  }
                  opcoes={moedas}
                  placeholder={carregando ? "Carregando..." : "Selecione"}
                  erro={
                    erros[`programas.${indice}.custo_volta_taxa_moeda_id`]?.[0]
                  }
                  desabilitado={desabilitado || carregando}
                />

                <CampoTexto
                  id={`taxa-volta-${indice}`}
                  label="Custo das taxas de volta"
                  obrigatorio
                  tipo="number"
                  valor={texto(programa.custo_volta_taxa)}
                  aoAlterar={(valor) =>
                    alterar(indice, "custo_volta_taxa", numero(valor))
                  }
                  erro={erros[`programas.${indice}.custo_volta_taxa`]?.[0]}
                  desabilitado={desabilitado}
                />
              </div>
            </fieldset>
          )}
        </div>
      ))}

      {/* Sem nenhuma linha não há onde clicar no "+". */}
      {programas.length === 0 && (
        <button
          type="button"
          onClick={() => aoAlterar([programaVazio()])}
          disabled={desabilitado}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
        >
          <PlusIcon className="size-5 fill-current" />
          Adicionar programa
        </button>
      )}
    </div>
  );
}

/**
 * As moedas cadastradas, exibidas pela **sigla**.
 *
 * A sigla é um campo personalizado do cadastro, e a listagem só a devolve com
 * `com_meta` — daí o `true` na busca. Moeda sem sigla preenchida cai no nome,
 * em vez de virar uma opção em branco.
 *
 * A lista vem inteira: é um select, não um autocomplete, e a moeda que não
 * viesse simplesmente não poderia ser escolhida.
 */
function useMoedas() {
  const [moedas, setMoedas] = useState<OpcaoSelect[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    listarCadastrosDoTipo(TIPO_MOEDA, true)
      .then((lista) => {
        if (!ativo) return;

        setMoedas(
          lista.map((moeda) => ({
            valor: String(moeda.id),
            rotulo: siglaDaMoeda(moeda.meta) ?? moeda.nome,
          })),
        );
      })
      .catch((falha) => {
        if (ativo) setErro(mensagemDoErro(falha));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  return { moedas, carregando, erro };
}

function texto(valor: number | null): string {
  return valor === null || valor === undefined ? "" : String(valor);
}

function numero(valor: string): number | null {
  return valor.trim() === "" ? null : Number(valor);
}
