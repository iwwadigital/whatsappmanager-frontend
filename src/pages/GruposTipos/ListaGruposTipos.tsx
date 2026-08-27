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
import { gruposTiposApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { GrupoTipo } from "../../types/modelos";
import { ouTraco } from "../../utils/formato";

/** O status já entra filtrado em "Ativo". */
const FILTROS_INICIAIS = {
  nome: "",
  status: "1",
  criado_de: "",
  criado_ate: "",
};

const LARGURA_FILTRO = "w-full xl:w-[170px]";

export default function ListaGruposTipos() {
  const { temPermissao } = useAutenticacao();
  const { empresaId } = useEmpresaAtiva();
  const local = useLocation();

  // Trocar a empresa no header refaz a consulta na primeira página.
  const listagem = useListagem<GrupoTipo>({
    listar: gruposTiposApi.listar,
    filtrosIniciais: FILTROS_INICIAIS,
    chaveRecarga: empresaId,
  });

  const [mensagem, setMensagem] = useState<string | null>(
    (local.state as { mensagem?: string } | null)?.mensagem ?? null,
  );
  const [alvo, setAlvo] = useState<GrupoTipo | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const excluir = async () => {
    if (!alvo) return;

    setExcluindo(true);
    setErroExclusao(null);

    try {
      const retorno = await gruposTiposApi.remover(alvo.id);

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
        title="Tipos de grupo | WhatsApp Manager"
        description="Listagem de tipos de grupo"
      />

      <CabecalhoPagina
        titulo="Tipos de grupo"
        trilha={[{ rotulo: "Tipos de grupo" }]}
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
          temPermissao("grupo_tipo.criar") && (
            <BotaoNovo para="/grupos-tipos/novo">Novo tipo de grupo</BotaoNovo>
          )
        }
      >
        <Table>
          <TableHeader className={CLASSE_CABECALHO}>
            <TableRow>
              <CelulaCabecalho>Tipo de grupo</CelulaCabecalho>
              <CelulaCabecalho>Empresa</CelulaCabecalho>
              <CelulaCabecalho>Máx. participantes</CelulaCabecalho>
              <CelulaCabecalho>Mín. administradores</CelulaCabecalho>
              <CelulaCabecalho>Status</CelulaCabecalho>
              <CelulaCabecalho>Ações</CelulaCabecalho>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listagem.itens.map((tipo) => (
              <TableRow key={tipo.id}>
                <Celula>
                  <AvatarNome
                    url={tipo.imagem_capa_url}
                    nome={tipo.nome}
                    detalhe={tipo.slug}
                  />
                </Celula>
                <Celula>{ouTraco(tipo.empresa?.nome)}</Celula>
                <Celula>{tipo.quantidade_participantes_max}</Celula>
                <Celula>{tipo.quantidade_admin_min}</Celula>
                <Celula>
                  <BadgeStatus ativo={tipo.status} />
                </Celula>
                <Celula>
                  <AcoesLinha
                    caminhoVer={`/grupos-tipos/${tipo.id}`}
                    caminhoEditar={`/grupos-tipos/${tipo.id}/editar`}
                    aoExcluir={() => {
                      setErroExclusao(null);
                      setAlvo(tipo);
                    }}
                    podeVer={temPermissao("grupo_tipo.ver")}
                    podeEditar={temPermissao("grupo_tipo.editar")}
                    podeExcluir={temPermissao("grupo_tipo.excluir")}
                  />
                </Celula>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CartaoListagem>

      <ModalExclusao
        aberto={alvo !== null}
        descricao={`o tipo de grupo "${alvo?.nome ?? ""}"`}
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
