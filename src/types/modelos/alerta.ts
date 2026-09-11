import type { CadastroResumo } from "./cadastro";
import type { GrupoTipoResumo } from "./grupoTipo";

/**
 * Situação do disparo, calculada pela API a partir da fila do robô.
 *
 * Não é uma coluna: ela sai das execuções das ações que o alerta criou.
 */
export type SituacaoAlerta =
  | "sem_disparo"
  | "agendado"
  | "em_andamento"
  | "com_falha"
  | "enviado";

/**
 * Em qual tipo de grupo o alerta sai, e com que arte.
 *
 * Model: App\Models\Alerta\AlertaGrupoTipo (tabela "alertas_grupos_tipos").
 * As imagens sobem por rota própria, depois de o alerta existir.
 */
export interface AlertaGrupoTipo {
  alerta_id: number;
  grupo_tipo_id: number;
  imagem_ida: string | null;
  imagem_volta: string | null;
  imagem_ida_url: string | null;
  imagem_volta_url: string | null;
  texto: string | null;
  grupo_tipo?: (GrupoTipoResumo & { e_gratis?: boolean }) | null;
}

/**
 * Quanto a passagem custa em um programa de fidelidade.
 *
 * Model: App\Models\Alerta\AlertaProgramaFidelidade.
 * Os campos de volta ficam nulos num alerta de "somente ida".
 */
export interface AlertaPrograma {
  id: number;
  alerta_id: number;
  programa_id: number;
  melhor_escolha: boolean;
  custo_ida: number;
  custo_ida_maximo: number | null;
  custo_ida_taxa_moeda_id: number;
  /** `decimal:2` da API chega como string ("120.55"). */
  custo_ida_taxa: string | number;
  custo_volta: number | null;
  custo_volta_maximo: number | null;
  custo_volta_taxa_moeda_id: number | null;
  custo_volta_taxa: string | number | null;
  programa?: CadastroResumo | null;
  moeda_ida?: CadastroResumo | null;
  moeda_volta?: CadastroResumo | null;
}

/**
 * Em que datas a oferta existe.
 *
 * Model: App\Models\Alerta\AlertaDisponibilidade. **O código de `itinerario`
 * aqui é o do trecho** (0 ida, 1 volta, 2 par casado), e não o do formato da
 * oferta que está em `Alerta.itinerario`.
 */
export interface AlertaDisponibilidade {
  id: number;
  alerta_id: number;
  itinerario: number;
  mes: number | null;
  dias: string | null;
  data_ida: string | null;
  data_volta: string | null;
  esconder_gratis: boolean;
}

/** Model: App\Models\Alerta\Alerta (tabela "alertas"). */
export interface Alerta {
  id: number;
  empresa_id: number;
  selo_destaque_id: number | null;
  rota_aerea_id: number | null;
  nome: string;
  chamada: string;
  frase_editorial: string | null;
  /** 0 somente ida, 1 ida e volta, 2 ida e volta amarrado. */
  itinerario: number;
  voo_direto: boolean;
  created_by: number;

  /** Calculados pela API a partir da fila do robô. */
  situacao: SituacaoAlerta;
  situacao_rotulo: string;
  /** O `agendamento` das ações do alerta; nulo significa "assim que der". */
  nao_disparar_antes_de: string | null;
  /** Falso depois que o alerta chegou a algum grupo. */
  pode_reagendar: boolean;
  /** Contadores da fila, de onde a situação é derivada (withCount da API). */
  execucoes_total?: number;
  execucoes_pendentes?: number;
  execucoes_com_falha?: number;

  selo_destaque?: CadastroResumo | null;
  rota_aerea?: CadastroResumo | null;
  criado_por?: { id: number; nome: string } | null;
  grupos_tipos?: AlertaGrupoTipo[];
  programas?: AlertaPrograma[];
  disponibilidades?: AlertaDisponibilidade[];
  /** Pontos de atenção, links úteis e rodapés, na mesma lista. */
  cadastros?: CadastroResumo[];
  created_at?: string | null;
  updated_at?: string | null;
}

/** Uma linha do repetidor de programas de fidelidade. */
export interface DadosAlertaPrograma {
  programa_id: number | null;
  melhor_escolha: boolean;
  custo_ida: number | null;
  custo_ida_maximo: number | null;
  custo_ida_taxa_moeda_id: number | null;
  custo_ida_taxa: number | null;
  custo_volta: number | null;
  custo_volta_maximo: number | null;
  custo_volta_taxa_moeda_id: number | null;
  custo_volta_taxa: number | null;
}

/** Uma linha do repetidor de disponibilidade. */
export interface DadosAlertaDisponibilidade {
  itinerario: number;
  mes: number | null;
  dias: string | null;
  data_ida: string | null;
  data_volta: string | null;
  esconder_gratis: boolean;
}

/**
 * Dados enviados no cadastro/edição de um alerta.
 *
 * As quatro abas vão juntas. As imagens de cada tipo de grupo ficam de fora:
 * têm rota própria, e o upload vem depois de salvar.
 */
export interface DadosAlerta {
  selo_destaque_id: number | null;
  rota_aerea_id: number | null;
  nome: string;
  chamada: string;
  frase_editorial: string | null;
  itinerario: number;
  voo_direto: boolean;
  nao_disparar_antes_de: string | null;
  grupos_tipos: number[];
  programas: DadosAlertaPrograma[];
  disponibilidades: DadosAlertaDisponibilidade[];
  cadastros: number[];
}
