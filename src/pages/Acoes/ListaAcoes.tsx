import { useState } from "react";
import { useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import CartaoListagem from "../../components/crud/CartaoListagem";
import AcoesLinha from "../../components/crud/AcoesLinha";
import ModalExclusao from "../../components/crud/ModalExclusao";
import ModalVerAcao from "../../components/acoes/ModalVerAcao";
import CampoAutocomplete from "../../components/campos/CampoAutocomplete";
import CampoData from "../../components/campos/CampoData";
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
import {
  acoesApi,
  acoesTiposApi,
  gruposApi,
  gruposTiposApi,
} from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { Acao, AcaoTipo, Grupo, GrupoTipo } from "../../types/modelos";
import { formatarDataHora, ouTraco } from "../../utils/formato";

const FILTROS_INICIAIS = {
  acao_tipo_id: "",
  grupo_tipo_id: "",
  grupo_id: "",
  criado_de: "",
  criado_ate: "",
};

const LARGURA_FILTRO = "w-full sm:w-[190px]";

/**
 * Listagem das ações. Não há cadastro: a ação é criada pelo sistema.
 * A visualização abre em modal; a edição (só o agendamento) tem página.
 */
export default function ListaAcoes() {
  const { temPermissao } = useAutenticacao();
  const { empresaId } = useEmpresaAtiva();
  const local = useLocation();

  const listagem = useListagem<Acao>({
    listar: acoesApi.listar,
    filtrosIniciais: FILTROS_INICIAIS,
    chaveRecarga: empresaId,
  });

  const [mensagem, setMensagem] = useState<string | null>(
    (local.state as { mensagem?: string } | null)?.mensagem ?? null,
  );
  const [visualizando, setVisualizando] = useState<Acao | null>(null);
  const [alvo, setAlvo] = useState<Acao | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const buscarTipos = async (termo: string): Promise<AcaoTipo[]> =>
    (await acoesTiposApi.listar({ nome: termo, por_pagina: 20 })).itens;

  const buscarGruposTipos = async (termo: string): Promise<GrupoTipo[]> =>
    (await gruposTiposApi.listar({ nome: termo, por_pagina: 20 })).itens;

  const buscarGrupos = async (termo: string): Promise<Grupo[]> =>
    (await gruposApi.listar({ nome: termo, por_pagina: 20 })).itens;

  const excluir = async () => {
    if (!alvo) return;

    setExcluindo(true);
    setErroExclusao(null);

    try {
      const retorno = await acoesApi.remover(alvo.id);

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
        title="Ações | WhatsApp Manager"
        description="Listagem de ações"
      />

      <CabecalhoPagina titulo="Ações" trilha={[{ rotulo: "Ações" }]} />

      <CartaoListagem
        carregando={listagem.carregando}
        erro={listagem.erro}
        mensagem={mensagem}
        vazio={listagem.itens.length === 0}
        mensagemVazio={listagem.mensagemVazio}
        paginacao={listagem.paginacao}
        aoMudarPagina={listagem.irParaPagina}
        alinharFiltros="end"
        filtros={
          <>
            <CampoAutocomplete<AcaoTipo>
              id="filtro-acao-tipo"
              label="Tipo de ação"
              className={LARGURA_FILTRO}
              valor={
                listagem.filtros.acao_tipo_id
                  ? Number(listagem.filtros.acao_tipo_id)
                  : null
              }
              aoSelecionar={(tipo) =>
                listagem.definirFiltro(
                  "acao_tipo_id",
                  tipo ? String(tipo.id) : "",
                  true,
                )
              }
              buscar={buscarTipos}
              obterValor={(tipo) => tipo.id}
              obterRotulo={(tipo) => tipo.nome}
              obterDescricao={(tipo) => tipo.funcao}
              placeholder="Todos os tipos"
            />

            <CampoAutocomplete<GrupoTipo>
              id="filtro-grupo-tipo"
              label="Tipo de grupo"
              className={LARGURA_FILTRO}
              valor={
                listagem.filtros.grupo_tipo_id
                  ? Number(listagem.filtros.grupo_tipo_id)
                  : null
              }
              aoSelecionar={(tipo) =>
                listagem.definirFiltro(
                  "grupo_tipo_id",
                  tipo ? String(tipo.id) : "",
                  true,
                )
              }
              buscar={buscarGruposTipos}
              obterValor={(tipo) => tipo.id}
              obterRotulo={(tipo) => tipo.nome}
              placeholder="Todos os tipos de grupo"
            />

            <CampoAutocomplete<Grupo>
              id="filtro-grupo"
              label="Grupo"
              className={LARGURA_FILTRO}
              valor={
                listagem.filtros.grupo_id
                  ? Number(listagem.filtros.grupo_id)
                  : null
              }
              aoSelecionar={(grupo) =>
                listagem.definirFiltro(
                  "grupo_id",
                  grupo ? String(grupo.id) : "",
                  true,
                )
              }
              buscar={buscarGrupos}
              obterValor={(grupo) => grupo.id}
              obterRotulo={(grupo) => grupo.nome}
              placeholder="Todos os grupos"
            />

            <CampoData
              id="filtro-criado-de"
              label="Data de início"
              className={LARGURA_FILTRO}
              valor={listagem.filtros.criado_de ?? ""}
              maximo={listagem.filtros.criado_ate || undefined}
              aoAlterar={(valor) =>
                listagem.definirFiltro("criado_de", valor, true)
              }
            />

            <CampoData
              id="filtro-criado-ate"
              label="Data de fim"
              className={LARGURA_FILTRO}
              valor={listagem.filtros.criado_ate ?? ""}
              minimo={listagem.filtros.criado_de || undefined}
              aoAlterar={(valor) =>
                listagem.definirFiltro("criado_ate", valor, true)
              }
            />
          </>
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Tipo de ação</CelulaCabecalho>
              <CelulaCabecalho>Tipo de grupo</CelulaCabecalho>
              <CelulaCabecalho>Grupo</CelulaCabecalho>
              <CelulaCabecalho>Agendamento</CelulaCabecalho>
              <CelulaCabecalho>Data de criação</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((acao) => (
              <TableRow key={acao.id}>
                <Celula destaque>{ouTraco(acao.tipo?.nome)}</Celula>
                <Celula>{ouTraco(acao.grupo_tipo?.nome)}</Celula>
                <Celula>{ouTraco(acao.grupo?.nome)}</Celula>
                <Celula>{formatarDataHora(acao.agendamento)}</Celula>
                <Celula>{formatarDataHora(acao.created_at)}</Celula>
                <Celula>
                  <AcoesLinha
                    aoVisualizar={() => setVisualizando(acao)}
                    caminhoEditar={`/acoes/${acao.id}/editar`}
                    aoExcluir={() => {
                      setErroExclusao(null);
                      setAlvo(acao);
                    }}
                    podeVer={temPermissao("acao.ver")}
                    podeEditar={temPermissao("acao.editar")}
                    podeExcluir={temPermissao("acao.excluir")}
                  />
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>

      <ModalVerAcao
        aberto={visualizando !== null}
        acao={visualizando}
        aoFechar={() => setVisualizando(null)}
      />

      <ModalExclusao
        aberto={alvo !== null}
        descricao={`a ação "${alvo?.tipo?.nome ?? ""}"`}
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
