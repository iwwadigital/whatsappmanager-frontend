import {
  ITINERARIO_AMARRADO,
  TIPO_LINK_UTIL,
  TIPO_PONTO_ATENCAO,
  TIPO_RODAPE_GRATIS,
  TRECHO_AMARRADO,
  TRECHO_IDA,
  TRECHO_VOLTA,
  mesesDoAno,
  temVolta,
} from "../../utils/alertas";
import type {
  Alerta,
  DadosAlerta,
  DadosAlertaDisponibilidade,
  DadosAlertaPrograma,
} from "../../types/modelos";
import { deCampoDataHora, paraCampoDataHora } from "../../utils/formato";

/**
 * O estado do formulário de alerta — as quatro abas juntas.
 *
 * Difere de `DadosAlerta` em dois pontos, e os dois são sobre a tela:
 *
 * - `nao_disparar_antes_de` fica no formato do `<input datetime-local>`;
 * - os cadastros da última aba ficam em **três listas**, uma por campo. No
 *   envio elas viram uma só, porque é uma tabela só — o que separa um campo do
 *   outro é o slug do tipo do cadastro.
 */
/**
 * Uma linha do repetidor de programas, com o nome do programa junto.
 *
 * O nome não vai para a API — ele existe porque o `CampoAutocomplete` precisa
 * do rótulo do item já escolhido para exibi-lo ao reabrir a edição, e o
 * formulário guarda só o id.
 */
export type LinhaPrograma = DadosAlertaPrograma & { programa_nome: string };

export interface DadosFormularioAlerta {
  selo_destaque_id: number | null;
  selo_destaque_nome: string;
  rota_aerea_id: number | null;
  rota_aerea_nome: string;
  nome: string;
  chamada: string;
  frase_editorial: string;
  itinerario: number;
  voo_direto: boolean;
  nao_disparar_antes_de: string;
  grupos_tipos: number[];
  programas: LinhaPrograma[];
  /** As linhas de ida (ou o par casado, no itinerário amarrado). */
  disponibilidade_ida: DadosAlertaDisponibilidade[];
  disponibilidade_volta: DadosAlertaDisponibilidade[];
  pontos_atencao: number[];
  links_uteis: number[];
  rodapes_gratis: number[];
}

/** Uma linha nova do repetidor de programas de fidelidade. */
export function programaVazio(): LinhaPrograma {
  return {
    programa_id: null,
    programa_nome: "",
    melhor_escolha: false,
    custo_ida: null,
    custo_ida_maximo: null,
    custo_ida_taxa_moeda_id: null,
    custo_ida_taxa: null,
    custo_volta: null,
    custo_volta_maximo: null,
    custo_volta_taxa_moeda_id: null,
    custo_volta_taxa: null,
  };
}

/** Uma linha nova do repetidor do itinerário amarrado (par de datas). */
export function parDeDatasVazio(): DadosAlertaDisponibilidade {
  return {
    itinerario: TRECHO_AMARRADO,
    mes: null,
    dias: null,
    data_ida: null,
    data_volta: null,
    esconder_gratis: false,
  };
}

/**
 * Os doze meses do repetidor de disponibilidade, a partir do mês vigente.
 *
 * As linhas existem só na tela: o back grava apenas as que tiverem dias
 * preenchidos. É o que permite abrir o ano inteiro sem encher a tabela.
 */
export function mesesEmBranco(trecho: number): DadosAlertaDisponibilidade[] {
  return mesesDoAno().map((mes) => ({
    itinerario: trecho,
    mes,
    dias: "",
    data_ida: null,
    data_volta: null,
    esconder_gratis: false,
  }));
}

/**
 * O estado inicial: em branco, ou preenchido com o alerta em edição.
 */
export function formularioInicial(alerta?: Alerta | null): DadosFormularioAlerta {
  if (!alerta) {
    return {
      selo_destaque_id: null,
      selo_destaque_nome: "",
      rota_aerea_id: null,
      rota_aerea_nome: "",
      nome: "",
      chamada: "",
      frase_editorial: "",
      itinerario: 0,
      voo_direto: false,
      nao_disparar_antes_de: "",
      grupos_tipos: [],
      programas: [programaVazio()],
      disponibilidade_ida: mesesEmBranco(TRECHO_IDA),
      disponibilidade_volta: mesesEmBranco(TRECHO_VOLTA),
      pontos_atencao: [],
      links_uteis: [],
      rodapes_gratis: [],
    };
  }

  const amarrado = alerta.itinerario === ITINERARIO_AMARRADO;
  const gravadas = alerta.disponibilidades ?? [];

  return {
    selo_destaque_id: alerta.selo_destaque_id,
    selo_destaque_nome: alerta.selo_destaque?.nome ?? "",
    rota_aerea_id: alerta.rota_aerea_id,
    rota_aerea_nome: alerta.rota_aerea?.nome ?? "",
    nome: alerta.nome,
    chamada: alerta.chamada,
    frase_editorial: alerta.frase_editorial ?? "",
    itinerario: alerta.itinerario,
    voo_direto: alerta.voo_direto,
    nao_disparar_antes_de: paraCampoDataHora(alerta.nao_disparar_antes_de),
    grupos_tipos: (alerta.grupos_tipos ?? []).map((v) => v.grupo_tipo_id),
    programas:
      alerta.programas && alerta.programas.length > 0
        ? alerta.programas.map((programa) => ({
            programa_id: programa.programa_id,
            programa_nome: programa.programa?.nome ?? "",
            melhor_escolha: programa.melhor_escolha,
            custo_ida: programa.custo_ida,
            custo_ida_maximo: programa.custo_ida_maximo,
            custo_ida_taxa_moeda_id: programa.custo_ida_taxa_moeda_id,
            custo_ida_taxa: Number(programa.custo_ida_taxa),
            custo_volta: programa.custo_volta,
            custo_volta_maximo: programa.custo_volta_maximo,
            custo_volta_taxa_moeda_id: programa.custo_volta_taxa_moeda_id,
            custo_volta_taxa:
              programa.custo_volta_taxa === null
                ? null
                : Number(programa.custo_volta_taxa),
          }))
        : [programaVazio()],
    // No amarrado as linhas são pares de datas e vão todas na lista de ida;
    // nos outros dois, o mês gravado entra na sua posição do ano aberto.
    disponibilidade_ida: amarrado
      ? gravadas.filter((linha) => linha.itinerario === TRECHO_AMARRADO)
      : comMesesGravados(TRECHO_IDA, gravadas),
    disponibilidade_volta: amarrado
      ? []
      : comMesesGravados(TRECHO_VOLTA, gravadas),
    // Os três campos da última aba chegam em uma lista só: o slug do tipo de
    // cada cadastro é o que diz de qual campo ele é.
    pontos_atencao: doTipo(alerta, TIPO_PONTO_ATENCAO),
    links_uteis: doTipo(alerta, TIPO_LINK_UTIL),
    rodapes_gratis: doTipo(alerta, TIPO_RODAPE_GRATIS),
  };
}

