import ItemDetalhe from "../crud/ItemDetalhe";
import Badge from "../ui/badge/Badge";
import { Modal } from "../ui/modal";
import type { AcaoGrupoLog } from "../../types/modelos";
import { formatarDataHora, formatarNumero, ouTraco } from "../../utils/formato";

interface ModalVerAcaoGrupoLogProps {
  aberto: boolean;
  log: AcaoGrupoLog | null;
  aoFechar: () => void;
}

/** Detalhe de uma tentativa do robô, com o corpo devolvido pela API. */
export default function ModalVerAcaoGrupoLog({
  aberto,
  log,
  aoFechar,
}: ModalVerAcaoGrupoLogProps) {
  return (
    <Modal
      isOpen={aberto}
      onClose={aoFechar}
      className="max-w-[640px] p-5 sm:p-6 lg:p-8"
    >
      <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
        Detalhes da tentativa
      </h4>

      {log && (
        <div className="custom-scrollbar max-h-[70vh] overflow-y-auto">
          <dl>
            <ItemDetalhe rotulo="Código">{log.id}</ItemDetalhe>
            <ItemDetalhe rotulo="Execução">{log.acao_grupo_id}</ItemDetalhe>
            <ItemDetalhe rotulo="Situação">
              <Badge size="sm" color={log.sucesso ? "success" : "error"}>
                {log.sucesso ? "Sucesso" : "Erro"}
              </Badge>
            </ItemDetalhe>
            <ItemDetalhe rotulo="Tipo de ação">
              {ouTraco(log.acao_grupo?.acao?.tipo?.nome)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Grupo">
              {ouTraco(log.acao_grupo?.grupo?.nome)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Conta">
              {log.acao_grupo?.whatsapp_conta
                ? `${log.acao_grupo.whatsapp_conta.nome} — ${formatarNumero(
                    log.acao_grupo.whatsapp_conta.numero,
                  )}`
                : "—"}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Status HTTP">
              {log.status_code ?? "—"}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Mensagem">
              {ouTraco(log.mensagem)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Executado em">
              {formatarDataHora(log.executado_em)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Resposta da API">
              <pre className="custom-scrollbar mt-1 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-theme-xs text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
                {JSON.stringify(log.resposta ?? {}, null, 2)}
              </pre>
            </ItemDetalhe>
          </dl>
        </div>
      )}
    </Modal>
  );
}
