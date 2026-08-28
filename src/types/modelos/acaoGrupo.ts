import type { AcaoTipoResumo } from "./acaoTipo";
import type { GrupoResumo } from "./grupo";

/** Ação no formato reduzido que acompanha a execução. */
export interface AcaoGrupoAcao {
  id: number;
  acao_tipo_id: number;
  grupo_id: number | null;
  agendamento?: string | null;
  created_at?: string | null;
  tipo?: AcaoTipoResumo | null;
}

/** Conta de WhatsApp que reivindicou a execução. */
export interface AcaoGrupoConta {
  id: number;
  nome: string;
  numero: string;
}

/**
 * Model: App\Models\Acao\AcaoGrupo (tabela "acoes_grupos").
 *
 * A linha é criada pelo robô; a tela só edita `prioridade` e
 * `iniciar_apartir_de`. O estado se lê pelas datas: `iniciado` sem
 * `finalizado` é execução em andamento (ou que falhou e aguarda nova
 * tentativa).
 */
export interface AcaoGrupo {
  id: number;
  acao_id: number;
  grupo_id: number;
  whatsapp_conta_id: number | null;
  prioridade: number;
  iniciar_apartir_de: string;
  iniciado: string | null;
  finalizado: string | null;
  acao?: AcaoGrupoAcao | null;
  grupo?: GrupoResumo | null;
  /** Relação `whatsappConta()` — o Eloquent devolve em snake_case. */
  whatsapp_conta?: AcaoGrupoConta | null;
}

/** Os únicos campos que a API aceita na edição. */
export interface DadosAcaoGrupo {
  prioridade: number;
  iniciar_apartir_de: string;
}