/** Os ids dos cadastros do alerta que são de um tipo. */
function doTipo(alerta: Alerta, slug: string): number[] {
  return (alerta.cadastros ?? [])
    .filter((cadastro) => cadastro.tipo?.slug === slug)
    .map((cadastro) => cadastro.id);
}

/**
 * Os doze meses do ano aberto, já com o que estiver gravado.
 *
 * O mês gravado que não cair nesses doze (um alerta antigo, reaberto meses
 * depois) entra no fim da lista em vez de sumir: o conteúdo é do usuário, e
 * ele precisa poder ver e apagar o que gravou.
 */
function comMesesGravados(
  trecho: number,
  gravadas: DadosAlertaDisponibilidade[],
): DadosAlertaDisponibilidade[] {
  const doTrecho = gravadas.filter((linha) => linha.itinerario === trecho);
  const meses = mesesDoAno();

  const abertos = meses.map((mes) => {
    const gravada = doTrecho.find((linha) => linha.mes === mes);

    return (
      gravada ?? {
        itinerario: trecho,
        mes,
        dias: "",
        data_ida: null,
        data_volta: null,
        esconder_gratis: false,
      }
    );
  });

  const foraDoAno = doTrecho.filter(
    (linha) => linha.mes === null || !meses.includes(linha.mes),
  );

  return [...abertos, ...foraDoAno];
}

/**
 * O formulário no formato que a API espera.
 *
 * As três listas de cadastros viram uma; a disponibilidade vira uma lista só,
 * com o trecho de cada linha já gravado nela. Mês sem dias vai junto e é o
 * back quem o descarta — a regra de "linha vazia não vira registro" é uma só,
 * e ela mora lá.
 */
export function paraEnvio(dados: DadosFormularioAlerta): DadosAlerta {
  return {
    selo_destaque_id: dados.selo_destaque_id,
    rota_aerea_id: dados.rota_aerea_id,
    nome: dados.nome,
    chamada: dados.chamada,
    frase_editorial:
      dados.frase_editorial.trim() === "" ? null : dados.frase_editorial.trim(),
    itinerario: dados.itinerario,
    voo_direto: dados.voo_direto,
    nao_disparar_antes_de: deCampoDataHora(dados.nao_disparar_antes_de),
    grupos_tipos: dados.grupos_tipos,
    // `programa_nome` é da tela, não do payload.
    programas: dados.programas
      .filter((programa) => programa.programa_id !== null)
      .map(({ programa_nome: _nome, ...programa }) => programa),
    // Só os campos da linha: o que vem do `show` traz `id` e `alerta_id`
    // junto, e eles não são do formulário.
    //
    // As linhas de volta ficam no estado mesmo num alerta de somente ida (para
    // reaparecerem preenchidas se o itinerário voltar a ter volta), mas não
    // são enviadas: iriam vazias, dobrando o payload e deslocando os índices
    // das mensagens de erro da API.
    disponibilidades: linhasDoItinerario(dados).map((linha) => ({
      itinerario: linha.itinerario,
      mes: linha.mes,
      dias: linha.dias,
      data_ida: linha.data_ida,
      data_volta: linha.data_volta,
      esconder_gratis: linha.esconder_gratis,
    })),
    cadastros: [
      ...dados.pontos_atencao,
      ...dados.links_uteis,
      ...dados.rodapes_gratis,
    ],
  };
}

/** As linhas de disponibilidade que o itinerário escolhido de fato usa. */
function linhasDoItinerario(
  dados: DadosFormularioAlerta,
): DadosAlertaDisponibilidade[] {
  if (dados.itinerario === ITINERARIO_AMARRADO) {
    return dados.disponibilidade_ida;
  }

  return temVolta(dados.itinerario)
    ? [...dados.disponibilidade_ida, ...dados.disponibilidade_volta]
    : dados.disponibilidade_ida;
}
