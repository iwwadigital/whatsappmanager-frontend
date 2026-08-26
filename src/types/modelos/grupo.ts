import type { EmpresaResumo } from "./empresa";
import type { GrupoTipoResumo } from "./grupoTipo";

/** Grupo no formato reduzido (vínculo com o tipo de grupo). */
export interface GrupoResumo {
  id: number;
  nome: string;
}

/** Model: App\Models\Grupo\Grupo (tabela "grupos"). */
export interface Grupo extends GrupoResumo {
  empresa_id: number;
  whatsapp_id: string;
  /** Somente leitura: alimentado pela integração, nunca pelo formulário. */
  quantidade_participantes: number;
  quantidade_participantes_max: number | null;
  descricao: string | null;
  convite_link: string | null;
  /** Caminho relativo gravado na coluna. */
  imagem_capa: string | null;
  /** URL pública pronta para exibição. */
  imagem_capa_url: string | null;
  status: boolean;
  /** Bloqueado pelo WhatsApp; a data é gravada pela API. */
  bloqueado: boolean;
  bloqueado_data: string | null;
  /** Impede que o grupo seja servido pelo link de convite. */
  cheio: boolean;
  empresa?: EmpresaResumo | null;
  tipos?: GrupoTipoResumo[];
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Dados enviados no cadastro/edição de grupo.
 * `quantidade_participantes` e `imagem_capa` ficam de fora de propósito:
 * o primeiro é somente leitura e a segunda tem rota própria de upload.
 */
export interface DadosGrupo {
  nome: string;
  whatsapp_id: string;
  quantidade_participantes_max: number | null;
  descricao: string | null;
  convite_link: string | null;
  status: boolean;
  bloqueado: boolean;
  cheio: boolean;
}
