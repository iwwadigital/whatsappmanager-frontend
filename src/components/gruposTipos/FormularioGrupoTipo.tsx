import { useEffect, useMemo, useState, type FormEvent } from "react";
import CampoAlternador from "../campos/CampoAlternador";
import CampoImagem from "../campos/CampoImagem";
import CampoSelecaoMultipla from "../campos/CampoSelecaoMultipla";
import CampoTextarea from "../campos/CampoTextarea";
import CampoTexto from "../campos/CampoTexto";
import Carregador from "../campos/Carregador";
import Button from "../ui/button/Button";
import { MensagemErro } from "../crud/EstadosLista";
import { useEmpresaAtiva } from "../../context/EmpresaAtivaContext";
import { gruposApi } from "../../services/api";
import { carregarTodos } from "../../services/carregarTodos";
import { mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosGrupoTipo, Grupo, GrupoTipo } from "../../types/modelos";
import { gerarSlug } from "../../utils/slug";

/** Mesmos padrões da tabela "grupos_tipos". */
const PADRAO_PRIORIDADE = "0";
const PADRAO_PARTICIPANTES_MAX = "500";
const PADRAO_ADMIN_MIN = "5";

interface FormularioGrupoTipoProps {
  /** Registro em edição; ausente no cadastro. */
  registro?: GrupoTipo | null;
  salvando: boolean;
  erros: ErrosValidacao;
  erroGeral?: string | null;
  imagem: File | null;
  aoSelecionarImagem: (arquivo: File | null) => void;
  aoRemoverImagem?: () => void;
  removendoImagem?: boolean;
  aoEnviar: (dados: DadosGrupoTipo) => void;
  aoCancelar: () => void;
}

/** Formulário compartilhado pelo cadastro e pela edição de tipo de grupo. */
export default function FormularioGrupoTipo({
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
}: FormularioGrupoTipoProps) {
  const { empresaId } = useEmpresaAtiva();

  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [prioridade, setPrioridade] = useState(PADRAO_PRIORIDADE);
  const [participantesMax, setParticipantesMax] = useState(
    PADRAO_PARTICIPANTES_MAX,
  );
  const [adminMin, setAdminMin] = useState(PADRAO_ADMIN_MIN);
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState(true);
  const [selecionados, setSelecionados] = useState<number[]>([]);

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [carregandoGrupos, setCarregandoGrupos] = useState(true);
  const [erroGrupos, setErroGrupos] = useState<string | null>(null);

  useEffect(() => {
    setNome(registro?.nome ?? "");
    setSlug(registro?.slug ?? "");
    // Na edição o slug já existe: não é regerado ao mexer no nome.
    setSlugManual(Boolean(registro));
    setPrioridade(registro ? String(registro.prioridade) : PADRAO_PRIORIDADE);
    setParticipantesMax(
      registro
        ? String(registro.quantidade_participantes_max)
        : PADRAO_PARTICIPANTES_MAX,
    );
    setAdminMin(
      registro ? String(registro.quantidade_admin_min) : PADRAO_ADMIN_MIN,
    );
    setDescricao(registro?.descricao_novo_grupo ?? "");
    setStatus(registro?.status ?? true);
    setSelecionados((registro?.grupos ?? []).map((grupo) => grupo.id));
  }, [registro]);

  // Só os grupos da empresa ativa entram na lista de vínculo.
  useEffect(() => {
    let ativo = true;

    setCarregandoGrupos(true);
    setErroGrupos(null);

    carregarTodos<Grupo>(gruposApi.listar)
      .then((lista) => {
        if (ativo) setGrupos(lista);
      })
      .catch((falha) => {
        if (ativo) setErroGrupos(mensagemDoErro(falha));
      })
      .finally(() => {
        if (ativo) setCarregandoGrupos(false);
      });

    return () => {
      ativo = false;
    };
  }, [empresaId]);

  const itensGrupos = useMemo(
    () =>
      grupos.map((grupo) => ({
        valor: grupo.id,
        rotulo: grupo.nome,
        descricao: grupo.whatsapp_id,
      })),
    [grupos],
  );

  const alterarNome = (valor: string) => {
    setNome(valor);

    // Enquanto o slug não for editado à mão, ele acompanha o nome.
    if (!slugManual) {
      setSlug(gerarSlug(valor));
    }
  };

  const alterarSlug = (valor: string) => {
    setSlugManual(true);
    setSlug(gerarSlug(valor));
  };

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    aoEnviar({
      nome,
      slug: slug.trim() === "" ? gerarSlug(nome) : slug,
      prioridade: Number(prioridade),
      quantidade_participantes_max: Number(participantesMax),
      quantidade_admin_min: Number(adminMin),
      descricao_novo_grupo: descricao.trim() === "" ? null : descricao,
      status,
      grupos: selecionados,
    });
  };

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
          aoAlterar={alterarNome}
          placeholder="Nome do tipo de grupo"
          erro={erros.nome?.[0]}
        />

        <CampoTexto
          id="slug"
          label="Slug"
          obrigatorio
          valor={slug}
          aoAlterar={alterarSlug}
          placeholder="tipo-de-grupo"
          dica="Gerado a partir do nome; pode ser ajustado."
          erro={erros.slug?.[0]}
        />

        <CampoTexto
          id="prioridade"
          label="Prioridade"
          tipo="number"
          obrigatorio
          valor={prioridade}
          aoAlterar={setPrioridade}
          placeholder="0"
          dica="Quanto maior, mais alto na ordenação."
          erro={erros.prioridade?.[0]}
        />

        <CampoTexto
          id="quantidade_participantes_max"
          label="Máximo de participantes"
          tipo="number"
          obrigatorio
          valor={participantesMax}
          aoAlterar={setParticipantesMax}
          placeholder="500"
          erro={erros.quantidade_participantes_max?.[0]}
        />

        <CampoTexto
          id="quantidade_admin_min"
          label="Mínimo de administradores"
          tipo="number"
          obrigatorio
          valor={adminMin}
          aoAlterar={setAdminMin}
          placeholder="5"
          erro={erros.quantidade_admin_min?.[0]}
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
            id="descricao_novo_grupo"
            label="Descrição do novo grupo"
            valor={descricao}
            aoAlterar={setDescricao}
            placeholder="Texto aplicado aos grupos criados com este tipo"
            erro={erros.descricao_novo_grupo?.[0]}
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

        <div className="sm:col-span-2">
          <CampoSelecaoMultipla
            id="grupos"
            label="Grupos deste tipo"
            itens={itensGrupos}
            valores={selecionados}
            aoAlterar={setSelecionados}
            carregando={carregandoGrupos}
            mensagemVazia="Nenhum grupo cadastrado nesta empresa."
            erro={erros.grupos?.[0] ?? erroGrupos ?? undefined}
          />
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
