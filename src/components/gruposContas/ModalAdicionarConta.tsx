import { useEffect, useState, type FormEvent } from "react";
import CampoSelect from "../campos/CampoSelect";
import Carregador from "../campos/Carregador";
import { MensagemErro } from "../crud/EstadosLista";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { whatsappContasApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosGrupoConta, WhatsappConta } from "../../types/modelos";
import { formatarNumero } from "../../utils/formato";

interface ModalAdicionarContaProps {
  aberto: boolean;
  /** Grava o vínculo e devolve a mensagem de sucesso da API. */
  salvar: (dados: DadosGrupoConta) => Promise<string>;
  aoFechar: () => void;
  /** Chamado depois de salvar, com a mensagem devolvida pela API. */
  aoSalvar: (mensagem: string) => void;
}

/** Rótulo da conta na lista: nome — número (em quantos grupos ela está). */
function rotuloConta(conta: WhatsappConta): string {
  const grupos = conta.grupos_count ?? 0;
  const emGrupos =
    grupos === 1 ? "1 grupo" : `${grupos} grupos`;

  return `${conta.nome} — ${formatarNumero(conta.numero)} (${emGrupos})`;
}

/**
 * "Adicionar conta" na tela de contas do grupo.
 *
 * As contas vêm **ordenadas de quem está em menos grupos para quem está em
 * mais** (`ordenar=menos_grupos`), que é a mesma regra usada para escolher os
 * administradores de um grupo criado a partir de um tipo de grupo.
 */
export default function ModalAdicionarConta({
  aberto,
  salvar,
  aoFechar,
  aoSalvar,
}: ModalAdicionarContaProps) {
  const [contas, setContas] = useState<WhatsappConta[]>([]);
  const [contaId, setContaId] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  // Reabrir o modal recarrega as contas: a ordem muda a cada vínculo novo.
  useEffect(() => {
    if (!aberto) {
      return;
    }

    let ativo = true;

    setContaId("");
    setErros({});
    setErroGeral(null);
    setCarregando(true);

    void whatsappContasApi
      .listar({ ordenar: "menos_grupos", status: "1" })
      .then((resultado) => {
        if (ativo) setContas(resultado.itens);
      })
      .catch((falha) => {
        if (ativo) setErroGeral(mensagemDoErro(falha));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [aberto]);

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (contaId === "") {
      setErros({ whatsapp_conta_id: ["Escolha a conta."] });

      return;
    }

    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      aoSalvar(await salvar({ whatsapp_conta_id: Number(contaId) }));
    } catch (falha) {
      if (falha instanceof ErroApi && falha.ehValidacao) {
        setErros(falha.erros);
      } else {
        // 409 (alerta): a conta já está vinculada a este grupo.
        setErroGeral(mensagemDoErro(falha));
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      isOpen={aberto}
      onClose={aoFechar}
      showCloseButton={false}
      className="max-w-[520px] p-5 sm:p-6 lg:p-8"
    >
      <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
        Adicionar conta
      </h4>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        As contas aparecem da que está em menos grupos para a que está em mais.
      </p>

      <form onSubmit={enviar}>
        {erroGeral && (
          <div className="mb-5">
            <MensagemErro mensagem={erroGeral} />
          </div>
        )}

        {carregando ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Carregador tamanho="size-4" />
            Carregando contas...
          </div>
        ) : (
          <CampoSelect
            id="whatsapp_conta_id"
            label="Conta"
            obrigatorio
            valor={contaId}
            aoAlterar={setContaId}
            opcoes={contas.map((conta) => ({
              valor: String(conta.id),
              rotulo: rotuloConta(conta),
            }))}
            placeholder={
              contas.length === 0
                ? "Nenhuma conta ativa cadastrada"
                : "Selecione a conta"
            }
            erro={erros.whatsapp_conta_id?.[0]}
          />
        )}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={aoFechar}
            disabled={salvando}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
          >
            Cancelar
          </button>
          <Button
            size="sm"
            disabled={salvando || carregando}
            startIcon={salvando ? <Carregador tamanho="size-4" /> : undefined}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
