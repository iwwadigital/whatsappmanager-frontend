import { useState } from "react";
import { Link, useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import CartaoListagem from "../../components/crud/CartaoListagem";
import AcoesLinha from "../../components/crud/AcoesLinha";
import CampoAutocomplete from "../../components/campos/CampoAutocomplete";
import CampoBusca from "../../components/campos/CampoBusca";
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
import { TimeIcon } from "../../icons";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { useEmpresaAtiva } from "../../context/EmpresaAtivaContext";
import { useListagem } from "../../hooks/useListagem";
import {
  acoesGruposApi,
  acoesTiposApi,
  whatsappContasApi,
} from "../../services/api";
import type { AcaoGrupo, AcaoTipo, WhatsappConta } from "../../types/modelos";
import { formatarDataHora, formatarNumero, ouTraco } from "../../utils/formato";

const FILTROS_INICIAIS = {
  acao_tipo_id: "",
  whatsapp_conta_id: "",
  grupo: "",
  inicio_de: "",
  inicio_ate: "",
};

const LARGURA_FILTRO = "w-full sm:w-[190px]";

/**
 * Execuções das ações nos grupos — quem cria a linha é o robô.
 * A tela só lista e edita prioridade e "inicia a partir de".
 */
export default function ListaAcoesGrupos() {
  const { temPermissao } = useAutenticacao();
  const { empresaId } = useEmpresaAtiva();
  const local = useLocation();

  const listagem = useListagem<AcaoGrupo>({
    listar: acoesGruposApi.listar,
    filtrosIniciais: FILTROS_INICIAIS,
    chaveRecarga: empresaId,
  });

  const [mensagem] = useState<string | null>(
    (local.state as { mensagem?: string } | null)?.mensagem ?? null,
  );

  const buscarTipos = async (termo: string) => {
    const resultado = await acoesTiposApi.listar({
      nome: termo,
      por_pagina: 20,
    });

    return resultado.itens;
  };

  const buscarContas = async (termo: string) => {
    const resultado = await whatsappContasApi.listar({ nome: termo });

    return resultado.itens;
  };

  return (
    <div>
      <PageMeta
        title="Execuções das ações | WhatsApp Manager"
        description="Execuções das ações nos grupos"
      />

      <CabecalhoPagina
        titulo="Execuções das ações"
        trilha={[{ rotulo: "Execuções das ações" }]}
      />

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

            <CampoAutocomplete<WhatsappConta>
              id="filtro-conta"
              label="Conta"
              className={LARGURA_FILTRO}
              valor={
                listagem.filtros.whatsapp_conta_id
                  ? Number(listagem.filtros.whatsapp_conta_id)
                  : null
              }
              aoSelecionar={(conta) =>
                listagem.definirFiltro(
                  "whatsapp_conta_id",
                  conta ? String(conta.id) : "",
                  true,
                )
              }
              buscar={buscarContas}
              obterValor={(conta) => conta.id}
              obterRotulo={(conta) => conta.nome}
              obterDescricao={(conta) => formatarNumero(conta.numero)}
              placeholder="Todas as contas"
            />

            <CampoBusca
              id="filtro-grupo"
              label="Grupo"
              className={LARGURA_FILTRO}
              valor={listagem.filtros.grupo ?? ""}
              aoAlterar={(valor) => listagem.definirFiltro("grupo", valor)}
              placeholder="Nome do grupo"
            />

            <CampoData
              id="filtro-inicio-de"
              label="Data de início"
              className={LARGURA_FILTRO}
              valor={listagem.filtros.inicio_de ?? ""}
              maximo={listagem.filtros.inicio_ate || undefined}
              aoAlterar={(valor) =>
                listagem.definirFiltro("inicio_de", valor, true)
              }
            />

            <CampoData
              id="filtro-inicio-ate"
              label="Data de fim"
              className={LARGURA_FILTRO}
              valor={listagem.filtros.inicio_ate ?? ""}
              minimo={listagem.filtros.inicio_de || undefined}
              aoAlterar={(valor) =>
                listagem.definirFiltro("inicio_ate", valor, true)
              }
            />
          </>
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Tipo de ação</CelulaCabecalho>
              <CelulaCabecalho>Grupo</CelulaCabecalho>
              <CelulaCabecalho>Conta</CelulaCabecalho>
              <CelulaCabecalho>Prioridade</CelulaCabecalho>
              <CelulaCabecalho>Inicia a partir de</CelulaCabecalho>
              <CelulaCabecalho>Iniciado</CelulaCabecalho>
              <CelulaCabecalho>Finalizado</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((execucao) => (
              <TableRow key={execucao.id}>
                <Celula destaque>{ouTraco(execucao.acao?.tipo?.nome)}</Celula>
                <Celula>{ouTraco(execucao.grupo?.nome)}</Celula>
                <Celula>{ouTraco(execucao.whatsapp_conta?.nome)}</Celula>
                <Celula>{execucao.prioridade}</Celula>
                <Celula>{formatarDataHora(execucao.iniciar_apartir_de)}</Celula>
                <Celula>{formatarDataHora(execucao.iniciado)}</Celula>
                <Celula>{formatarDataHora(execucao.finalizado)}</Celula>
                <Celula>
                  <AcoesLinha
                    caminhoEditar={`/acoes-grupos/${execucao.id}/editar`}
                    podeEditar={temPermissao("acao_grupo.editar")}
                    extra={
                      temPermissao("acao_grupo_log.ver") && (
                        <Link
                          to={`/acoes-grupos-logs?acao_grupo_id=${execucao.id}`}
                          title="Logs desta execução"
                          aria-label="Logs desta execução"
                          className="text-gray-500 transition hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                        >
                          <TimeIcon className="size-5 fill-current" />
                        </Link>
                      )
                    }
                  />
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>
    </div>
  );
}
