import { Link, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { jsonParaTexto } from "../../components/campos/CampoJson";
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

  const camposPersonalizados = jsonParaTexto(
    registro?.cadastros_campos_personalizados,
  );

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
              {camposPersonalizados === "" ? (
                "—"
              ) : (
                <pre className="max-h-64 overflow-auto rounded-lg bg-gray-50 p-3 font-mono text-xs text-gray-700 dark:bg-white/[0.03] dark:text-gray-300">
                  {camposPersonalizados}
                </pre>
              )}
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
