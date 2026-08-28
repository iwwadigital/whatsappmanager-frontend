import type { EmpresaResumo } from "./empresa";
import type { GrupoResumo } from "./grupo";
import type { WhatsappApiResumo } from "./whatsappApi";

/** Model: App\Models\Whatsapp\WhatsappConta (tabela "whatsapp_contas"). */
export interface WhatsappConta {
  id: number;
  empresa_id: number;
  empresa?: EmpresaResumo | null;
  whatsapp_api_id: number;
  /** Relação `whatsappApi()` — o Eloquent devolve em snake_case. */
  whatsapp_api?: WhatsappApiResumo | null;
  /** Gravado somente com dígitos; a máscara é aplicada na exibição. */
  numero: string;
  nome: string;
  token: string;
  /** Último status devolvido pela API; gravado pelo sistema. */
  status_api: string | null;
  /** Resultado da última sincronização de status. */
  status_conexao: boolean;
  /**
   * `status_api` é igual ao `status_sucesso` da API? Calculado pela API a
   * cada resposta, então acompanha mudanças no cadastro da API.
   */
  conectada: boolean;
  /** Ativa ou inativa (não confundir com a conexão). */
  status: boolean;
  /** Em quantos grupos a conta está; vem na listagem. */
  grupos_count?: number;
  /** Dados do vínculo; só na listagem de contas de um grupo. */
  pivot?: {
    created_at?: string | null;
  };
  /** Grupos que a conta administra; só vem no `show`. */
  grupos?: GrupoResumo[];
  created_at?: string | null;
  updated_at?: string | null;
  /** Preenchido na exclusão (a conta não sai do banco). */
  deleted_at?: string | null;
}

/**
 * Dados enviados no cadastro/edição da conta.
 * `empresa_id`, `status_api` e `status_conexao` ficam de fora: são do sistema.
 */
export interface DadosWhatsappConta {
  whatsapp_api_id: number;
  numero: string;
  nome: string;
  token: string;
  status: boolean;
}

/** Vínculo de uma conta com um grupo (`grupos_whatsapp_contas`). */
export interface DadosGrupoConta {
  whatsapp_conta_id: number;
}
