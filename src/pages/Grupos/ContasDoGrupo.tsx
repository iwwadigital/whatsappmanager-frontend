import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import CartaoListagem from "../../components/crud/CartaoListagem";
import AcoesLinha from "../../components/crud/AcoesLinha";
import BadgeStatus from "../../components/crud/BadgeStatus";
import ModalExclusao from "../../components/crud/ModalExclusao";
import ModalAdicionarConta from "../../components/gruposContas/ModalAdicionarConta";
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
import { criarGruposContasApi, gruposApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { DadosGrupoConta, Grupo, WhatsappConta } from "../../types/modelos";
import { formatarDataHora, formatarNumero, ouTraco } from "../../utils/formato";

/** Listagem das contas de WhatsApp vinculadas a um grupo específico. */
export default function ContasDoGrupo() {
  const { id } = useParams();
  const { temPermissao } = useAutenticacao();
  const { empresaId } = useEmpresaAtiva();

  const grupoId = id ?? "";
  const api = useMemo(() => criarGruposContasApi(grupoId), [grupoId]);

  const { registro: grupo } = useRegistro<Grupo>(gruposApi.mostrar, id);

  // A API devolve a coleção inteira: esta listagem não é paginada.
  const listagem = useListagem<WhatsappConta>({
    listar: api.listar,
    chaveRecarga: `${empresaId}-${grupoId}`,
  });

  const [mensagem, setMensagem] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [alvo, setAlvo] = useState<WhatsappConta | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const vincular = async (dados: DadosGrupoConta): Promise<string> => {
    await api.criar(dados);

    return "Conta vinculada ao grupo com sucesso.";
  };

  const aoSalvar = async (retorno: string) => {
    setModalAberto(false);
    setMensagem(retorno);

    await listagem.recarregar();
  };

  const excluir = async () => {
    if (!alvo) return;

    setExcluindo(true);
    setErroExclusao(null);

    try {
      const retorno = await api.remover(alvo.id);

      setAlvo(null);
      setMensagem(retorno);

      await listagem.recarregar();
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
        title="Contas do grupo | WhatsApp Manager"
        description="Contas de WhatsApp vinculadas ao grupo"
      />

      <CabecalhoPagina
        titulo={`Contas do grupo: ${nomeGrupo}`}
        trilha={[
          { rotulo: "Grupos", caminho: "/grupos" },
          { rotulo: nomeGrupo || "Grupo", caminho: `/grupos/${grupoId}` },
          { rotulo: "Contas" },
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

      <CartaoListagem
        carregando={listagem.carregando}
        erro={listagem.erro}
        mensagem={mensagem}
        vazio={listagem.itens.length === 0}
        mensagemVazio={listagem.mensagemVazio}
        paginacao={listagem.paginacao}
        aoMudarPagina={listagem.irParaPagina}
        acoes={
          temPermissao("grupo_whatsapp_conta.criar") && (
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
            >
              Adicionar conta
            </button>
          )
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Nome da conta</CelulaCabecalho>
              <CelulaCabecalho>Número</CelulaCabecalho>
              <CelulaCabecalho>API</CelulaCabecalho>
              <CelulaCabecalho>Conexão</CelulaCabecalho>
              <CelulaCabecalho>Ativa</CelulaCabecalho>
              <CelulaCabecalho>Vinculada em</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((conta) => (
              <TableRow key={conta.id}>
                <Celula destaque>{conta.nome}</Celula>
                <Celula>{formatarNumero(conta.numero)}</Celula>
                <Celula>{ouTraco(conta.whatsapp_api?.nome)}</Celula>
                <Celula>
                  <Badge size="sm" color={conta.conectada ? "success" : "error"}>
                    {conta.conectada ? "Conectada" : "Desconectada"}
                  </Badge>
                </Celula>
                <Celula>
                  <BadgeStatus ativo={conta.status} />
                </Celula>
                <Celula>{formatarDataHora(conta.pivot?.created_at)}</Celula>
                <Celula>
                  <AcoesLinha
                    caminhoVer={`/whatsapp-contas/${conta.id}`}
                    aoExcluir={() => {
                      setErroExclusao(null);
                      setAlvo(conta);
                    }}
                    podeVer={temPermissao("whatsapp_conta.ver")}
                    podeExcluir={temPermissao("grupo_whatsapp_conta.excluir")}
                  />
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>

      <ModalAdicionarConta
        aberto={modalAberto}
        salvar={vincular}
        aoFechar={() => setModalAberto(false)}
        aoSalvar={aoSalvar}
      />

      <ModalExclusao
        aberto={alvo !== null}
        descricao={`a conta "${alvo?.nome ?? ""}" deste grupo`}
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
