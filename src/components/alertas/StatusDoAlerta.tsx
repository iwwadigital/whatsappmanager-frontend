import Badge from "../ui/badge/Badge";
import { corSituacao, descricaoSituacao, rotuloSituacao } from "../../utils/alertas";
import { formatarDataHora } from "../../utils/formato";
import type { SituacaoAlerta } from "../../types/modelos";

interface StatusDoAlertaProps {
  situacao: SituacaoAlerta;
  agendamento: string | null;
  /** Quantos grupos já receberam, de quantos no total. */
  enviados?: number;
  total?: number;
}

/**
 * O informativo do topo do formulário: em que pé está o disparo.
 *
 * A situação é calculada pela API a partir da fila do robô — ela não é um
 * campo do alerta. Aqui ela vira uma frase, porque "com_falha" sozinho não diz
 * a quem olha o que aconteceu nem o que vai acontecer a seguir.
 */
export default function StatusDoAlerta({
  situacao,
  agendamento,
  enviados,
  total,
}: StatusDoAlertaProps) {
  return (
    <div className="mb-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center gap-3">
        <Badge color={corSituacao(situacao)}>{rotuloSituacao(situacao)}</Badge>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {descricaoSituacao(situacao)}
        </p>
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-theme-xs">
        <div className="flex gap-1.5">
          <dt className="text-gray-500 dark:text-gray-400">Disparo agendado para:</dt>
          <dd className="font-medium text-gray-700 dark:text-gray-300">
            {agendamento ? formatarDataHora(agendamento) : "assim que possível"}
          </dd>
        </div>

        {total !== undefined && total > 0 && (
          <div className="flex gap-1.5">
            <dt className="text-gray-500 dark:text-gray-400">Grupos atendidos:</dt>
            <dd className="font-medium text-gray-700 dark:text-gray-300">
              {enviados ?? 0} de {total}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
