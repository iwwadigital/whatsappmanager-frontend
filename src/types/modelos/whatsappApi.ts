import type { EmpresaResumo } from "./empresa";

/** Interface de conexão disponível no sistema (GET /whatsapp-apis-disponiveis). */
export interface ApiDisponivel {
  /** Valor gravado em `whatsapp_apis.api` (ex.: "wuzapi"). */
  chave: string;
  /** Nome exibido (ex.: "WuzAPI"). */
  rotulo: string;
}

/** API no formato reduzido (vem junto da conta). */
export interface WhatsappApiResumo {
  id: number;
  nome: string;
  api: string;
  /** Valor que a API devolve quando a conta está conectada. */
  status_sucesso: string | null;
}

/** Model: App\Models\Whatsapp\WhatsappApi (tabela "whatsapp_apis"). */
export interface WhatsappApi extends WhatsappApiResumo {
  empresa_id: number;
  empresa?: EmpresaResumo | null;
  url: string;
  /** Nome de exibição da interface de conexão ("wuzapi" → "WuzAPI"). */
  api_rotulo: string;
  /** Quantidade de contas vinculadas; vem na listagem e no `show`. */
  contas_count?: number;
}

/**
 * Dados enviados no cadastro/edição da API.
 * `empresa_id` fica de fora: vem sempre da empresa ativa.
 */
export interface DadosWhatsappApi {
  nome: string;
  api: string;
  url: string;
  status_sucesso: string | null;
}
