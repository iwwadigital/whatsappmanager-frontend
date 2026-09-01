import type { ReactNode } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Carregador from "../campos/Carregador";

interface ModalExclusaoProps {
  aberto: boolean;
  /** Descrição do registro: "a empresa Acme", "o usuário Ana". */
  descricao: string;
  /**
   * Consequência que só existe neste caso e que a frase padrão não cobre —
   * aparece em destaque, antes dos botões.
   */
  aviso?: ReactNode;
  excluindo?: boolean;
  erro?: string | null;
  aoConfirmar: () => void;
  aoFechar: () => void;
}

/** Confirmação padrão de exclusão ("Sim" / "Não"). */
export default function ModalExclusao({
  aberto,
  descricao,
  aviso,
  excluindo = false,
  erro,
  aoConfirmar,
  aoFechar,
}: ModalExclusaoProps) {
  return (
    <Modal
      isOpen={aberto}
      onClose={aoFechar}
      showCloseButton={false}
      className="max-w-[480px] p-6 lg:p-8"
    >
      <h4 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white/90">
        Confirmar exclusão
      </h4>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Você deseja realmente apagar {descricao}? Esta ação não pode ser
        desfeita.
      </p>

      {aviso && (
        <div className="mt-4 rounded-lg border border-warning-500 bg-warning-50 px-4 py-3 text-sm text-warning-600 dark:border-warning-500/30 dark:bg-warning-500/15 dark:text-orange-400">
          {aviso}
        </div>
      )}

      {erro && (
        <p className="mt-4 rounded-lg border border-error-500 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-500">
          {erro}
        </p>
      )}

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="outline" size="sm" onClick={aoFechar} disabled={excluindo}>
          Não
        </Button>
        <Button
          size="sm"
          onClick={aoConfirmar}
          disabled={excluindo}
          startIcon={excluindo ? <Carregador tamanho="size-4" /> : undefined}
        >
          Sim, apagar
        </Button>
      </div>
    </Modal>
  );
}
