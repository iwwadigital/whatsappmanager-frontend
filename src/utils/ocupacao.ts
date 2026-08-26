/**
 * Ocupação de um grupo (participantes / máximo).
 *
 * A cor segue as faixas definidas para a listagem:
 * até 60% verde, de 61% a 90% amarelo, de 91% em diante vermelho.
 */

export const OCUPACAO_LIMITE_ATENCAO = 60;
export const OCUPACAO_LIMITE_CRITICO = 90;

/** Percentual ocupado; null quando não há máximo definido. */
export function percentualOcupacao(
  participantes: number,
  maximo?: number | null,
): number | null {
  if (!maximo || maximo <= 0) {
    return null;
  }

  return (participantes / maximo) * 100;
}

/** Classe de cor do texto para o percentual informado. */
export function corOcupacao(percentual: number | null): string {
  if (percentual === null) {
    return "text-gray-800 dark:text-gray-400";
  }

  if (percentual <= OCUPACAO_LIMITE_ATENCAO) {
    return "text-success-600 dark:text-success-400";
  }

  if (percentual <= OCUPACAO_LIMITE_CRITICO) {
    return "text-warning-600 dark:text-warning-400";
  }

  return "text-error-600 dark:text-error-400";
}

/** "320 / 500 (64%)" — o máximo vira traço quando não está definido. */
export function textoOcupacao(
  participantes: number,
  maximo?: number | null,
): string {
  const percentual = percentualOcupacao(participantes, maximo);

  if (percentual === null) {
    return `${participantes} / —`;
  }

  return `${participantes} / ${maximo} (${Math.round(percentual)}%)`;
}
