import { useEffect, useState, type FormEvent } from "react";
import CampoAlternador from "../campos/CampoAlternador";
import CampoImagem from "../campos/CampoImagem";
import CampoTextarea from "../campos/CampoTextarea";
import CampoTexto from "../campos/CampoTexto";
import Carregador from "../campos/Carregador";
import Button from "../ui/button/Button";
import { MensagemErro } from "../crud/EstadosLista";
import type { ErrosValidacao } from "../../types/api";
import type { DadosGrupo, Grupo } from "../../types/modelos";
import { formatarDataHora } from "../../utils/formato";
import {
  corOcupacao,
  percentualOcupacao,
  textoOcupacao,
} from "../../utils/ocupacao";

interface FormularioGrupoProps {
  /** Registro em edição; ausente no cadastro. */
  registro?: Grupo | null;
  salvando: boolean;
  erros: ErrosValidacao;
  erroGeral?: string | null;
  /** Imagem escolhida e ainda não enviada (a tela envia após salvar). */
  imagem: File | null;
  aoSelecionarImagem: (arquivo: File | null) => void;
  /** Remove a imagem já gravada; ausente no cadastro. */
  aoRemoverImagem?: () => void;
  removendoImagem?: boolean;
  aoEnviar: (dados: DadosGrupo) => void;
  aoCancelar: () => void;
}

/** Formulário compartilhado pelas telas de cadastro e edição de grupo. */
export default function FormularioGrupo({
  registro,
  salvando,
  erros,
  erroGeral,
  imagem,
  aoSelecionarImagem,
  aoRemoverImagem,
  removendoImagem = false,
  aoEnviar,
  aoCancelar,
}: FormularioGrupoProps) {
  const [nome, setNome] = useState("");
  const [whatsappId, setWhatsappId] = useState("");
  const [maximo, setMaximo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [conviteLink, setConviteLink] = useState("");
  const [status, setStatus] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);
  const [cheio, setCheio] = useState(false);

  useEffect(() => {
    setNome(registro?.nome ?? "");
    setWhatsappId(registro?.whatsapp_id ?? "");
    setMaximo(
      registro?.quantidade_participantes_max != null
        ? String(registro.quantidade_participantes_max)
        : "",
    );
    setDescricao(registro?.descricao ?? "");
    setConviteLink(registro?.convite_link ?? "");
    setStatus(registro?.status ?? true);
    setBloqueado(registro?.bloqueado ?? false);
    setCheio(registro?.cheio ?? false);
  }, [registro]);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    aoEnviar({
      nome,
      // Vazio vira nulo: a coluna tem índice único, e "em branco" aqui
      // significa "ainda não tem", não "é vazio".
      whatsapp_id: whatsappId.trim() === "" ? null : whatsappId.trim(),
      quantidade_participantes_max: maximo.trim() === "" ? null : Number(maximo),
      descricao: descricao.trim() === "" ? null : descricao,
      convite_link: conviteLink.trim() === "" ? null : conviteLink,
      status,
      bloqueado,
      cheio,
    });
  };

  const participantes = registro?.quantidade_participantes ?? 0;
  const percentual = percentualOcupacao(
    participantes,
    maximo.trim() === "" ? null : Number(maximo),
  );

  return (
    <form
      onSubmit={enviar}
      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-6"
    >
      {erroGeral && (
        <div className="mb-5">
          <MensagemErro mensagem={erroGeral} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <CampoTexto
          id="nome"
          label="Nome"
          obrigatorio
          valor={nome}
          aoAlterar={setNome}
          placeholder="Nome do grupo"
          erro={erros.nome?.[0]}
        />

        <CampoTexto
          id="whatsapp_id"
          label="ID do WhatsApp"
          valor={whatsappId}
          aoAlterar={setWhatsappId}
          placeholder="120363000000000000@g.us"
          dica="Opcional: deixe em branco para o robô criar o grupo no WhatsApp e preencher o ID. Informe apenas se o grupo já existe lá. Enquanto estiver vazio, as demais ações do grupo ficam aguardando."
          erro={erros.whatsapp_id?.[0]}
        />

        <CampoTexto
          id="quantidade_participantes_max"
          label="Máximo de participantes"
          tipo="number"
          valor={maximo}
          aoAlterar={setMaximo}
          placeholder="500"
          dica="Opcional: deixe em branco para não limitar."
          erro={erros.quantidade_participantes_max?.[0]}
        />

        {/* Participantes é somente leitura: vem da integração com o WhatsApp. */}
        <div>
          <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Participantes
          </p>
          <div className="flex h-11 items-center rounded-lg border border-gray-200 bg-gray-50 px-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <span className={`text-sm font-medium ${corOcupacao(percentual)}`}>
              {textoOcupacao(
                participantes,
                maximo.trim() === "" ? null : Number(maximo),
              )}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Atualizado automaticamente; não é editável.
          </p>
        </div>

        <CampoTexto
          id="convite_link"
          label="Link de convite"
          valor={conviteLink}
          aoAlterar={setConviteLink}
          placeholder="https://chat.whatsapp.com/..."
          erro={erros.convite_link?.[0]}
        />

        <CampoImagem
          id="imagem_capa"
          label="Imagem de capa"
          urlAtual={registro?.imagem_capa_url}
          arquivo={imagem}
          aoSelecionar={aoSelecionarImagem}
          aoRemover={aoRemoverImagem}
          removendo={removendoImagem}
          erro={erros.imagem?.[0]}
        />

        <div className="sm:col-span-2">
          <CampoTextarea
            id="descricao"
            label="Descrição"
            valor={descricao}
            aoAlterar={setDescricao}
            placeholder="Descrição do grupo"
            erro={erros.descricao?.[0]}
          />
        </div>

        <CampoAlternador
          id="status"
          label="Status"
          descricao={status ? "Ativo" : "Inativo"}
          valor={status}
          aoAlterar={setStatus}
          erro={erros.status?.[0]}
        />

        <CampoAlternador
          id="cheio"
          label="Cheio"
          descricao={
            cheio ? "Não será servido pelo convite" : "Disponível para convite"
          }
          valor={cheio}
          aoAlterar={setCheio}
          erro={erros.cheio?.[0]}
        />

        <div>
          <CampoAlternador
            id="bloqueado"
            label="Bloqueado pelo WhatsApp"
            descricao={bloqueado ? "Bloqueado" : "Não bloqueado"}
            valor={bloqueado}
            aoAlterar={setBloqueado}
            erro={erros.bloqueado?.[0]}
          />
          {registro?.bloqueado && registro.bloqueado_data && (
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Bloqueado em {formatarDataHora(registro.bloqueado_data)}.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          disabled={salvando}
          startIcon={salvando ? <Carregador tamanho="size-4" /> : undefined}
        >
          Salvar
        </Button>
        <button
          type="button"
          onClick={aoCancelar}
          disabled={salvando}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
