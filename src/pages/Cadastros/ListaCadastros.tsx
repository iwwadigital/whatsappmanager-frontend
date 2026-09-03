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
import CampoData from "../../components/campos/CampoData";
import CampoAutocomplete from "../../components/campos/CampoAutocomplete";
import Label from "../../components/form/Label";
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
import { cadastrosApi, cadastrosTiposApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { Cadastro, CadastroTipo } from "../../types/modelos";
import { formatarDataHora } from "../../utils/formato";

const FILTROS_INICIAIS = {
  nome: "",
  cadastro_tipo_id: "",
  criado_de: "",
  criado_ate: "",
};

export default function ListaCadastros() {
  const { temPermissao } = useAutenticacao();
  const { empresaId } = useEmpresaAtiva();
  const local = useLocation();

  const listagem = useListagem<Cadastro>({
    listar: cadastrosApi.listar,
    filtrosIniciais: FILTROS_INICIAIS,
    chaveRecarga: empresaId,
  });

  // O autocomplete guarda o rótulo do tipo escolhido; o filtro guarda o id.
  const [tipoEscolhido, setTipoEscolhido] = useState<CadastroTipo | null>(null);

  const [mensagem, setMensagem] = useState<string | null>(
    (local.state as { mensagem?: string } | null)?.mensagem ?? null,
  );
  const [alvo, setAlvo] = useState<Cadastro | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const excluir = async () => {
    if (!alvo) return;

    setExcluindo(true);
    setErroExclusao(null);

    try {
      const retorno = await cadastrosApi.remover(alvo.id);

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
        title="Cadastros | WhatsApp Manager"
        description="Listagem de cadastros"
      />

      <CabecalhoPagina titulo="Cadastros" trilha={[{ rotulo: "Cadastros" }]} />

      {/* Filtros com rótulo: alinhados pela base, como manda o padrão. */}
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
            <div className="w-full sm:w-56">
              <Label htmlFor="filtro-nome">Nome</Label>
              <CampoBusca
                id="filtro-nome"
                valor={listagem.filtros.nome ?? ""}
                aoAlterar={(valor) => listagem.definirFiltro("nome", valor)}
                placeholder="Buscar pelo nome..."
              />
            </div>

            <div className="w-full sm:w-56">
              <Label htmlFor="filtro-tipo">Tipo de cadastro</Label>
              <CampoAutocomplete<CadastroTipo>
                id="filtro-tipo"
                valor={tipoEscolhido?.id ?? null}
                rotuloSelecionado={tipoEscolhido?.nome ?? ""}
                aoSelecionar={(item) => {
                  setTipoEscolhido(item);
                  // Autocomplete consulta na hora, sem o atraso do texto.
                  listagem.definirFiltro(
                    "cadastro_tipo_id",
                    item ? String(item.id) : "",
                    true,
                  );
                }}
                buscar={async (termo) => {
                  const resultado = await cadastrosTiposApi.listar({
                    nome: termo,
                    por_pagina: 10,
                  });

                  return resultado.itens;
                }}
                obterValor={(item) => item.id}
                obterRotulo={(item) => item.nome}
                obterDescricao={(item) => item.slug}
                placeholder="Todos os tipos"
              />
            </div>

            <div className="w-full sm:w-40">
              <Label htmlFor="filtro-criado-de">Criado de</Label>
              <CampoData
                id="filtro-criado-de"
                valor={listagem.filtros.criado_de ?? ""}
                aoAlterar={(valor) =>
                  listagem.definirFiltro("criado_de", valor, true)
                }
                maximo={listagem.filtros.criado_ate || undefined}
                descricao="Data inicial de criação"
              />
            </div>

            <div className="w-full sm:w-40">
              <Label htmlFor="filtro-criado-ate">Criado até</Label>
              <CampoData
                id="filtro-criado-ate"
                valor={listagem.filtros.criado_ate ?? ""}
                aoAlterar={(valor) =>
                  listagem.definirFiltro("criado_ate", valor, true)
                }
                minimo={listagem.filtros.criado_de || undefined}
                descricao="Data final de criação"
              />
            </div>
          </>
        }
        acoes={
          temPermissao("cadastro.criar") && (
            <BotaoNovo para="/cadastros/novo">Novo cadastro</BotaoNovo>
          )
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Nome</CelulaCabecalho>
              <CelulaCabecalho>Descrição</CelulaCabecalho>
              <CelulaCabecalho>Data de criação</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((cadastro) => (
              <TableRow key={cadastro.id}>
                <Celula destaque>{cadastro.nome}</Celula>
                <Celula className="whitespace-normal">
                  <TextoTruncado texto={cadastro.descricao} />
                </Celula>
                <Celula>{formatarDataHora(cadastro.created_at)}</Celula>
                <Celula>
                  <AcoesLinha
                    caminhoVer={`/cadastros/${cadastro.id}`}
                    caminhoEditar={`/cadastros/${cadastro.id}/editar`}
                    aoExcluir={() => {
                      setErroExclusao(null);
                      setAlvo(cadastro);
                    }}
                    podeVer={temPermissao("cadastro.ver")}
                    podeEditar={temPermissao("cadastro.editar")}
                    podeExcluir={temPermissao("cadastro.excluir")}
                  />
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>

      <ModalExclusao
        aberto={alvo !== null}
        descricao={`o cadastro "${alvo?.nome ?? ""}"`}
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
