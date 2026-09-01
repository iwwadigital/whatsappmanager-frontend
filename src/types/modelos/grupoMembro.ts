import type { MembroResumo } from "./membro";

/**
 * Model: App\Models\Grupo\GrupoMembro (tabela "grupos_membros").
 * A chave é composta (grupo_id + membro_id): a tabela não tem coluna id.
 */
export interface GrupoMembro {
  grupo_id: number;
  membro_id: number;
  admin: boolean;
  /** Ativo/inativo do cadastro — não diz nada sobre o grupo no WhatsApp. */
  status: boolean;
  /** Onde a pessoa está no grupo: pendente, confirmado ou saiu. */
  situacao: string;
  created_at?: string | null;
  /** Preenchido quando o membro é removido do grupo. */
  deleted_at?: string | null;
  membro?: MembroResumo | null;
}

/**
 * Dados do vínculo. Na edição o membro não muda (o campo vem desabilitado),
 * mas o id continua sendo enviado — a API só aceita admin e status.
 *
 * `situacao` fica de fora de propósito: ela não é digitada, é observada pelo
 * robô ao comparar o cadastro com quem está no grupo.
 */
export interface DadosGrupoMembro {
  membro_id: number;
  admin: boolean;
  status: boolean;
}
