import { useCallback, useState } from "react";
import { Link, useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import BarraFiltros from "../../components/crud/BarraFiltros";
import Paginacao from "../../components/crud/Paginacao";
import AcoesLinha from "../../components/crud/AcoesLinha";
import ModalExclusao from "../../components/crud/ModalExclusao";
import BadgeStatus from "../../components/crud/BadgeStatus";
import CampoTexto from "../../components/campos/CampoTexto";
import CampoSelect from "../../components/campos/CampoSelect";
import CampoTelefone from "../../components/campos/CampoTelefone";
import CampoAutocomplete from "../../components/campos/CampoAutocomplete";
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
import { empresasApi, usuariosApi, usuariosTiposApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { Empresa, Usuario, UsuarioTipo } from "../../types/modelos";
import { ouTraco } from "../../utils/formato";

const CLASSE_TH =
  "px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400";
const CLASSE_TD = "px-5 py-4 text-sm text-gray-700 dark:text-gray-400";

const FILTROS_INICIAIS = {
  nome: "",
  email: "",
  telefone: "",
  status: "",
  usuario_tipo_id: "",
  empresa_id: "",
};

export default function ListaUsuarios() {
  const { temPermissao, usuario: autenticado } = useAutenticacao();
  const local = useLocation();

  const listagem = useListagem<Usuario>({
    listar: usuariosApi.listar,
    filtrosIniciais: FILTROS_INICIAIS,
  });

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState("");
  const [tipoId, setTipoId] = useState<number | null>(null);
  const [tipoRotulo, setTipoRotulo] = useState("");
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [empresaRotulo, setEmpresaRotulo] = useState("");

  const [mensagem, setMensagem] = useState<string | null>(
    (local.state as { mensagem?: string } | null)?.mensagem ?? null,
  );
  const [alvo, setAlvo] = useState<Usuario | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const buscarTipos = useCallback(async (termo: string) => {
    const resultado = await usuariosTiposApi.listar({
      nome: termo,
      por_pagina: 10,
    });

    return resultado.itens;
  }, []);

  const buscarEmpresas = useCallback(async (termo: string) => {
    const resultado = await empresasApi.listar({ nome: termo, por_pagina: 10 });

    return resultado.itens;
  }, []);

  const filtrar = () => {
    listagem.aplicarFiltros({
      nome,
      email,
      telefone,
      status,
      usuario_tipo_id: tipoId ? String(tipoId) : "",
      empresa_id: empresaId ? String(empresaId) : "",
    });
  };

  const limpar = () => {
    setNome("");
    setEmail("");
    setTelefone("");
    setStatus("");
    setTipoId(null);
    setTipoRotulo("");
    setEmpresaId(null);
    setEmpresaRotulo("");
    listagem.limparFiltros();
  };

  const excluir = async () => {
    if (!alvo) return;

    setExcluindo(true);
    setErroExclusao(null);

    try {
      const retorno = await usuariosApi.remover(alvo.id);

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
        title="Usuários | WhatsApp Manager"
        description="Listagem de usuários"
      />

      <CabecalhoPagina
        titulo="Usuários"
        trilha={[{ rotulo: "Usuários" }]}
        acoes={
          temPermissao("usuario.criar") && (
            <Link
              to="/usuarios/novo"
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
            >
              Novo usuário
            </Link>
          )
        }
      />

      <BarraFiltros
        filtrando={listagem.carregando}
        aoFiltrar={filtrar}
        aoLimpar={limpar}
      >
        <CampoTexto
          id="filtro-nome"
          label="Nome"
          valor={nome}
          aoAlterar={setNome}
          placeholder="Buscar pelo nome"
        />

        <CampoTexto
          id="filtro-email"
          label="E-mail"
          valor={email}
          aoAlterar={setEmail}
          placeholder="Buscar pelo e-mail"
        />

        <CampoTelefone
          id="filtro-telefone"
          label="Telefone"
          valor={telefone}
          aoAlterar={setTelefone}
        />

        <CampoSelect
          id="filtro-status"
          label="Status"
          valor={status}
          aoAlterar={setStatus}
          placeholder="Todos"
          opcoes={[
            { valor: "1", rotulo: "Ativo" },
            { valor: "0", rotulo: "Inativo" },
          ]}
        />

        <CampoAutocomplete<UsuarioTipo>
          id="filtro-tipo"
          label="Tipo de usuário"
          valor={tipoId}
          rotuloSelecionado={tipoRotulo}
          buscar={buscarTipos}
          obterValor={(item) => item.id}
          obterRotulo={(item) => item.nome}
          aoSelecionar={(item) => {
            setTipoId(item ? item.id : null);
            setTipoRotulo(item ? item.nome : "");
          }}
          placeholder="Todos"
        />

        <CampoAutocomplete<Empresa>
          id="filtro-empresa"
          label="Empresa"
          valor={empresaId}
          rotuloSelecionado={empresaRotulo}
          buscar={buscarEmpresas}
          obterValor={(item) => item.id}
          obterRotulo={(item) => item.nome}
          aoSelecionar={(item) => {
            setEmpresaId(item ? item.id : null);
            setEmpresaRotulo(item ? item.nome : "");
          }}
          placeholder="Todas"
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
                      E-mail
                    </TableCell>
                    <TableCell isHeader className={CLASSE_TH}>
                      Tipo
                    </TableCell>
                    <TableCell isHeader className={CLASSE_TH}>
                      Empresa
                    </TableCell>
                    <TableCell isHeader className={CLASSE_TH}>
                      Telefone
                    </TableCell>
                    <TableCell isHeader className={CLASSE_TH}>
                      Status
                    </TableCell>
                    <TableCell isHeader className={CLASSE_TH}>
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {listagem.itens.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className={`${CLASSE_TD} font-medium text-gray-800 dark:text-white/90`}>
                        {usuario.nome}
                      </TableCell>
                      <TableCell className={CLASSE_TD}>
                        {usuario.email}
                      </TableCell>
                      <TableCell className={CLASSE_TD}>
                        {ouTraco(usuario.tipo?.nome)}
                      </TableCell>
                      <TableCell className={CLASSE_TD}>
                        {ouTraco(usuario.empresa?.nome)}
                      </TableCell>
                      <TableCell className={CLASSE_TD}>
                        {ouTraco(usuario.telefone)}
                      </TableCell>
                      <TableCell className={CLASSE_TD}>
                        <BadgeStatus ativo={usuario.status} />
                      </TableCell>
                      <TableCell className={CLASSE_TD}>
                        <AcoesLinha
                          caminhoVer={`/usuarios/${usuario.id}`}
                          caminhoEditar={`/usuarios/${usuario.id}/editar`}
                          aoExcluir={() => {
                            setErroExclusao(null);
                            setAlvo(usuario);
                          }}
                          podeVer={temPermissao("usuario.ver")}
                          podeEditar={temPermissao("usuario.editar")}
                          // A API não permite excluir o próprio usuário.
                          podeExcluir={
                            temPermissao("usuario.excluir") &&
                            autenticado?.id !== usuario.id
                          }
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
        descricao={`o usuário "${alvo?.nome ?? ""}"`}
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
