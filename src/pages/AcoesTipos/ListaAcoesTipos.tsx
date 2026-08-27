import { useState } from "react";
import { useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import CartaoListagem from "../../components/crud/CartaoListagem";
import BotaoNovo from "../../components/crud/BotaoNovo";
import AcoesLinha from "../../components/crud/AcoesLinha";
import ModalExclusao from "../../components/crud/ModalExclusao";
import TextoTruncado from "../../components/crud/TextoTruncado";
import CampoBusca from "../../components/campos/CampoBusca";
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
import { useListagem } from "../../hooks/useListagem";
import { acoesTiposApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { AcaoTipo } from "../../types/modelos";
import { formatarDataHora } from "../../utils/formato";

const FILTROS_INICIAIS = { nome: "" };

export default function ListaAcoesTipos() {
  const { temPermissao } = useAutenticacao();
  const local = useLocation();

  // O catálogo é global: não depende da empresa ativa.
  const listagem = useListagem<AcaoTipo>({
    listar: acoesTiposApi.listar,
    filtrosIniciais: FILTROS_INICIAIS,
  });

  const [mensagem, setMensagem] = useState<string | null>(
    (local.state as { mensagem?: string } | null)?.mensagem ?? null,
  );
  const [alvo, setAlvo] = useState<AcaoTipo | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const excluir = async () => {
    if (!alvo) return;

    setExcluindo(true);
    setErroExclusao(null);

    try {
      const retorno = await acoesTiposApi.remover(alvo.id);

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
        title="Tipos de ação | WhatsApp Manager"
        description="Listagem de tipos de ação"
      />

      <CabecalhoPagina
        titulo="Tipos de ação"
        trilha={[{ rotulo: "Ações", caminho: "/acoes" }, { rotulo: "Tipos" }]}
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
          <CampoBusca
            id="filtro-nome"
            valor={listagem.filtros.nome ?? ""}
            aoAlterar={(valor) => listagem.definirFiltro("nome", valor)}
            placeholder="Buscar pelo nome..."
          />
        }
        acoes={
          temPermissao("acao_tipo.criar") && (
            <BotaoNovo para="/acoes-tipos/novo">Novo tipo de ação</BotaoNovo>
          )
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Nome</CelulaCabecalho>
              <CelulaCabecalho>Descrição</CelulaCabecalho>
              <CelulaCabecalho>Função</CelulaCabecalho>
              <CelulaCabecalho>Data de criação</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((tipo) => (
              <TableRow key={tipo.id}>
                <Celula destaque>{tipo.nome}</Celula>
                {/* Até 50 caracteres; o resto abre em tooltip. */}
                <Celula className="whitespace-normal">
                  <TextoTruncado texto={tipo.descricao} />
                </Celula>
                <Celula>
                  <code className="rounded bg-gray-100 px-2 py-1 text-theme-xs text-gray-700 dark:bg-white/[0.06] dark:text-gray-300">
                    {tipo.funcao}
                  </code>
                </Celula>
                <Celula>{formatarDataHora(tipo.created_at)}</Celula>
                <Celula>
                  <AcoesLinha
                    caminhoVer={`/acoes-tipos/${tipo.id}`}
                    caminhoEditar={`/acoes-tipos/${tipo.id}/editar`}
                    aoExcluir={() => {
                      setErroExclusao(null);
                      setAlvo(tipo);
                    }}
                    podeVer={temPermissao("acao_tipo.ver")}
                    podeEditar={temPermissao("acao_tipo.editar")}
                    podeExcluir={temPermissao("acao_tipo.excluir")}
                  />
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>

      <ModalExclusao
        aberto={alvo !== null}
        descricao={`o tipo de ação "${alvo?.nome ?? ""}"`}
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
