import { Link, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import ItemDetalhe from "../../components/crud/ItemDetalhe";
import Badge from "../../components/ui/badge/Badge";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { useRegistro } from "../../hooks/useRegistro";
import { usuariosTiposApi } from "../../services/api";
import type { UsuarioTipo } from "../../types/modelos";
import { formatarDataHora } from "../../utils/formato";

export default function VerUsuarioTipo() {
  const { id } = useParams();
  const { temPermissao } = useAutenticacao();
  const { registro, carregando, erro } = useRegistro<UsuarioTipo>(
    usuariosTiposApi.mostrar,
    id,
  );

  const permissoes = registro?.permissoes ?? [];

  return (
    <div>
      <PageMeta
        title="Tipo de usuário | WhatsApp Manager"
        description="Detalhes do tipo de usuário"
      />

      <CabecalhoPagina
        titulo="Detalhes do tipo de usuário"
        trilha={[
          { rotulo: "Tipos de usuário", caminho: "/usuarios-tipos" },
          { rotulo: registro?.nome ?? "Detalhes" },
        ]}
        acoes={
          <>
            <Link
              to="/usuarios-tipos"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Voltar
            </Link>
            {registro && temPermissao("usuario_tipo.editar") && (
              <Link
                to={`/usuarios-tipos/${registro.id}/editar`}
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
            <ItemDetalhe rotulo="Nome">{registro.nome}</ItemDetalhe>
            <ItemDetalhe rotulo="Permissões">
              {permissoes.length === 0 ? (
                "Nenhuma permissão vinculada."
              ) : (
                <div className="flex flex-wrap gap-2">
                  {permissoes.map((permissao) => (
                    <Badge key={permissao.id} size="sm" color="primary">
                      {permissao.permissao}
                    </Badge>
                  ))}
                </div>
              )}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Cadastrado em">
              {formatarDataHora(registro.created_at)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Última atualização">
              {formatarDataHora(registro.updated_at)}
            </ItemDetalhe>
          </dl>
        )}
      </div>
    </div>
  );
}
