import type { EmpresaResumo } from "./empresa";
import type { GrupoResumo } from "./grupo";

/** Tipo de grupo no formato reduzido (vínculo com o grupo). */
export interface GrupoTipoResumo {
  id: number;
  nome: string;
}

/** Model: App\Models\Grupo\GrupoTipo (tabela "grupos_tipos"). */
export interface GrupoTipo extends GrupoTipoResumo {
  empresa_id: number;
  /** Por padrão o slug do nome, mas pode ser editado. */
  slug: string;
  prioridade: number;
  quantidade_participantes_max: number;
  quantidade_admin_min: number;
  descricao_novo_grupo: string | null;
  /** Caminho relativo gravado na coluna. */
  imagem_capa: string | null;
  /** URL pública pronta para exibição. */
  imagem_capa_url: string | null;
  status: boolean;
  /** Total de grupos vinculados (withCount na listagem). */
  grupos_count?: number;
  empresa?: EmpresaResumo | null;
  grupos?: GrupoResumo[];
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Dados enviados no cadastro/edição de tipo de grupo.
 * `imagem_capa` fica de fora: tem rota própria de upload.
 */
export interface DadosGrupoTipo {
  nome: string;
  slug: string;
  prioridade: number;
  quantidade_participantes_max: number;
  quantidade_admin_min: number;
  descricao_novo_grupo: string | null;
  status: boolean;
  /** Ids dos grupos vinculados ao tipo. */
  grupos: number[];
}
