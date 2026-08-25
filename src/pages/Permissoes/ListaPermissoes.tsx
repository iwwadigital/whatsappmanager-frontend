import { useState } from "react";
import { Link, useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import BarraFiltros from "../../components/crud/BarraFiltros";
import Paginacao from "../../components/crud/Paginacao";
import AcoesLinha from "../../components/crud/AcoesLinha";
import ModalExclusao from "../../components/crud/ModalExclusao";
import CampoTexto from "../../components/campos/CampoTexto";
import {
  EstadoCarregando,
  EstadoVazio,
  MensagemErro,
  MensagemSucesso,
} from "../../components/crud/EstadosLista";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { useListagem } from "../../hooks/useListagem";
import { permissoesApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { Permissao } from "../../types/modelos";
import { ouTraco } from "../../utils/formato";

const CLASSE_TH =
  "px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400";
const CLASSE_TD = "px-5 py-4 text-sm text-gray-700 dark:text-gray-400";

export default function ListaPermissoes() {
  const { temPermissao } = useAutenticacao();
  const local = useLocation();

  const listagem = useListagem<Permissao>({
    listar: permissoesApi.listar,
    filtrosIniciais: { nome: "" },
  });

  const [nome, setNome] = useState("");
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

      <CabecalhoPagina
        titulo="Permissões"
        trilha={[{ rotulo: "Permissões" }]}
        acoes={
          temPermissao("permissao.criar") && (
            <Link
              to="/permissoes/novo"
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
            >
              Nova permissão
            </Link>
          )
        }
      />

      <BarraFiltros
        filtrando={listagem.carregando}
        aoFiltrar={() => listagem.aplicarFiltros({ nome })}
        aoLimpar={() => {
          setNome("");
          listagem.limparFiltros();
        }}
      >
        <CampoTexto
          id="filtro-nome"
          label="Nome"
          valor={nome}
          aoAlterar={setNome}
          placeholder="Buscar pelo nome"
        />
      </BarraFiltros>

      {mensagem && (
        <div className="mb-6">
          <MensagemSucesso mensagem={mensagem} />
        </div>
      )}

      {listagem.erro && (
        <div className="mb-6">
          <MensagemErro mensagem={listagem.erro} />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {listagem.carregando ? (
          <EstadoCarregando />
        ) : listagem.itens.length === 0 ? (
          <EstadoVazio
            mensagem={
              listagem.erro
                ? "Nenhum registro para exibir."
                : listagem.mensagemVazio
            }
          />
        ) : (
          <>
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell isHeader className={CLASSE_TH}>
                      Nome
                    </TableCell>
                    <TableCell isHeader className={CLASSE_TH}>
                      Chave
                    </TableCell>
                    <TableCell isHeader className={CLASSE_TH}>
                      Descrição
                    </TableCell>
                    <TableCell isHeader className={CLASSE_TH}>
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {listagem.itens.map((permissao) => (
                    <TableRow key={permissao.id}>
                      <TableCell className={`${CLASSE_TD} font-medium text-gray-800 dark:text-white/90`}>
                        {permissao.nome}
                      </TableCell>
                      <TableCell className={CLASSE_TD}>
                        <span className="rounded-lg bg-gray-100 px-2 py-1 text-theme-xs text-gray-700 dark:bg-white/5 dark:text-gray-300">
                          {permissao.permissao}
                        </span>
                      </TableCell>
                      <TableCell className={CLASSE_TD}>
                        {ouTraco(permissao.descricao)}
                      </TableCell>
                      <TableCell className={CLASSE_TD}>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Paginacao
              paginacao={listagem.paginacao}
              desabilitado={listagem.carregando}
              aoMudarPagina={listagem.irParaPagina}
            />
          </>
        )}
      </div>

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
