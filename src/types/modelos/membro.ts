import type { EmpresaResumo } from "./empresa";

/** Membro no formato reduzido (vínculos e logs). */
export interface MembroResumo {
  id: number;
  nome: string | null;
  /** Gravado somente com dígitos; a máscara é aplicada na exibição. */
  numero: string;
  identificador: string | null;
}

/** Model: App\Models\Membro\Membro (tabela "membros"). */
export interface Membro extends MembroResumo {
  empresa_id: number;
  empresa?: EmpresaResumo | null;
  created_at?: string | null;
  updated_at?: string | null;
  /** Preenchido na exclusão: é ele que define o status do membro. */
  deleted_at?: string | null;
}

/**
 * Dados enviados no cadastro/edição de membro.
 * `empresa_id` fica de fora: vem sempre da empresa ativa.
 */
export interface DadosMembro {
  numero: string;
  nome: string | null;
  identificador: string | null;
}
