import { useState } from "react";
import { useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import CartaoListagem from "../../components/crud/CartaoListagem";
import BotaoNovo from "../../components/crud/BotaoNovo";
import AcoesLinha from "../../components/crud/AcoesLinha";
import BadgeStatus from "../../components/crud/BadgeStatus";
import ModalExclusao from "../../components/crud/ModalExclusao";
import TextoTruncado from "../../components/crud/TextoTruncado";
import CampoBusca from "../../components/campos/CampoBusca";
import CampoAutocomplete from "../../components/campos/CampoAutocomplete";
import CampoSelect from "../../components/campos/CampoSelect";
import Carregador from "../../components/campos/Carregador";
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
import { RegenerateIcon } from "../../icons";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { useEmpresaAtiva } from "../../context/EmpresaAtivaContext";
import { useListagem } from "../../hooks/useListagem";
import { whatsappApisApi, whatsappContasApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { WhatsappApi, WhatsappConta } from "../../types/modelos";
import { formatarNumero, ouTraco } from "../../utils/formato";

const FILTROS_INICIAIS = { nome: "", whatsapp_api_id: "", status: "" };

const LARGURA_FILTRO = "w-full xl:w-[170px]";

/**
 * A linha fica verde quando o `status_api` da conta é igual ao
 * `status_sucesso` da API; caso contrário, vermelha.
 */
const CLASSE_LINHA_CONECTADA = "bg-success-50 dark:bg-success-500/10";
const CLASSE_LINHA_DESCONECTADA = "bg-error-50 dark:bg-error-500/10";

/** Listagem de contas — sem paginação, como manda a regra do recurso. */
export default function ListaWhatsappContas() {
  const { temPermissao } = useAutenticacao();
  const { empresaId } = useEmpresaAtiva();
  const local = useLocation();

  const listagem = useListagem<WhatsappConta>({
    listar: whatsappContasApi.listar,
    filtrosIniciais: FILTROS_INICIAIS,
    chaveRecarga: empresaId,
  });

  const [mensagem, setMensagem] = useState<string | null>(
    (local.state as { mensagem?: string } | null)?.mensagem ?? null,
  );
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [verificando, setVerificando] = useState<number | null>(null);
  const [alvo, setAlvo] = useState<WhatsappConta | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const buscarApis = async (termo: string) => {
    const resultado = await whatsappApisApi.listar({
      nome: termo,
      por_pagina: 20,
    });

    return resultado.itens;
  };

  /** Consulta o status na API e recarrega a linha. */
  const verificar = async (conta: WhatsappConta) => {
    setVerificando(conta.id);
    setErroAcao(null);
    setMensagem(null);

    try {
      const { mensagem: retorno } = await whatsappContasApi.sincronizarStatus(
        conta.id,
      );

      setMensagem(retorno);
    } catch (falha) {
      // 409 quando a API não responde ou não tem interface de conexão.
      setErroAcao(mensagemDoErro(falha));
    } finally {
      setVerificando(null);
      await listagem.recarregar();
    }
  };

  const excluir = async () => {
    if (!alvo) return;

    setExcluindo(true);
    setErroExclusao(null);

    try {
      const retorno = await whatsappContasApi.remover(alvo.id);

      setAlvo(null);
      setMensagem(retorno);
      await listagem.recarregar();
    } catch (falha) {
      setErroExclusao(mensagemDoErro(falha));
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="Contas de WhatsApp | WhatsApp Manager"
        description="Listagem de contas de WhatsApp"
      />

      <CabecalhoPagina
        titulo="Contas de WhatsApp"
        trilha={[{ rotulo: "Contas de WhatsApp" }]}
      />

      <CartaoListagem
        carregando={listagem.carregando}
        erro={listagem.erro ?? erroAcao}
        mensagem={mensagem}
        vazio={listagem.itens.length === 0}
        mensagemVazio={listagem.mensagemVazio}
        // A API devolve a coleção inteira: não há bloco de paginação.
        paginacao={listagem.paginacao}
        aoMudarPagina={listagem.irParaPagina}
        filtros={
          <>
            <CampoBusca
              id="filtro-nome"
              valor={listagem.filtros.nome ?? ""}
              aoAlterar={(valor) => listagem.definirFiltro("nome", valor)}
              placeholder="Buscar por nome ou número..."
            />

            <CampoAutocomplete<WhatsappApi>
              id="filtro-api"
              className={LARGURA_FILTRO}
              valor={
                listagem.filtros.whatsapp_api_id
                  ? Number(listagem.filtros.whatsapp_api_id)
                  : null
              }
              aoSelecionar={(api) =>
                listagem.definirFiltro(
                  "whatsapp_api_id",
                  api ? String(api.id) : "",
                  true,
                )
              }
              buscar={buscarApis}
              obterValor={(api) => api.id}
              obterRotulo={(api) => api.nome}
              placeholder="API"
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
                { valor: "1", rotulo: "Ativa" },
                { valor: "0", rotulo: "Inativa" },
              ]}
            />
          </>
        }
        acoes={
          temPermissao("whatsapp_conta.criar") && (
            <BotaoNovo para="/whatsapp-contas/novo">Nova conta</BotaoNovo>
          )
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>API</CelulaCabecalho>
              <CelulaCabecalho>Telefone</CelulaCabecalho>
              <CelulaCabecalho>Nome</CelulaCabecalho>
              <CelulaCabecalho>Token</CelulaCabecalho>
              <CelulaCabecalho>Status</CelulaCabecalho>
              <CelulaCabecalho>Ativo</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((conta) => (
              <TableRow
                key={conta.id}
                className={
                  conta.conectada
                    ? CLASSE_LINHA_CONECTADA
                    : CLASSE_LINHA_DESCONECTADA
                }
              >
                <Celula>{ouTraco(conta.whatsapp_api?.nome)}</Celula>
                <Celula>{formatarNumero(conta.numero)}</Celula>
                <Celula destaque>{conta.nome}</Celula>
                <Celula>
                  <TextoTruncado texto={conta.token} limite={20} />
                </Celula>
                <Celula>
                  <Badge size="sm" color={conta.conectada ? "success" : "error"}>
                    {conta.conectada
                      ? "Conectada"
                      : ouTraco(conta.status_api) === "—"
                        ? "Sem verificação"
                        : conta.status_api}
                  </Badge>
                </Celula>
                <Celula>
                  <BadgeStatus ativo={conta.status} />
                </Celula>
                <Celula>
                  <AcoesLinha
                    extra={
                      temPermissao("whatsapp_conta.editar") ? (
                        <button
                          type="button"
                          title="Verificar conexão"
                          aria-label="Verificar conexão"
                          disabled={verificando === conta.id}
                          onClick={() => void verificar(conta)}
                          className="text-gray-500 transition hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-white/90"
                        >
                          {verificando === conta.id ? (
                            <Carregador tamanho="size-5" />
                          ) : (
                            <RegenerateIcon className="size-5 fill-current" />
                          )}
                        </button>
                      ) : undefined
                    }
                    caminhoVer={`/whatsapp-contas/${conta.id}`}
                    caminhoEditar={`/whatsapp-contas/${conta.id}/editar`}
                    aoExcluir={() => {
                      setErroExclusao(null);
                      setAlvo(conta);
                    }}
                    podeVer={temPermissao("whatsapp_conta.ver")}
                    podeEditar={temPermissao("whatsapp_conta.editar")}
                    podeExcluir={temPermissao("whatsapp_conta.excluir")}
                  />
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>

      <ModalExclusao
        aberto={alvo !== null}
        descricao={`a conta "${alvo?.nome ?? ""}"`}
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
