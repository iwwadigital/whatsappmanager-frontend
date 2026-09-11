import type { OpcaoSelect } from "../components/campos/CampoSelect";
import type { SituacaoAlerta } from "../types/modelos/alerta";
import { gerarSlug } from "./slug";

/**
 * O vocabulário dos alertas, espelhado do Model `App\Models\Alerta\Alerta`.
 *
 * Segue o molde de `atividades.ts` e `situacoesVinculo.ts`: a API não devolve
 * estas listas, então mexeu no Model, mexa aqui — e vice-versa.
 *
 * Os **slugs dos tipos de cadastro** também moram aqui. Todo campo de seleção
 * do alerta aponta para `cadastros`, e o que separa o selo de destaque da rota
 * aérea é o slug do tipo: é por ele que a tela filtra a busca.
 */

/* --------------------------- Itinerário do alerta ------------------------ */

export const ITINERARIO_IDA = 0;
export const ITINERARIO_IDA_E_VOLTA = 1;
export const ITINERARIO_AMARRADO = 2;

const ITINERARIOS: Record<number, string> = {
  [ITINERARIO_IDA]: "Somente ida",
  [ITINERARIO_IDA_E_VOLTA]: "Ida e volta",
  [ITINERARIO_AMARRADO]: "Ida e volta amarrado",
};

export function rotuloItinerario(valor: number): string {
  return ITINERARIOS[valor] ?? "—";
}

export function opcoesItinerario(): OpcaoSelect[] {
  return Object.entries(ITINERARIOS).map(([valor, rotulo]) => ({
    valor,
    rotulo,
  }));
}

/** A oferta tem trecho de volta? */
export function temVolta(itinerario: number): boolean {
  return itinerario !== ITINERARIO_IDA;
}

/** A oferta é vendida com ida e volta casadas? */
export function ehAmarrado(itinerario: number): boolean {
  return itinerario === ITINERARIO_AMARRADO;
}

/* ------------------- Trecho de uma linha de disponibilidade -------------- */

/**
 * O código do trecho **não é o do itinerário do alerta**: ali ele diz o
 * formato da oferta, aqui diz a que perna da viagem a linha se refere.
 */
export const TRECHO_IDA = 0;
export const TRECHO_VOLTA = 1;
export const TRECHO_AMARRADO = 2;

/* ------------------------------- Situações ------------------------------- */

const SITUACOES: Record<SituacaoAlerta, string> = {
  sem_disparo: "Sem disparo",
  agendado: "Agendado",
  em_andamento: "Em andamento",
  com_falha: "Com falha",
  enviado: "Enviado",
};

export function rotuloSituacao(situacao: SituacaoAlerta): string {
  return SITUACOES[situacao] ?? situacao;
}

/** A cor do badge de cada situação, no vocabulário do `Badge` do tema. */
export function corSituacao(
  situacao: SituacaoAlerta,
): "success" | "warning" | "error" | "info" | "light" {
  switch (situacao) {
    case "enviado":
      return "success";
    case "com_falha":
      return "error";
    case "em_andamento":
      return "warning";
    case "agendado":
      return "info";
    default:
      return "light";
  }
}

/** A mensagem do informativo no topo do formulário. */
export function descricaoSituacao(situacao: SituacaoAlerta): string {
  switch (situacao) {
    case "enviado":
      return "Este alerta já foi enviado para todos os grupos.";
    case "com_falha":
      return "O envio de pelo menos um grupo falhou e será tentado de novo.";
    case "em_andamento":
      return "O envio começou: parte dos grupos já recebeu o alerta.";
    case "agendado":
      return "O alerta está na fila e será enviado na data escolhida.";
    default:
      return "Nenhum envio na fila: escolha os tipos de grupo para agendar o disparo.";
  }
}

/* --------------------------------- Meses --------------------------------- */

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function rotuloMes(mes: number | null): string {
  return mes && mes >= 1 && mes <= 12 ? MESES[mes - 1] : "—";
}

export function opcoesMes(): OpcaoSelect[] {
  return MESES.map((rotulo, indice) => ({
    valor: String(indice + 1),
    rotulo,
  }));
}

/**
 * Os doze meses a partir do vigente.
 *
 * A disponibilidade abre um ano inteiro para quem preenche não ter de escolher
 * mês a mês, e começa em hoje porque oferta de passagem não é anunciada para
 * um mês que já passou. Em setembro, a lista vai de setembro ao agosto
 * seguinte.
 */
export function mesesDoAno(hoje = new Date()): number[] {
  const inicio = hoje.getMonth() + 1;

  return Array.from({ length: 12 }, (_, posicao) => ((inicio - 1 + posicao) % 12) + 1);
}

/* --------------------- Slugs dos tipos de cadastro ----------------------- */

export const TIPO_SELO_DESTAQUE = "selos-de-destaque";
export const TIPO_ROTA_AEREA = "rotas-aereas";
export const TIPO_PROGRAMA_FIDELIDADE = "programas-de-fidelidade";
export const TIPO_MOEDA = "moeda";
export const TIPO_PONTO_ATENCAO = "pontos-de-atencao";
export const TIPO_LINK_UTIL = "link-uteis";
export const TIPO_RODAPE_GRATIS = "rodape-dos-grupos-gratis";

/**
 * As chaves que podem guardar a sigla da moeda, na ordem de preferência.
 *
 * A sigla é um **campo personalizado**, e o nome dele é escolhido por quem
 * configura os campos da empresa — hoje ele é `codigo-internacional` ("USD"),
 * mas outra empresa pode ter chamado de "sigla" ou usar o símbolo. É a mesma
 * situação de `utils/linkCurto.ts`: a tela conhece o campo pelo nome, não pela
 * posição.
 *
 * A sigla aparece no select das taxas porque "USD" diz mais que "Dólar
 * americano" ao lado de um valor. Moeda sem nenhum desses campos preenchido
 * cai no nome, em vez de virar uma opção em branco.
 */
export const CAMPOS_SIGLA_MOEDA = [
  "sigla",
  "codigo-internacional",
  "codigo",
  "simbolo",
];

/**
 * A sigla de uma moeda, procurada nos campos personalizados dela.
 *
 * A comparação é pelo slug da chave **ou** do rótulo, como no link curto: quem
 * configura os campos digita o rótulo, não a chave.
 */
export function siglaDaMoeda(meta: Record<string, unknown> | undefined): string | null {
  if (!meta) {
    return null;
  }

  for (const esperado of CAMPOS_SIGLA_MOEDA) {
    for (const [chave, valor] of Object.entries(meta)) {
      if (gerarSlug(chave) !== esperado) {
        continue;
      }

      if (typeof valor === "string" && valor.trim() !== "") {
        return valor.trim();
      }
    }
  }

  return null;
}
