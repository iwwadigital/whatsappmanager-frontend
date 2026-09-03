/** Tipo de ação no formato reduzido (vínculo com a ação). */
export interface AcaoTipoResumo {
  id: number;
  nome: string;
  /** Chave da função do sistema que executa a ação. */
  funcao: string;
}

/** Model: App\Models\Acao\AcaoTipo (tabela "acoes_tipos"). */
export interface AcaoTipo extends AcaoTipoResumo {
  descricao: string | null;
  /**
   * Prioridade com que as execuções deste tipo nascem em `acoes_grupos`.
   * Menor primeiro: é ela que põe a fila do grupo na ordem certa (criar,
   * promover administradores, imagem, restrições e, por último, convite).
   */
  prioridade_padrao: number;
  /**
   * A `funcao` já tem código no robô? Tipo cadastrado com uma função ainda
   * não implementada é aceito, mas o robô não consegue executá-lo.
   */
  funcao_implementada?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Dados enviados no cadastro/edição de tipo de ação. */
export interface DadosAcaoTipo {
  nome: string;
  descricao: string | null;
  funcao: string;
  prioridade_padrao: number;
}
