import ItemDetalhe from "../crud/ItemDetalhe";
import { Modal } from "../ui/modal";
import type { Acao } from "../../types/modelos";
import { formatarDataHora, ouTraco } from "../../utils/formato";

interface ModalVerAcaoProps {
  aberto: boolean;
  acao: Acao | null;
  aoFechar: () => void;
}

/** Visualização da ação: todos os dados do registro, em modal. */
export default function ModalVerAcao({
  aberto,
  acao,
  aoFechar,
}: ModalVerAcaoProps) {
  return (
    <Modal
      isOpen={aberto}
      onClose={aoFechar}
      className="max-w-[640px] p-5 sm:p-6 lg:p-8"
    >
      <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
        Detalhes da ação
      </h4>

      {acao && (
        <div className="custom-scrollbar max-h-[70vh] overflow-y-auto">
          <dl>
            <ItemDetalhe rotulo="Código">{acao.id}</ItemDetalhe>
            <ItemDetalhe rotulo="Tipo de ação">
              {ouTraco(acao.tipo?.nome)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Função">
              {acao.tipo?.funcao ? (
                <code className="rounded bg-gray-100 px-2 py-1 text-theme-xs text-gray-700 dark:bg-white/[0.06] dark:text-gray-300">
                  {acao.tipo.funcao}
                </code>
              ) : (
                "—"
              )}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Empresa">
              {ouTraco(acao.empresa?.nome)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Tipo de grupo">
              {ouTraco(acao.grupo_tipo?.nome)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Grupo">{ouTraco(acao.grupo?.nome)}</ItemDetalhe>
            <ItemDetalhe rotulo="Agendamento">
              {formatarDataHora(acao.agendamento)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Data de criação">
              {formatarDataHora(acao.created_at)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Última atualização">
              {formatarDataHora(acao.updated_at)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Payload">
              <pre className="custom-scrollbar mt-1 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-theme-xs text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
                {JSON.stringify(acao.payload ?? {}, null, 2)}
              </pre>
            </ItemDetalhe>
          </dl>
        </div>
      )}
    </Modal>
  );
}
