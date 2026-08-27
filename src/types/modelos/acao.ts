import type { AcaoTipoResumo } from "./acaoTipo";
import type { EmpresaResumo } from "./empresa";
import type { GrupoResumo } from "./grupo";
import type { GrupoTipoResumo } from "./grupoTipo";

/**
 * Model: App\Models\Acao\Acao (tabela "acoes").
 * A ação é criada pelo sistema — não há cadastro pela API.
 */
export interface Acao {
  id: number;
  empresa_id: number;
  acao_tipo_id: number;
  grupo_tipo_id: number | null;
  grupo_id: number | null;
  /** JSON já decodificado pela API; objeto vazio quando não há dados. */
  payload: Record<string, unknown>;
  agendamento: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  tipo?: AcaoTipoResumo | null;
  /** A relação `grupoTipo` do Model sai em snake_case no JSON. */
  grupo_tipo?: GrupoTipoResumo | null;
  grupo?: GrupoResumo | null;
  empresa?: EmpresaResumo | null;
}

/** Na edição, o único campo aceito pela API é o agendamento. */
export interface DadosAcao {
  agendamento: string | null;
}
