import { Link, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import BadgeStatus from "../../components/crud/BadgeStatus";
import Badge from "../../components/ui/badge/Badge";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import ItemDetalhe from "../../components/crud/ItemDetalhe";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { useRegistro } from "../../hooks/useRegistro";
import { membrosApi } from "../../services/api";
import type { Membro } from "../../types/modelos";
import { formatarDataHora, formatarNumero, ouTraco } from "../../utils/formato";

export default function VerMembro() {
  const { id } = useParams();
  const { temPermissao } = useAutenticacao();
  const { registro, carregando, erro } = useRegistro<Membro>(
    membrosApi.mostrar,
    id,
  );

  const ativo = registro ? !registro.deleted_at : false;

  return (
    <div>
      <PageMeta
        title="Membro | WhatsApp Manager"
        description="Detalhes do membro"
      />

      <CabecalhoPagina
        titulo="Detalhes do membro"
        trilha={[
          { rotulo: "Membros", caminho: "/membros" },
          { rotulo: registro?.nome ?? "Detalhes" },
        ]}
        acoes={
          <>
            <Link
              to="/membros"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Voltar
            </Link>
            {registro && ativo && temPermissao("membro.editar") && (
              <Link
                to={`/membros/${registro.id}/editar`}
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
          <dl>
            <ItemDetalhe rotulo="Código">{registro.id}</ItemDetalhe>
            <ItemDetalhe rotulo="Nome">{ouTraco(registro.nome)}</ItemDetalhe>
            <ItemDetalhe rotulo="Número">
              {formatarNumero(registro.numero)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Identificador">
              {ouTraco(registro.identificador)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Empresa">
              {ouTraco(registro.empresa?.nome)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Status">
              <BadgeStatus ativo={ativo} />
            </ItemDetalhe>
            <ItemDetalhe rotulo="Grupos">
              {registro.grupos && registro.grupos.length > 0 ? (
                <span className="flex flex-wrap gap-2">
                  {registro.grupos.map((grupo) => (
                    <Link
                      key={grupo.id}
                      to={`/grupos//membros`}
                      className="inline-flex"
                      title={`Ver os membros de `}
                    >
                      <Badge
                        size="sm"
                        color={grupo.pivot?.admin ? "info" : "light"}
                      >
                        {grupo.nome}
                        {grupo.pivot?.admin ? " · admin" : ""}
                      </Badge>
                    </Link>
                  ))}
                </span>
              ) : (
                "Não está em nenhum grupo."
              )}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Data de criação">
              {formatarDataHora(registro.created_at)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Última atualização">
              {formatarDataHora(registro.updated_at)}
            </ItemDetalhe>
            {registro.deleted_at && (
              <ItemDetalhe rotulo="Excluído em">
                {formatarDataHora(registro.deleted_at)}
              </ItemDetalhe>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}
