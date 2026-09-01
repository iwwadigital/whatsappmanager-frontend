import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import CartaoListagem from "../../components/crud/CartaoListagem";
import AcoesLinha from "../../components/crud/AcoesLinha";
import BadgeStatus from "../../components/crud/BadgeStatus";
import ModalExclusao from "../../components/crud/ModalExclusao";
import ModalGrupoMembro from "../../components/gruposMembros/ModalGrupoMembro";
import ResumoOcupacao from "../../components/gruposMembros/ResumoOcupacao";
import CampoBusca from "../../components/campos/CampoBusca";
import CampoSelect from "../../components/campos/CampoSelect";
import {
  Celula,
  CelulaCabecalho,
  CLASSE_CABECALHO,
} from "../../components/crud/Tabela";
import Badge from "../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { useEmpresaAtiva } from "../../context/EmpresaAtivaContext";
import { useListagem } from "../../hooks/useListagem";
import { useRegistro } from "../../hooks/useRegistro";
import { criarGruposMembrosApi, gruposApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type {
  DadosGrupoMembro,
  Grupo,
  GrupoMembro,
} from "../../types/modelos";
import { formatarNumero, ouTraco } from "../../utils/formato";
import {
  corSituacao,
  opcoesSituacao,
  rotuloSituacao,
} from "../../utils/situacoesVinculo";

const FILTROS_INICIAIS = { nome: "", situacao: "" };

const LARGURA_FILTRO = "w-full sm:w-[190px]";

/** Listagem dos membros de um grupo específico. */
export default function MembrosDoGrupo() {
  const { id } = useParams();
  const { temPermissao } = useAutenticacao();
  const { empresaId } = useEmpresaAtiva();

  const grupoId = id ?? "";
  const api = useMemo(() => criarGruposMembrosApi(grupoId), [grupoId]);

  // O `show` traz membros_count, participantes e o máximo — o resumo do topo.
  const { registro: grupo, recarregar: recarregarGrupo } = useRegistro<Grupo>(
    gruposApi.mostrar,
    id,
  );

  const listagem = useListagem<GrupoMembro>({
    listar: api.listar,
    filtrosIniciais: FILTROS_INICIAIS,
    chaveRecarga: `${empresaId}-${grupoId}`,
  });

  const [mensagem, setMensagem] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<GrupoMembro | null>(null);
  const [alvo, setAlvo] = useState<GrupoMembro | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const abrirCadastro = () => {
    setEmEdicao(null);
    setModalAberto(true);
  };

  const abrirEdicao = (vinculo: GrupoMembro) => {
    setEmEdicao(vinculo);
    setModalAberto(true);
  };

  /** Cadastro e edição do vínculo; a rota recebe o id do membro. */
  const salvarVinculo = async (dados: DadosGrupoMembro): Promise<string> => {
    if (emEdicao) {
      await api.atualizar(emEdicao.membro_id, dados);

      return "Membro do grupo atualizado com sucesso.";
    }

    await api.criar(dados);

    return "Membro adicionado ao grupo com sucesso.";
  };

  const aoSalvar = async (retorno: string) => {
    setModalAberto(false);
    setEmEdicao(null);
    setMensagem(retorno);

    // Entrar no grupo mexe na contagem de participantes: o resumo recarrega.
    await Promise.all([listagem.recarregar(), recarregarGrupo()]);
  };

  const excluir = async () => {
    if (!alvo) return;

    setExcluindo(true);
    setErroExclusao(null);

    try {
      // A chave do vínculo é composta: a rota recebe o id do membro.
      const retorno = await api.remover(alvo.membro_id);

      setAlvo(null);
      setMensagem(retorno);

      if (listagem.itens.length === 1 && listagem.pagina > 1) {
        listagem.irParaPagina(listagem.pagina - 1);
      } else {
        await listagem.recarregar();
      }

      await recarregarGrupo();
    } catch (falha) {
      setErroExclusao(mensagemDoErro(falha));
    } finally {
      setExcluindo(false);
    }
  };

  const nomeGrupo = grupo?.nome ?? "";

  return (
    <div>
      <PageMeta
        title="Membros do grupo | WhatsApp Manager"
        description="Membros vinculados ao grupo"
      />

      <CabecalhoPagina
        titulo={`Membros do grupo: ${nomeGrupo}`}
        trilha={[
          { rotulo: "Grupos", caminho: "/grupos" },
          { rotulo: nomeGrupo || "Grupo", caminho: `/grupos/${grupoId}` },
          { rotulo: "Membros" },
        ]}
        acoes={
          <Link
            to="/grupos"
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
          >
            Voltar
          </Link>
        }
      />

      <ResumoOcupacao
        membros={grupo?.membros_count}
        quantidadeParticipantes={grupo?.quantidade_participantes}
        quantidadeParticipantesMax={grupo?.quantidade_participantes_max}
      />

      <CartaoListagem
        carregando={listagem.carregando}
        erro={listagem.erro}
        mensagem={mensagem}
        vazio={listagem.itens.length === 0}
        mensagemVazio={listagem.mensagemVazio}
        paginacao={listagem.paginacao}
        aoMudarPagina={listagem.irParaPagina}
        filtros={
          <>
            <CampoBusca
              id="filtro-nome"
              label="Pesquisa"
              valor={listagem.filtros.nome ?? ""}
              aoAlterar={(valor) => listagem.definirFiltro("nome", valor)}
              placeholder="Buscar por nome, número ou identificador..."
            />

            <CampoSelect
              id="filtro-situacao"
              label="Situação"
              className={LARGURA_FILTRO}
              placeholder="Todas"
              valor={listagem.filtros.situacao ?? ""}
              aoAlterar={(valor) =>
                listagem.definirFiltro("situacao", valor, true)
              }
              opcoes={opcoesSituacao()}
            />
          </>
        }
        acoes={
          temPermissao("grupo_membro.criar") && (
            <button
              type="button"
              onClick={abrirCadastro}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
            >
              Adicionar membro
            </button>
          )
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Nome do membro</CelulaCabecalho>
              <CelulaCabecalho>Número do membro</CelulaCabecalho>
              <CelulaCabecalho>Admin</CelulaCabecalho>
              <CelulaCabecalho>Situação</CelulaCabecalho>
              <CelulaCabecalho>Status</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((vinculo) => (
              <TableRow key={vinculo.membro_id}>
                <Celula destaque>{ouTraco(vinculo.membro?.nome)}</Celula>
                <Celula>{formatarNumero(vinculo.membro?.numero)}</Celula>
                <Celula>
                  <Badge size="sm" color={vinculo.admin ? "info" : "light"}>
                    {vinculo.admin ? "Sim" : "Não"}
                  </Badge>
                </Celula>
                <Celula>
                  <Badge size="sm" color={corSituacao(vinculo.situacao)}>
                    {rotuloSituacao(vinculo.situacao)}
                  </Badge>
                </Celula>
                <Celula>
                  <BadgeStatus ativo={vinculo.status} />
                </Celula>
                <Celula>
                  <AcoesLinha
                    aoEditar={() => abrirEdicao(vinculo)}
                    aoExcluir={() => {
                      setErroExclusao(null);
                      setAlvo(vinculo);
                    }}
                    podeEditar={temPermissao("grupo_membro.editar")}
                    podeExcluir={temPermissao("grupo_membro.excluir")}
                  />
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>

      <ModalGrupoMembro
        aberto={modalAberto}
        registro={emEdicao}
        salvar={salvarVinculo}
        aoFechar={() => {
          setModalAberto(false);
          setEmEdicao(null);
        }}
        aoSalvar={aoSalvar}
      />

      <ModalExclusao
        aberto={alvo !== null}
        descricao={`o membro "${
          alvo?.membro?.nome ?? formatarNumero(alvo?.membro?.numero)
        }" deste grupo`}
        aviso={
          alvo?.situacao === "confirmado" ? (
            <>
              Este membro <strong>está dentro do grupo</strong> agora. Ao
              removê-lo, ele não poderá mais ser adicionado a este grupo — se
              precisar dele de volta, será em outro grupo do mesmo tipo.
            </>
          ) : undefined
        }
        excluindo={excluindo}
        erro={erroExclusao}
        aoConfirmar={excluir}
        aoFechar={() => {
          setAlvo(null);
          setErroExclusao(null);
        }}
      />
    </div>
  );
}
