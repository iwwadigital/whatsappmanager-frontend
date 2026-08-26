import { Link, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import AvatarNome from "../../components/crud/AvatarNome";
import BadgeStatus from "../../components/crud/BadgeStatus";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import ItemDetalhe from "../../components/crud/ItemDetalhe";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import Badge from "../../components/ui/badge/Badge";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { useRegistro } from "../../hooks/useRegistro";
import { gruposTiposApi } from "../../services/api";
import type { GrupoTipo } from "../../types/modelos";
import { formatarDataHora, ouTraco } from "../../utils/formato";

export default function VerGrupoTipo() {
  const { id } = useParams();
  const { temPermissao } = useAutenticacao();
  const { registro, carregando, erro } = useRegistro<GrupoTipo>(
    gruposTiposApi.mostrar,
    id,
  );

  return (
    <div>
      <PageMeta
        title="Tipo de grupo | WhatsApp Manager"
        description="Detalhes do tipo de grupo"
      />

      <CabecalhoPagina
        titulo="Detalhes do tipo de grupo"
        trilha={[
          { rotulo: "Tipos de grupo", caminho: "/grupos-tipos" },
          { rotulo: registro?.nome ?? "Detalhes" },
        ]}
        acoes={
          <>
            <Link
              to="/grupos-tipos"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Voltar
            </Link>
            {registro && temPermissao("grupo_tipo.editar") && (
              <Link
                to={`/grupos-tipos/${registro.id}/editar`}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
              >
                Editar
              </Link>
            )}
          </>
        }
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-6">
        {carregando && <EstadoCarregando />}

        {!carregando && erro && <MensagemErro mensagem={erro} />}

        {!carregando && registro && (
          <>
            <div className="mb-5">
              <AvatarNome
                url={registro.imagem_capa_url}
                nome={registro.nome}
                detalhe={registro.slug}
              />
            </div>

            <dl>
              <ItemDetalhe rotulo="Código">{registro.id}</ItemDetalhe>
              <ItemDetalhe rotulo="Empresa">
                {ouTraco(registro.empresa?.nome)}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Slug">{registro.slug}</ItemDetalhe>
              <ItemDetalhe rotulo="Prioridade">
                {registro.prioridade}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Máximo de participantes">
                {registro.quantidade_participantes_max}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Mínimo de administradores">
                {registro.quantidade_admin_min}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Descrição do novo grupo">
                {ouTraco(registro.descricao_novo_grupo)}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Grupos deste tipo">
                {registro.grupos && registro.grupos.length > 0 ? (
                  <span className="flex flex-wrap gap-2">
                    {registro.grupos.map((grupo) => (
                      <Badge key={grupo.id} size="sm" color="light">
                        {grupo.nome}
                      </Badge>
                    ))}
                  </span>
                ) : (
                  "—"
                )}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Status">
                <BadgeStatus ativo={registro.status} />
              </ItemDetalhe>
              <ItemDetalhe rotulo="Cadastrado em">
                {formatarDataHora(registro.created_at)}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Última atualização">
                {formatarDataHora(registro.updated_at)}
              </ItemDetalhe>
            </dl>
          </>
        )}
      </div>
    </div>
  );
}
