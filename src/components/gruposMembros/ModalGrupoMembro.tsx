import { useEffect, useState, type FormEvent } from "react";
import CampoAlternador from "../campos/CampoAlternador";
import CampoAutocomplete from "../campos/CampoAutocomplete";
import Carregador from "../campos/Carregador";
import { MensagemErro } from "../crud/EstadosLista";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { membrosApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type {
  DadosGrupoMembro,
  GrupoMembro,
  Membro,
} from "../../types/modelos";
import { formatarNumero, ouTraco } from "../../utils/formato";

interface ModalGrupoMembroProps {
  aberto: boolean;
  /** Vínculo em edição; ausente quando é um cadastro. */
  registro?: GrupoMembro | null;
  titulo?: string;
  descricao?: string;
  /**
   * Grava o vínculo e devolve a mensagem de sucesso da API.
   *
   * Quem chama decide o destino: adicionar direto no grupo
   * (`criarGruposMembrosApi`) ou deixar o sistema escolher o grupo do tipo
   * (`criarGruposTiposMembrosApi`).
   */
  salvar: (dados: DadosGrupoMembro) => Promise<string>;
  aoFechar: () => void;
  /** Chamado depois de salvar, com a mensagem devolvida pela API. */
  aoSalvar: (mensagem: string) => void;
}

/** Rótulo do membro no autocomplete: nome (ou traço) + número formatado. */
function rotuloMembro(membro: { nome: string | null; numero: string }): string {
  return `${ouTraco(membro.nome)} — ${formatarNumero(membro.numero)}`;
}

/**
 * Cadastro e edição do vínculo entre grupo e membro.
 *
 * Na edição o membro não muda: o campo aparece desabilitado, e a API só
 * aceita admin e status.
 */
export default function ModalGrupoMembro({
  aberto,
  registro,
  titulo,
  descricao,
  salvar,
  aoFechar,
  aoSalvar,
}: ModalGrupoMembroProps) {
  const edicao = Boolean(registro);

  const [membroId, setMembroId] = useState<number | null>(null);
  const [admin, setAdmin] = useState(false);
  const [status, setStatus] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  // Reabrir o modal sempre recomeça do registro atual (ou em branco).
  useEffect(() => {
    if (!aberto) {
      return;
    }

    setMembroId(registro?.membro_id ?? null);
    setAdmin(registro?.admin ?? false);
    setStatus(registro?.status ?? true);
    setErros({});
    setErroGeral(null);
  }, [aberto, registro]);

  const buscarMembros = async (termo: string): Promise<Membro[]> => {
    const resultado = await membrosApi.listar({ nome: termo, por_pagina: 20 });

    return resultado.itens;
  };

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (!membroId) {
      setErros({ membro_id: ["Escolha o membro."] });

      return;
    }

    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      aoSalvar(await salvar({ membro_id: membroId, admin, status }));
    } catch (falha) {
      if (falha instanceof ErroApi && falha.ehValidacao) {
        setErros(falha.erros);
      } else {
        // 409 (alerta): membro já está no grupo, ou grupo sem vaga.
        setErroGeral(mensagemDoErro(falha));
      }
    } finally {
      setSalvando(false);
    }
  };

  const rotuloSelecionado = registro?.membro
    ? rotuloMembro(registro.membro)
    : undefined;

  const tituloExibido =
    titulo ?? (edicao ? "Editar membro do grupo" : "Adicionar membro");

  const descricaoExibida =
    descricao ??
    (edicao
      ? "O membro não pode ser trocado; ajuste apenas as permissões e o status."
      : "Escolha o membro que entrará no grupo.");

  return (
    <Modal
      isOpen={aberto}
      onClose={aoFechar}
      showCloseButton={false}
      className="max-w-[520px] p-5 sm:p-6 lg:p-8"
    >
      <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
        {tituloExibido}
      </h4>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        {descricaoExibida}
      </p>

      <form onSubmit={enviar}>
        {erroGeral && (
          <div className="mb-5">
            <MensagemErro mensagem={erroGeral} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <CampoAutocomplete<Membro>
              id="membro_id"
              label="Membro"
              obrigatorio
              desabilitado={edicao}
              valor={membroId}
              rotuloSelecionado={rotuloSelecionado}
              aoSelecionar={(membro) => setMembroId(membro?.id ?? null)}
              buscar={buscarMembros}
              obterValor={(membro) => membro.id}
              obterRotulo={(membro) => rotuloMembro(membro)}
              obterDescricao={(membro) => membro.identificador ?? undefined}
              placeholder="Busque por nome, número ou identificador"
              erro={erros.membro_id?.[0]}
            />
          </div>

          <CampoAlternador
            id="admin"
            label="Administrador"
            descricao={admin ? "Sim" : "Não"}
            valor={admin}
            aoAlterar={setAdmin}
            erro={erros.admin?.[0]}
          />

          <CampoAlternador
            id="status"
            label="Status"
            descricao={status ? "Ativo" : "Inativo"}
            valor={status}
            aoAlterar={setStatus}
            erro={erros.status?.[0]}
          />
        </div>

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
            disabled={salvando}
            startIcon={salvando ? <Carregador tamanho="size-4" /> : undefined}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
