import { Link, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import ItemDetalhe from "../../components/crud/ItemDetalhe";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { useRegistro } from "../../hooks/useRegistro";
import { cadastrosTiposApi } from "../../services/api";
import type { CadastroTipo } from "../../types/modelos";
import { formatarDataHora } from "../../utils/formato";

export default function VerCadastroTipo() {
  const { id } = useParams();
  const { temPermissao } = useAutenticacao();
  const { registro, carregando, erro } = useRegistro<CadastroTipo>(
    cadastrosTiposApi.mostrar,
    id,
  );

  return (
    <div>
      <PageMeta
        title="Tipo de cadastro | WhatsApp Manager"
        description="Detalhes do tipo de cadastro"
      />

      <CabecalhoPagina
        titulo="Detalhes do tipo de cadastro"
        trilha={[
          { rotulo: "Tipos de cadastro", caminho: "/cadastros-tipos" },
          { rotulo: registro?.nome ?? "Detalhes" },
        ]}
        acoes={
          <>
            <Link
              to="/cadastros-tipos"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Voltar
            </Link>
            {registro && temPermissao("cadastro_tipo.editar") && (
              <Link
                to={`/cadastros-tipos/${registro.id}/editar`}
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
            <ItemDetalhe rotulo="Slug">
              <code className="rounded bg-gray-100 px-2 py-1 text-theme-xs text-gray-700 dark:bg-white/[0.06] dark:text-gray-300">
                {registro.slug}
              </code>
            </ItemDetalhe>
            <ItemDetalhe rotulo="Cadastros neste tipo">
              {registro.cadastros_count ?? 0}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Data de criação">
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
