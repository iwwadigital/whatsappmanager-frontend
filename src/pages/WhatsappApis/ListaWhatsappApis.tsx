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
import Badge from "../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { useEmpresaAtiva } from "../../context/EmpresaAtivaContext";
import { useListagem } from "../../hooks/useListagem";
import { whatsappApisApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { WhatsappApi } from "../../types/modelos";
import { ouTraco } from "../../utils/formato";

const FILTROS_INICIAIS = { nome: "" };

export default function ListaWhatsappApis() {
  const { temPermissao } = useAutenticacao();
  const { empresaId } = useEmpresaAtiva();
  const local = useLocation();

  const listagem = useListagem<WhatsappApi>({
    listar: whatsappApisApi.listar,
    filtrosIniciais: FILTROS_INICIAIS,
    chaveRecarga: empresaId,
  });

  const [mensagem, setMensagem] = useState<string | null>(
    (local.state as { mensagem?: string } | null)?.mensagem ?? null,
  );
  const [alvo, setAlvo] = useState<WhatsappApi | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const excluir = async () => {
    if (!alvo) return;

    setExcluindo(true);
    setErroExclusao(null);

    try {
      const retorno = await whatsappApisApi.remover(alvo.id);

      setAlvo(null);
      setMensagem(retorno);

      if (listagem.itens.length === 1 && listagem.pagina > 1) {
        listagem.irParaPagina(listagem.pagina - 1);
      } else {
        await listagem.recarregar();
      }
    } catch (falha) {
      // 409 quando a API tem contas vinculadas.
      setErroExclusao(mensagemDoErro(falha));
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="APIs de WhatsApp | WhatsApp Manager"
        description="Listagem de APIs de WhatsApp"
      />

      <CabecalhoPagina
        titulo="APIs de WhatsApp"
        trilha={[{ rotulo: "APIs de WhatsApp" }]}
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
            placeholder="Buscar por nome..."
          />
        }
        acoes={
          temPermissao("whatsapp_api.criar") && (
            <BotaoNovo para="/whatsapp-apis/novo">Nova API</BotaoNovo>
          )
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Nome</CelulaCabecalho>
              <CelulaCabecalho>API</CelulaCabecalho>
              <CelulaCabecalho>URL</CelulaCabecalho>
              <CelulaCabecalho>Status de sucesso</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((api) => (
              <TableRow key={api.id}>
                <Celula destaque>{api.nome}</Celula>
                <Celula>
                  <Badge size="sm" color="info">
                    {api.api_rotulo}
                  </Badge>
                </Celula>
                <Celula>
                  <TextoTruncado texto={api.url} limite={40} />
                </Celula>
                <Celula>{ouTraco(api.status_sucesso)}</Celula>
                <Celula>
                  <AcoesLinha
                    caminhoVer={`/whatsapp-apis/${api.id}`}
                    caminhoEditar={`/whatsapp-apis/${api.id}/editar`}
                    aoExcluir={() => {
                      setErroExclusao(null);
                      setAlvo(api);
                    }}
                    podeVer={temPermissao("whatsapp_api.ver")}
                    podeEditar={temPermissao("whatsapp_api.editar")}
                    podeExcluir={temPermissao("whatsapp_api.excluir")}
                  />
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>

      <ModalExclusao
        aberto={alvo !== null}
        descricao={`a API "${alvo?.nome ?? ""}"`}
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
