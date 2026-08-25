import { useState } from "react";
import { useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import CartaoListagem from "../../components/crud/CartaoListagem";
import BotaoNovo from "../../components/crud/BotaoNovo";
import AcoesLinha from "../../components/crud/AcoesLinha";
import ModalExclusao from "../../components/crud/ModalExclusao";
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
import { permissoesApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { Permissao } from "../../types/modelos";
import { ouTraco } from "../../utils/formato";

export default function ListaPermissoes() {
  const { temPermissao } = useAutenticacao();
  const local = useLocation();

  const listagem = useListagem<Permissao>({
    listar: permissoesApi.listar,
    filtrosIniciais: { nome: "" },
  });

  const [mensagem, setMensagem] = useState<string | null>(
    (local.state as { mensagem?: string } | null)?.mensagem ?? null,
  );
  const [alvo, setAlvo] = useState<Permissao | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const excluir = async () => {
    if (!alvo) return;

    setExcluindo(true);
    setErroExclusao(null);

    try {
      const retorno = await permissoesApi.remover(alvo.id);

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
        title="Permissões | WhatsApp Manager"
        description="Listagem de permissões"
      />

      <CabecalhoPagina titulo="Permissões" trilha={[{ rotulo: "Permissões" }]} />

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
          temPermissao("permissao.criar") && (
            <BotaoNovo para="/permissoes/novo">Nova permissão</BotaoNovo>
          )
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Nome</CelulaCabecalho>
              <CelulaCabecalho>Chave</CelulaCabecalho>
              <CelulaCabecalho>Descrição</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((permissao) => (
              <TableRow key={permissao.id}>
                <Celula destaque>{permissao.nome}</Celula>
                <Celula>
                  <span className="rounded-lg bg-gray-100 px-2 py-1 text-theme-xs text-gray-700 dark:bg-white/5 dark:text-gray-300">
                    {permissao.permissao}
                  </span>
                </Celula>
                <Celula className="whitespace-normal">
                  {ouTraco(permissao.descricao)}
                </Celula>
                <Celula>
                  <AcoesLinha
                    caminhoVer={`/permissoes/${permissao.id}`}
                    caminhoEditar={`/permissoes/${permissao.id}/editar`}
                    aoExcluir={() => {
                      setErroExclusao(null);
                      setAlvo(permissao);
                    }}
                    podeVer={temPermissao("permissao.ver")}
                    podeEditar={temPermissao("permissao.editar")}
                    podeExcluir={temPermissao("permissao.excluir")}
                  />
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>

      <ModalExclusao
        aberto={alvo !== null}
        descricao={`a permissão "${alvo?.nome ?? ""}"`}
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
