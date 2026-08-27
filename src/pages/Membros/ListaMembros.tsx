import { useState } from "react";
import { useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import CartaoListagem from "../../components/crud/CartaoListagem";
import BotaoNovo from "../../components/crud/BotaoNovo";
import AcoesLinha from "../../components/crud/AcoesLinha";
import BadgeStatus from "../../components/crud/BadgeStatus";
import ModalExclusao from "../../components/crud/ModalExclusao";
import CampoBusca from "../../components/campos/CampoBusca";
import CampoSelect from "../../components/campos/CampoSelect";
import {
  Celula,
  CelulaCabecalho,
  CLASSE_CABECALHO,
} from "../../components/crud/Tabela";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { useEmpresaAtiva } from "../../context/EmpresaAtivaContext";
import { useListagem } from "../../hooks/useListagem";
import { membrosApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { Membro } from "../../types/modelos";
import { formatarDataHora, formatarNumero, ouTraco } from "../../utils/formato";

/** O status já entra filtrado em "Ativo" (membros não excluídos). */
const FILTROS_INICIAIS = {
  nome: "",
  status: "1",
};

const LARGURA_FILTRO = "w-full xl:w-[170px]";

export default function ListaMembros() {
  const { temPermissao } = useAutenticacao();
  const { empresaId } = useEmpresaAtiva();
  const local = useLocation();

  // Trocar a empresa no header refaz a consulta na primeira página.
  const listagem = useListagem<Membro>({
    listar: membrosApi.listar,
    filtrosIniciais: FILTROS_INICIAIS,
    chaveRecarga: empresaId,
  });

  const [mensagem, setMensagem] = useState<string | null>(
    (local.state as { mensagem?: string } | null)?.mensagem ?? null,
  );
  const [alvo, setAlvo] = useState<Membro | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const excluir = async () => {
    if (!alvo) return;

    setExcluindo(true);
    setErroExclusao(null);

    try {
      const retorno = await membrosApi.remover(alvo.id);

      setAlvo(null);
      setMensagem(retorno);

      if (listagem.itens.length === 1 && listagem.pagina > 1) {
        listagem.irParaPagina(listagem.pagina - 1);
      } else {
        await listagem.recarregar();
      }
    } catch (falha) {
      setErroExclusao(mensagemDoErro(falha));
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="Membros | WhatsApp Manager"
        description="Listagem de membros"
      />

      <CabecalhoPagina titulo="Membros" trilha={[{ rotulo: "Membros" }]} />

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
              valor={listagem.filtros.nome ?? ""}
              aoAlterar={(valor) => listagem.definirFiltro("nome", valor)}
              placeholder="Buscar por nome, número ou identificador..."
            />

            <CampoSelect
              id="filtro-status"
              className={LARGURA_FILTRO}
              placeholder="Status"
              valor={listagem.filtros.status ?? ""}
              aoAlterar={(valor) =>
                listagem.definirFiltro("status", valor, true)
              }
              opcoes={[
                { valor: "1", rotulo: "Ativo" },
                { valor: "0", rotulo: "Inativo" },
              ]}
            />
          </>
        }
        acoes={
          temPermissao("membro.criar") && (
            <BotaoNovo para="/membros/novo">Novo membro</BotaoNovo>
          )
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Nome</CelulaCabecalho>
              <CelulaCabecalho>Número</CelulaCabecalho>
              <CelulaCabecalho>Identificador</CelulaCabecalho>
              <CelulaCabecalho>Status</CelulaCabecalho>
              <CelulaCabecalho>Data de criação</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((membro) => {
              // Membro excluído não pode ser editado nem excluído de novo.
              const ativo = !membro.deleted_at;

              return (
                <TableRow key={membro.id}>
                  <Celula destaque>{ouTraco(membro.nome)}</Celula>
                  <Celula>{formatarNumero(membro.numero)}</Celula>
                  <Celula>{ouTraco(membro.identificador)}</Celula>
                  <Celula>
                    <BadgeStatus ativo={ativo} />
                  </Celula>
                  <Celula>{formatarDataHora(membro.created_at)}</Celula>
                  <Celula>
                    <AcoesLinha
                      caminhoVer={`/membros/${membro.id}`}
                      caminhoEditar={`/membros/${membro.id}/editar`}
                      aoExcluir={() => {
                        setErroExclusao(null);
                        setAlvo(membro);
                      }}
                      podeVer={temPermissao("membro.ver")}
                      podeEditar={ativo && temPermissao("membro.editar")}
                      podeExcluir={ativo && temPermissao("membro.excluir")}
                    />
                  </Celula>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CartaoListagem>

      <ModalExclusao
        aberto={alvo !== null}
        descricao={`o membro "${alvo?.nome ?? formatarNumero(alvo?.numero)}"`}
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
