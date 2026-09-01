import { useState } from "react";
import { useSearchParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import CartaoListagem from "../../components/crud/CartaoListagem";
import AcoesLinha from "../../components/crud/AcoesLinha";
import ModalVerAcaoGrupoLog from "../../components/acoes/ModalVerAcaoGrupoLog";
import CampoAutocomplete from "../../components/campos/CampoAutocomplete";
import CampoData from "../../components/campos/CampoData";
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
import { useEmpresaAtiva } from "../../context/EmpresaAtivaContext";
import { useListagem } from "../../hooks/useListagem";
import { acoesGruposLogsApi, gruposApi } from "../../services/api";
import type { AcaoGrupoLog, Grupo } from "../../types/modelos";
import { formatarDataHora, ouTraco } from "../../utils/formato";

const LARGURA_FILTRO = "w-full sm:w-[190px]";

/** Sucesso e erro são os dois estados possíveis de uma tentativa. */
const OPCOES_SITUACAO = [
  { valor: "1", rotulo: "Sucesso" },
  { valor: "0", rotulo: "Erro" },
];

/**
 * Logs das execuções — página somente leitura: cada linha é uma tentativa
 * do robô, com o que a API respondeu.
 *
 * `acao_grupo_id` não aparece na barra de filtros: ele chega pela query
 * string quando a tela é aberta a partir de uma execução.
 */
export default function ListaAcoesGruposLogs() {
  const { empresaId } = useEmpresaAtiva();
  const [parametros] = useSearchParams();

  const execucao = parametros.get("acao_grupo_id") ?? "";

  const listagem = useListagem<AcaoGrupoLog>({
    listar: acoesGruposLogsApi.listar,
    filtrosIniciais: {
      grupo_id: "",
      sucesso: "",
      executado_de: "",
      executado_ate: "",
      acao_grupo_id: execucao,
    },
    chaveRecarga: empresaId,
  });

  const [selecionado, setSelecionado] = useState<AcaoGrupoLog | null>(null);

  const buscarGrupos = async (termo: string): Promise<Grupo[]> => {
    const resultado = await gruposApi.listar({ nome: termo, por_pagina: 20 });

    return resultado.itens;
  };

  return (
    <div>
      <PageMeta
        title="Logs das execuções | WhatsApp Manager"
        description="Histórico de tentativas do robô"
      />

      <CabecalhoPagina
        titulo="Logs das execuções"
        trilha={[
          { rotulo: "Execuções das ações", caminho: "/acoes-grupos" },
          { rotulo: "Logs" },
        ]}
      />

      <CartaoListagem
        carregando={listagem.carregando}
        erro={listagem.erro}
        vazio={listagem.itens.length === 0}
        mensagemVazio={listagem.mensagemVazio}
        paginacao={listagem.paginacao}
        aoMudarPagina={listagem.irParaPagina}
        alinharFiltros="end"
        filtros={
          <>
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

            <CampoSelect
              id="filtro-situacao"
              label="Situação"
              className={LARGURA_FILTRO}
              placeholder="Todas"
              valor={listagem.filtros.sucesso ?? ""}
              aoAlterar={(valor) =>
                listagem.definirFiltro("sucesso", valor, true)
              }
              opcoes={OPCOES_SITUACAO}
            />

            <CampoData
              id="filtro-executado-de"
              label="Data de início"
              className={LARGURA_FILTRO}
              valor={listagem.filtros.executado_de ?? ""}
              maximo={listagem.filtros.executado_ate || undefined}
              aoAlterar={(valor) =>
                listagem.definirFiltro("executado_de", valor, true)
              }
            />

            <CampoData
              id="filtro-executado-ate"
              label="Data de fim"
              className={LARGURA_FILTRO}
              valor={listagem.filtros.executado_ate ?? ""}
              minimo={listagem.filtros.executado_de || undefined}
              aoAlterar={(valor) =>
                listagem.definirFiltro("executado_ate", valor, true)
              }
            />
          </>
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Executado em</CelulaCabecalho>
              <CelulaCabecalho>Tipo de ação</CelulaCabecalho>
              <CelulaCabecalho>Grupo</CelulaCabecalho>
              <CelulaCabecalho>Conta</CelulaCabecalho>
              <CelulaCabecalho>Situação</CelulaCabecalho>
              <CelulaCabecalho>Status</CelulaCabecalho>
              <CelulaCabecalho>Mensagem</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((log) => (
              <TableRow key={log.id}>
                <Celula destaque>{formatarDataHora(log.executado_em)}</Celula>
                <Celula>{ouTraco(log.acao_grupo?.acao?.tipo?.nome)}</Celula>
                <Celula>{ouTraco(log.acao_grupo?.grupo?.nome)}</Celula>
                <Celula>{ouTraco(log.acao_grupo?.whatsapp_conta?.nome)}</Celula>
                <Celula>
                  <Badge size="sm" color={log.sucesso ? "success" : "error"}>
                    {log.sucesso ? "Sucesso" : "Erro"}
                  </Badge>
                </Celula>
                <Celula>{log.status_code ?? "—"}</Celula>
                <Celula>{ouTraco(log.mensagem)}</Celula>
                <Celula>
                  <AcoesLinha
                    aoVisualizar={() => setSelecionado(log)}
                    podeVer
                  />
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>

      <ModalVerAcaoGrupoLog
        aberto={selecionado !== null}
        log={selecionado}
        aoFechar={() => setSelecionado(null)}
      />
    </div>
  );
}
