import type { CamposPersonalizados } from "./campoPersonalizado";

export type { CamposPersonalizados };

/**
 * Empresa no formato reduzido de `GET /empresas-disponiveis`, usado pelo
 * seletor de empresa do header.
 */
export interface EmpresaResumo {
  id: number;
  nome: string;
}

/** Model: App\Models\Empresa\Empresa (tabela "empresas"). */
export interface Empresa extends EmpresaResumo {
  quantidade_max_admin_por_grupo: number;
  /** Sempre no formato "HH:MM" (entre 18:00 e 23:30). */
  horario_alertas_do_dia: string;
  convite_quantidade_dias_atualizacao: number;
  cadastros_campos_personalizados?: CamposPersonalizados;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Dados enviados no cadastro/edição de empresa. */
export interface DadosEmpresa {
  nome: string;
  quantidade_max_admin_por_grupo: number;
  horario_alertas_do_dia: string;
  convite_quantidade_dias_atualizacao: number;
  cadastros_campos_personalizados: CamposPersonalizados;
}
