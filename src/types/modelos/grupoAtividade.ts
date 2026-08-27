import type { GrupoResumo } from "./grupo";
import type { MembroResumo } from "./membro";

/**
 * Model: App\Models\Grupo\GrupoAtividade (tabela "grupos_atividades").
 * Log gravado pelo sistema — a tela é somente leitura.
 */
export interface GrupoAtividade {
  id: number;
  grupo_id: number;
  membro_id: number;
  /** entrou, saiu, post_imagem, post_texto, convite_enviado */
  atividade: string;
  created_at?: string | null;
  grupo?: GrupoResumo | null;
  membro?: MembroResumo | null;
}
