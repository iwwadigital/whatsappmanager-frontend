import { useCallback, useState } from "react";
import { useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import CartaoListagem from "../../components/crud/CartaoListagem";
import BotaoNovo from "../../components/crud/BotaoNovo";
import AcoesLinha from "../../components/crud/AcoesLinha";
import ModalExclusao from "../../components/crud/ModalExclusao";
import BadgeStatus from "../../components/crud/BadgeStatus";
import CampoBusca from "../../components/campos/CampoBusca";
import CampoSelect from "../../components/campos/CampoSelect";
import CampoAutocomplete from "../../components/campos/CampoAutocomplete";
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
import { empresasApi, usuariosApi, usuariosTiposApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { Empresa, Usuario, UsuarioTipo } from "../../types/modelos";
import { formatarTelefone } from "../../components/campos/CampoTelefone";
import { ouTraco } from "../../utils/formato";

const FILTROS_INICIAIS = {
  nome: "",
  email: "",
  telefone: "",
  status: "",
  usuario_tipo_id: "",
  empresa_id: "",
};

const LARGURA_FILTRO = "w-full xl:w-[200px]";

export default function ListaUsuarios() {
  const { temPermissao, usuario: autenticado } = useAutenticacao();
  const local = useLocation();

  const listagem = useListagem<Usuario>({
    listar: usuariosApi.listar,
    filtrosIniciais: FILTROS_INICIAIS,
  });

  const [tipoRotulo, setTipoRotulo] = useState("");
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

      <CabecalhoPagina titulo="Usuários" trilha={[{ rotulo: "Usuários" }]} />

      <CartaoListagem
        carregando={listagem.carregando}
        erro={listagem.erro}
        mensagem={mensagem}
        vazio={listagem.itens.length === 0}
        mensagemVazio={listagem.mensagemVazio}
        paginacao={listagem.paginacao}
        aoMudarPagina={listagem.irParaPagina}
        filtros={
          <>
            <CampoBusca
              id="filtro-nome"
              valor={listagem.filtros.nome ?? ""}
              aoAlterar={(valor) => listagem.definirFiltro("nome", valor)}
              placeholder="Buscar pelo nome..."
            />

            <CampoSelect
              id="filtro-status"
              className={LARGURA_FILTRO}
              placeholder="Status"
              valor={listagem.filtros.status ?? ""}
              aoAlterar={(valor) =>
                listagem.definirFiltro("status", valor, true)
              }
              opcoes={[
                { valor: "1", rotulo: "Ativo" },
                { valor: "0", rotulo: "Inativo" },
              ]}
            />

            <CampoAutocomplete<UsuarioTipo>
              id="filtro-tipo"
              className={LARGURA_FILTRO}
              placeholder="Tipo de usuário"
              valor={
                listagem.filtros.usuario_tipo_id
                  ? Number(listagem.filtros.usuario_tipo_id)
                  : null
              }
              rotuloSelecionado={tipoRotulo}
              buscar={buscarTipos}
              obterValor={(item) => item.id}
              obterRotulo={(item) => item.nome}
              aoSelecionar={(item) => {
                setTipoRotulo(item ? item.nome : "");
                listagem.definirFiltro(
                  "usuario_tipo_id",
                  item ? String(item.id) : "",
                  true,
                );
              }}
            />

            <CampoAutocomplete<Empresa>
              id="filtro-empresa"
              className={LARGURA_FILTRO}
              placeholder="Empresa"
              valor={
                listagem.filtros.empresa_id
                  ? Number(listagem.filtros.empresa_id)
                  : null
              }
              rotuloSelecionado={empresaRotulo}
              buscar={buscarEmpresas}
              obterValor={(item) => item.id}
              obterRotulo={(item) => item.nome}
              aoSelecionar={(item) => {
                setEmpresaRotulo(item ? item.nome : "");
                listagem.definirFiltro(
                  "empresa_id",
                  item ? String(item.id) : "",
                  true,
                );
              }}
            />
          </>
        }
        acoes={
          temPermissao("usuario.criar") && (
            <BotaoNovo para="/usuarios/novo">Novo usuário</BotaoNovo>
          )
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Nome</CelulaCabecalho>
              <CelulaCabecalho>E-mail</CelulaCabecalho>
              <CelulaCabecalho>Tipo</CelulaCabecalho>
              <CelulaCabecalho>Empresa</CelulaCabecalho>
              <CelulaCabecalho>Telefone</CelulaCabecalho>
              <CelulaCabecalho>Status</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((usuario) => (
              <TableRow key={usuario.id}>
                <Celula destaque>{usuario.nome}</Celula>
                <Celula>{usuario.email}</Celula>
                <Celula>{ouTraco(usuario.tipo?.nome)}</Celula>
                <Celula>{ouTraco(usuario.empresa?.nome)}</Celula>
                <Celula>{ouTraco(usuario.telefone)}</Celula>
                <Celula>
                  <BadgeStatus ativo={usuario.status} />
                </Celula>
                <Celula>
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
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>

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
