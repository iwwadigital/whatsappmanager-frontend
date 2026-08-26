import { useState } from "react";
import { useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import CartaoListagem from "../../components/crud/CartaoListagem";
import BotaoNovo from "../../components/crud/BotaoNovo";
import AcoesLinha from "../../components/crud/AcoesLinha";
import AvatarNome from "../../components/crud/AvatarNome";
import BadgeStatus from "../../components/crud/BadgeStatus";
import ModalExclusao from "../../components/crud/ModalExclusao";
import CampoBusca from "../../components/campos/CampoBusca";
import CampoData from "../../components/campos/CampoData";
import CampoSelect from "../../components/campos/CampoSelect";
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
import { gruposApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { Grupo } from "../../types/modelos";
import { ouTraco } from "../../utils/formato";
import {
  corOcupacao,
  percentualOcupacao,
  textoOcupacao,
} from "../../utils/ocupacao";

/** O status já entra filtrado em "Ativo". */
const FILTROS_INICIAIS = {
  nome: "",
  status: "1",
  criado_de: "",
  criado_ate: "",
};

const LARGURA_FILTRO = "w-full xl:w-[170px]";

export default function ListaGrupos() {
  const { temPermissao } = useAutenticacao();
  const { empresaId } = useEmpresaAtiva();
  const local = useLocation();

  // Trocar a empresa no header refaz a consulta na primeira página.
  const listagem = useListagem<Grupo>({
    listar: gruposApi.listar,
    filtrosIniciais: FILTROS_INICIAIS,
    chaveRecarga: empresaId,
  });

  const [mensagem, setMensagem] = useState<string | null>(
    (local.state as { mensagem?: string } | null)?.mensagem ?? null,
  );
  const [alvo, setAlvo] = useState<Grupo | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const excluir = async () => {
    if (!alvo) return;

    setExcluindo(true);
    setErroExclusao(null);

    try {
      const retorno = await gruposApi.remover(alvo.id);

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
        title="Grupos | WhatsApp Manager"
        description="Listagem de grupos"
      />

      <CabecalhoPagina titulo="Grupos" trilha={[{ rotulo: "Grupos" }]} />

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

            {/* <CampoData
              id="filtro-criado-de"
              className={LARGURA_FILTRO}
              descricao="Criado a partir de"
              valor={listagem.filtros.criado_de ?? ""}
              maximo={listagem.filtros.criado_ate || undefined}
              aoAlterar={(valor) =>
                listagem.definirFiltro("criado_de", valor, true)
              }
            />

            <CampoData
              id="filtro-criado-ate"
              className={LARGURA_FILTRO}
              descricao="Criado até"
              valor={listagem.filtros.criado_ate ?? ""}
              minimo={listagem.filtros.criado_de || undefined}
              aoAlterar={(valor) =>
                listagem.definirFiltro("criado_ate", valor, true)
              }
            /> */}
          </>
        }
        acoes={
          temPermissao("grupo.criar") && (
            <BotaoNovo para="/grupos/novo">Novo grupo</BotaoNovo>
          )
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Grupo</CelulaCabecalho>
              <CelulaCabecalho>Empresa</CelulaCabecalho>
              <CelulaCabecalho>Participantes</CelulaCabecalho>
              <CelulaCabecalho>Máximo</CelulaCabecalho>
              <CelulaCabecalho>Status</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((grupo) => {
              const percentual = percentualOcupacao(
                grupo.quantidade_participantes,
                grupo.quantidade_participantes_max,
              );

              return (
                <TableRow key={grupo.id}>
                  <Celula>
                    <AvatarNome
                      url={grupo.imagem_capa_url}
                      nome={grupo.nome}
                      detalhe={grupo.whatsapp_id}
                    />
                  </Celula>
                  <Celula>{ouTraco(grupo.empresa?.nome)}</Celula>
                  <Celula>
                    <span className={`font-medium ${corOcupacao(percentual)}`}>
                      {textoOcupacao(
                        grupo.quantidade_participantes,
                        grupo.quantidade_participantes_max,
                      )}
                    </span>
                  </Celula>
                  <Celula>{grupo.quantidade_participantes_max ?? "—"}</Celula>
                  <Celula>
                    <BadgeStatus ativo={grupo.status} />
                  </Celula>
                  <Celula>
                    <AcoesLinha
                      caminhoVer={`/grupos/${grupo.id}`}
                      caminhoEditar={`/grupos/${grupo.id}/editar`}
                      aoExcluir={() => {
                        setErroExclusao(null);
                        setAlvo(grupo);
                      }}
                      podeVer={temPermissao("grupo.ver")}
                      podeEditar={temPermissao("grupo.editar")}
                      podeExcluir={temPermissao("grupo.excluir")}
                    />
                  </Celula>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CartaoListagem>

      <ModalExclusao
        aberto={alvo !== null}
        descricao={`o grupo "${alvo?.nome ?? ""}"`}
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
