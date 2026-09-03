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
import { useEmpresaAtiva } from "../../context/EmpresaAtivaContext";
import { useListagem } from "../../hooks/useListagem";
import { cadastrosTiposApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { CadastroTipo } from "../../types/modelos";

const FILTROS_INICIAIS = { nome: "" };

export default function ListaCadastrosTipos() {
  const { temPermissao } = useAutenticacao();
  const { empresaId } = useEmpresaAtiva();
  const local = useLocation();

  const listagem = useListagem<CadastroTipo>({
    listar: cadastrosTiposApi.listar,
    filtrosIniciais: FILTROS_INICIAIS,
    chaveRecarga: empresaId,
  });

  const [mensagem, setMensagem] = useState<string | null>(
    (local.state as { mensagem?: string } | null)?.mensagem ?? null,
  );
  const [alvo, setAlvo] = useState<CadastroTipo | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const excluir = async () => {
    if (!alvo) return;

    setExcluindo(true);
    setErroExclusao(null);

    try {
      const retorno = await cadastrosTiposApi.remover(alvo.id);

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
        title="Tipos de cadastro | WhatsApp Manager"
        description="Listagem de tipos de cadastro"
      />

      <CabecalhoPagina
        titulo="Tipos de cadastro"
        trilha={[
          { rotulo: "Cadastros", caminho: "/cadastros" },
          { rotulo: "Tipos" },
        ]}
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
          temPermissao("cadastro_tipo.criar") && (
            <BotaoNovo para="/cadastros-tipos/novo">
              Novo tipo de cadastro
            </BotaoNovo>
          )
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Nome</CelulaCabecalho>
              <CelulaCabecalho>Slug</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((tipo) => (
              <TableRow key={tipo.id}>
                <Celula destaque>{tipo.nome}</Celula>
                {/* Chave estável: é por ela que os campos personalizados
                    apontam para o tipo. */}
                <Celula>
                  <code className="rounded bg-gray-100 px-2 py-1 text-theme-xs text-gray-700 dark:bg-white/[0.06] dark:text-gray-300">
                    {tipo.slug}
                  </code>
                </Celula>
                <Celula>
                  <AcoesLinha
                    caminhoVer={`/cadastros-tipos/${tipo.id}`}
                    caminhoEditar={`/cadastros-tipos/${tipo.id}/editar`}
                    aoExcluir={() => {
                      setErroExclusao(null);
                      setAlvo(tipo);
                    }}
                    podeVer={temPermissao("cadastro_tipo.ver")}
                    podeEditar={temPermissao("cadastro_tipo.editar")}
                    podeExcluir={temPermissao("cadastro_tipo.excluir")}
                  />
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>

      <ModalExclusao
        aberto={alvo !== null}
        descricao={`o tipo de cadastro "${alvo?.nome ?? ""}"`}
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
