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
import { empresasApi } from "../../services/api";
import type { Empresa } from "../../types/modelos";
import { formatarDataHora } from "../../utils/formato";
import { normalizarHorario } from "../../utils/horarios";

export default function VerEmpresa() {
  const { id } = useParams();
  const { temPermissao } = useAutenticacao();
  const { registro, carregando, erro } = useRegistro<Empresa>(
    empresasApi.mostrar,
    id,
  );

  // Quantos tipos de cadastro já têm campos configurados. O conteúdo em si
  // é longo demais para a tela de detalhes: quem quiser vê-lo abre o
  // construtor.
  const gruposConfigurados =
    registro?.cadastros_campos_personalizados?.length ?? 0;

  return (
    <div>
      <PageMeta
        title="Empresa | WhatsApp Manager"
        description="Detalhes da empresa"
      />

      <CabecalhoPagina
        titulo="Detalhes da empresa"
        trilha={[
          { rotulo: "Empresas", caminho: "/empresas" },
          { rotulo: registro?.nome ?? "Detalhes" },
        ]}
        acoes={
          <>
            <Link
              to="/empresas"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Voltar
            </Link>
            {registro && temPermissao("empresa.editar") && (
              <Link
                to={`/empresas/${registro.id}/editar`}
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
            <ItemDetalhe rotulo="Horário dos alertas do dia">
              {normalizarHorario(registro.horario_alertas_do_dia) || "—"}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Máximo de administradores por grupo">
              {registro.quantidade_max_admin_por_grupo}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Dias para atualização do convite">
              {registro.convite_quantidade_dias_atualizacao}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Campos personalizados de cadastro">
              <span className="flex flex-wrap items-center gap-3">
                {gruposConfigurados === 0
                  ? "Nenhum tipo configurado"
                  : `${gruposConfigurados} tipo(s) de cadastro configurado(s)`}
                {temPermissao("empresa.editar") && (
                  <Link
                    to={`/empresas/${registro.id}/campos-personalizados`}
                    className="text-brand-500 hover:underline"
                  >
                    Configurar
                  </Link>
                )}
              </span>
            </ItemDetalhe>
            <ItemDetalhe rotulo="Cadastrada em">
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
