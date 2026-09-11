import { useState } from "react";
import { useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import CartaoListagem from "../../components/crud/CartaoListagem";
import AcoesLinha from "../../components/crud/AcoesLinha";
import BotaoNovo from "../../components/crud/BotaoNovo";
import ModalExclusao from "../../components/crud/ModalExclusao";
import {
  CLASSE_CABECALHO,
  Celula,
  CelulaCabecalho,
} from "../../components/crud/Tabela";
import Badge from "../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import CampoAutocomplete from "../../components/campos/CampoAutocomplete";
import CampoBusca from "../../components/campos/CampoBusca";
import CampoData from "../../components/campos/CampoData";
import Label from "../../components/form/Label";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { useEmpresaAtiva } from "../../context/EmpresaAtivaContext";
import { useListagem } from "../../hooks/useListagem";
import { alertasApi, buscarCadastrosDoTipo } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import { TIPO_ROTA_AEREA, corSituacao } from "../../utils/alertas";
import { formatarDataHora, ouTraco } from "../../utils/formato";
import type { Alerta, Cadastro } from "../../types/modelos";

const FILTROS_INICIAIS = {
  nome: "",
  rota_aerea_id: "",
  criado_de: "",
  criado_ate: "",
};

export default function ListaAlertas() {
  const { temPermissao } = useAutenticacao();
  const { empresaId } = useEmpresaAtiva();
  const local = useLocation();

  const listagem = useListagem<Alerta>({
    listar: alertasApi.listar,
    filtrosIniciais: FILTROS_INICIAIS,
    chaveRecarga: empresaId,
  });

  const [mensagem, setMensagem] = useState<string | null>(
    (local.state as { mensagem?: string } | null)?.mensagem ?? null,
  );
  const [rotaSelecionada, setRotaSelecionada] = useState("");
  const [alvo, setAlvo] = useState<Alerta | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const excluir = async () => {
    if (!alvo) return;

    setExcluindo(true);
    setErroExclusao(null);

    try {
      const retorno = await alertasApi.remover(alvo.id);
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
        title="Alertas | WhatsApp Manager"
        description="Listagem de alertas de ofertas de passagem"
      />
      <CabecalhoPagina titulo="Alertas" trilha={[{ rotulo: "Alertas" }]} />

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
            <div className="w-full sm:w-64">
              <Label htmlFor="filtro-nome">Nome</Label>
              <CampoBusca
                id="filtro-nome"
                className="w-full"
                valor={listagem.filtros.nome ?? ""}
                aoAlterar={(valor) => listagem.definirFiltro("nome", valor)}
                placeholder="Buscar pelo nome..."
              />
            </div>

            <div className="w-full sm:w-56">
              <Label htmlFor="filtro-rota">Rota aérea</Label>
              <CampoAutocomplete<Cadastro>
                id="filtro-rota"
                valor={
                  listagem.filtros.rota_aerea_id
                    ? Number(listagem.filtros.rota_aerea_id)
                    : null
                }
                rotuloSelecionado={rotaSelecionada}
                aoSelecionar={(item) => {
                  setRotaSelecionada(item?.nome ?? "");
                  listagem.definirFiltro(
                    "rota_aerea_id",
                    item ? String(item.id) : "",
                    true,
                  );
                }}
                buscar={(termo) =>
                  buscarCadastrosDoTipo(TIPO_ROTA_AEREA, termo)
                }
                obterValor={(item) => item.id}
                obterRotulo={(item) => item.nome}
                placeholder="Todas"
              />
            </div>

            <div className="w-full sm:w-40">
              <Label htmlFor="filtro-criado-de">Criado de</Label>
              <CampoData
                id="filtro-criado-de"
                className="w-full"
                valor={listagem.filtros.criado_de ?? ""}
                aoAlterar={(valor) =>
                  listagem.definirFiltro("criado_de", valor, true)
                }
              />
            </div>

            <div className="w-full sm:w-40">
              <Label htmlFor="filtro-criado-ate">Criado até</Label>
              <CampoData
                id="filtro-criado-ate"
                className="w-full"
                minimo={listagem.filtros.criado_de || undefined}
                valor={listagem.filtros.criado_ate ?? ""}
                aoAlterar={(valor) =>
                  listagem.definirFiltro("criado_ate", valor, true)
                }
              />
            </div>
          </>
        }
        acoes={
          temPermissao("alerta.criar") && (
            <BotaoNovo para="/alertas/novo">Novo alerta</BotaoNovo>
          )
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Nome</CelulaCabecalho>
              <CelulaCabecalho>Rota aérea</CelulaCabecalho>
              <CelulaCabecalho>Criado em</CelulaCabecalho>
              <CelulaCabecalho>Agendamento</CelulaCabecalho>
              <CelulaCabecalho>Status</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((alerta) => (
              <TableRow key={alerta.id}>
                <Celula destaque>{alerta.nome}</Celula>
                <Celula>{ouTraco(alerta.rota_aerea?.nome)}</Celula>
                <Celula>{formatarDataHora(alerta.created_at)}</Celula>
                <Celula>
                  {alerta.nao_disparar_antes_de
                    ? formatarDataHora(alerta.nao_disparar_antes_de)
                    : "Assim que possível"}
                </Celula>
                <Celula>
                  <Badge color={corSituacao(alerta.situacao)}>
                    {alerta.situacao_rotulo}
                  </Badge>
                </Celula>
                <Celula>
                  <AcoesLinha
                    caminhoVer={`/alertas/${alerta.id}`}
                    caminhoEditar={`/alertas/${alerta.id}/editar`}
                    aoExcluir={() => {
                      setErroExclusao(null);
                      setAlvo(alerta);
                    }}
                    podeVer={temPermissao("alerta.ver")}
                    podeEditar={temPermissao("alerta.editar")}
                    podeExcluir={temPermissao("alerta.excluir")}
                  />
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>

      <ModalExclusao
        aberto={alvo !== null}
        descricao={`o alerta "${alvo?.nome ?? ""}"`}
        aviso={
          alvo && alvo.situacao !== "sem_disparo"
            ? "Os envios que ainda não aconteceram saem da fila do robô. O que já foi enviado permanece no histórico."
            : undefined
        }
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
