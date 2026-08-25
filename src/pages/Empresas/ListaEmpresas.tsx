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
import { empresasApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { Empresa } from "../../types/modelos";
import { formatarDataHora } from "../../utils/formato";

export default function ListaEmpresas() {
  const { temPermissao } = useAutenticacao();
  const local = useLocation();

  const listagem = useListagem<Empresa>({
    listar: empresasApi.listar,
    filtrosIniciais: { nome: "" },
  });

  const [mensagem, setMensagem] = useState<string | null>(
    (local.state as { mensagem?: string } | null)?.mensagem ?? null,
  );
  const [alvo, setAlvo] = useState<Empresa | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const excluir = async () => {
    if (!alvo) return;

    setExcluindo(true);
    setErroExclusao(null);

    try {
      const retorno = await empresasApi.remover(alvo.id);

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
        title="Empresas | WhatsApp Manager"
        description="Listagem de empresas"
      />

      <CabecalhoPagina titulo="Empresas" trilha={[{ rotulo: "Empresas" }]} />

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
          temPermissao("empresa.criar") && (
            <BotaoNovo para="/empresas/novo">Nova empresa</BotaoNovo>
          )
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Nome</CelulaCabecalho>
              <CelulaCabecalho>Cadastrada em</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((empresa) => (
              <TableRow key={empresa.id}>
                <Celula destaque>{empresa.nome}</Celula>
                <Celula>{formatarDataHora(empresa.created_at)}</Celula>
                <Celula>
                  <AcoesLinha
                    caminhoVer={`/empresas/${empresa.id}`}
                    caminhoEditar={`/empresas/${empresa.id}/editar`}
                    aoExcluir={() => {
                      setErroExclusao(null);
                      setAlvo(empresa);
                    }}
                    podeVer={temPermissao("empresa.ver")}
                    podeEditar={temPermissao("empresa.editar")}
                    podeExcluir={temPermissao("empresa.excluir")}
                  />
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>

      <ModalExclusao
        aberto={alvo !== null}
        descricao={`a empresa "${alvo?.nome ?? ""}"`}
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
