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
import { gruposApi } from "../../services/api";
import type { Grupo } from "../../types/modelos";
import { formatarDataHora, ouTraco } from "../../utils/formato";
import {
  corOcupacao,
  percentualOcupacao,
  textoOcupacao,
} from "../../utils/ocupacao";

export default function VerGrupo() {
  const { id } = useParams();
  const { temPermissao } = useAutenticacao();
  const { registro, carregando, erro } = useRegistro<Grupo>(
    gruposApi.mostrar,
    id,
  );

  const percentual = registro
    ? percentualOcupacao(
        registro.quantidade_participantes,
        registro.quantidade_participantes_max,
      )
    : null;

  return (
    <div>
      <PageMeta
        title="Grupo | WhatsApp Manager"
        description="Detalhes do grupo"
      />

      <CabecalhoPagina
        titulo="Detalhes do grupo"
        trilha={[
          { rotulo: "Grupos", caminho: "/grupos" },
          { rotulo: registro?.nome ?? "Detalhes" },
        ]}
        acoes={
          <>
            <Link
              to="/grupos"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Voltar
            </Link>
            {registro && temPermissao("grupo.editar") && (
              <Link
                to={`/grupos/${registro.id}/editar`}
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
                detalhe={registro.whatsapp_id}
              />
            </div>

            <dl>
              <ItemDetalhe rotulo="Código">{registro.id}</ItemDetalhe>
              <ItemDetalhe rotulo="Empresa">
                {ouTraco(registro.empresa?.nome)}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Participantes">
                <span className={`font-medium ${corOcupacao(percentual)}`}>
                  {textoOcupacao(
                    registro.quantidade_participantes,
                    registro.quantidade_participantes_max,
                  )}
                </span>
              </ItemDetalhe>
              <ItemDetalhe rotulo="Máximo de participantes">
                {registro.quantidade_participantes_max ?? "—"}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Descrição">
                {ouTraco(registro.descricao)}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Link de convite">
                {registro.convite_link ? (
                  <a
                    href={registro.convite_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-500 hover:underline"
                  >
                    {registro.convite_link}
                  </a>
                ) : (
                  "—"
                )}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Tipos de grupo">
                {registro.tipos && registro.tipos.length > 0 ? (
                  <span className="flex flex-wrap gap-2">
                    {registro.tipos.map((tipo) => (
                      <Badge key={tipo.id} size="sm" color="light">
                        {tipo.nome}
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
              <ItemDetalhe rotulo="Cheio">
                <Badge size="sm" color={registro.cheio ? "warning" : "light"}>
                  {registro.cheio
                    ? "Não é servido pelo convite"
                    : "Disponível para convite"}
                </Badge>
              </ItemDetalhe>
              <ItemDetalhe rotulo="Bloqueado pelo WhatsApp">
                {registro.bloqueado ? (
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge size="sm" color="error">
                      Bloqueado
                    </Badge>
                    <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                      em {formatarDataHora(registro.bloqueado_data)}
                    </span>
                  </span>
                ) : (
                  <Badge size="sm" color="light">
                    Não bloqueado
                  </Badge>
                )}
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
