/** Model: App\Models\Empresa\Empresa (tabela "empresas"). */
export interface Empresa {
  id: number;
  nome: string;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Dados enviados no cadastro/edição de empresa. */
export interface DadosEmpresa {
  nome: string;
}
