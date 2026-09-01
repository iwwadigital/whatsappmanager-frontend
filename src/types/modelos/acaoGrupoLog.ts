import type { AcaoTipoResumo } from "./acaoTipo";
import type { GrupoResumo } from "./grupo";
import type { AcaoGrupoConta } from "./acaoGrupo";

/** Execução no formato reduzido que acompanha o log. */
export interface AcaoGrupoLogExecucao {
  id: number;
  acao_id: number;
  grupo_id: number;
  whatsapp_conta_id: number | null;
  acao?: { id: number; acao_tipo_id: number; tipo?: AcaoTipoResumo | null } | null;
  grupo?: GrupoResumo | null;
  /** Relação `whatsappConta()` — o Eloquent devolve em snake_case. */
  whatsapp_conta?: AcaoGrupoConta | null;
}

/**
 * Model: App\Models\Acao\AcaoGrupoLog (tabela "acoes_grupos_logs").
 *
 * Uma tentativa de execução, gravada pelo robô. Somente leitura: não há
 * cadastro, edição nem exclusão pela API.
 */
export interface AcaoGrupoLog {
  id: number;
  acao_grupo_id: number;
  sucesso: boolean;
  status_code: number | null;
  mensagem: string | null;
  /** JSON já decodificado pela API; objeto vazio quando não houve resposta. */
  resposta: Record<string, unknown>;
  executado_em: string;
  /** Relação `acaoGrupo()` — o Eloquent devolve em snake_case. */
  acao_grupo?: AcaoGrupoLogExecucao | null;
}
