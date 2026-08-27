import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import CartaoListagem from "../../components/crud/CartaoListagem";
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
import { gruposApi, gruposAtividadesApi, membrosApi } from "../../services/api";
import type { Grupo, GrupoAtividade, Membro } from "../../types/modelos";
import { corAtividade, opcoesAtividade, rotuloAtividade } from "../../utils/atividades";
import { formatarDataHora, formatarNumero, ouTraco } from "../../utils/formato";

const FILTROS_INICIAIS = {
  grupo_id: "",
  membro_id: "",
  atividade: "",
  criado_de: "",
  criado_ate: "",
};

const LARGURA_FILTRO = "w-full sm:w-[190px]";

/**
 * Log de atividades dos grupos — página somente leitura: os registros são
 * gravados pelo sistema e não podem ser criados, editados nem excluídos.
 */
export default function ListaGruposAtividades() {
  const { empresaId } = useEmpresaAtiva();

  const listagem = useListagem<GrupoAtividade>({
    listar: gruposAtividadesApi.listar,
    filtrosIniciais: FILTROS_INICIAIS,
    chaveRecarga: empresaId,
  });

  const buscarGrupos = async (termo: string): Promise<Grupo[]> => {
    const resultado = await gruposApi.listar({ nome: termo, por_pagina: 20 });

    return resultado.itens;
  };

  const buscarMembros = async (termo: string): Promise<Membro[]> => {
    const resultado = await membrosApi.listar({ nome: termo, por_pagina: 20 });

    return resultado.itens;
  };

  return (
    <div>
      <PageMeta
        title="Atividades dos grupos | WhatsApp Manager"
        description="Log de atividades dos grupos"
      />

      <CabecalhoPagina
        titulo="Atividades dos grupos"
        trilha={[
          { rotulo: "Grupos", caminho: "/grupos" },
          { rotulo: "Atividades" },
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

            <CampoAutocomplete<Membro>
              id="filtro-membro"
              label="Membro"
              className={LARGURA_FILTRO}
              valor={
                listagem.filtros.membro_id
                  ? Number(listagem.filtros.membro_id)
                  : null
              }
              aoSelecionar={(membro) =>
                listagem.definirFiltro(
                  "membro_id",
                  membro ? String(membro.id) : "",
                  true,
                )
              }
              buscar={buscarMembros}
              obterValor={(membro) => membro.id}
              obterRotulo={(membro) =>
                `${ouTraco(membro.nome)} — ${formatarNumero(membro.numero)}`
              }
              obterDescricao={(membro) => membro.identificador ?? undefined}
              placeholder="Todos os membros"
            />

            <CampoSelect
              id="filtro-atividade"
              label="Atividade"
              className={LARGURA_FILTRO}
              placeholder="Todas"
              valor={listagem.filtros.atividade ?? ""}
              aoAlterar={(valor) =>
                listagem.definirFiltro("atividade", valor, true)
              }
              opcoes={opcoesAtividade()}
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
              <CelulaCabecalho>Data</CelulaCabecalho>
              <CelulaCabecalho>Grupo</CelulaCabecalho>
              <CelulaCabecalho>Membro</CelulaCabecalho>
              <CelulaCabecalho>Número</CelulaCabecalho>
              <CelulaCabecalho>Atividade</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((atividade) => (
              <TableRow key={atividade.id}>
                <Celula>{formatarDataHora(atividade.created_at)}</Celula>
                <Celula destaque>{ouTraco(atividade.grupo?.nome)}</Celula>
                <Celula>{ouTraco(atividade.membro?.nome)}</Celula>
                <Celula>{formatarNumero(atividade.membro?.numero)}</Celula>
                <Celula>
                  <Badge size="sm" color={corAtividade(atividade.atividade)}>
                    {rotuloAtividade(atividade.atividade)}
                  </Badge>
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>
    </div>
  );
}
