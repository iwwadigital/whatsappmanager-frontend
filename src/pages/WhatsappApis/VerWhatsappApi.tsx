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
import { whatsappApisApi } from "../../services/api";
import type { WhatsappApi } from "../../types/modelos";
import { ouTraco } from "../../utils/formato";

export default function VerWhatsappApi() {
  const { id } = useParams();
  const { temPermissao } = useAutenticacao();
  const { registro, carregando, erro } = useRegistro<WhatsappApi>(
    whatsappApisApi.mostrar,
    id,
  );

  return (
    <div>
      <PageMeta
        title="API de WhatsApp | WhatsApp Manager"
        description="Detalhes da API de WhatsApp"
      />

      <CabecalhoPagina
        titulo="Detalhes da API"
        trilha={[
          { rotulo: "APIs de WhatsApp", caminho: "/whatsapp-apis" },
          { rotulo: registro?.nome ?? "Detalhes" },
        ]}
        acoes={
          <>
            <Link
              to="/whatsapp-apis"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Voltar
            </Link>
            {registro && temPermissao("whatsapp_api.editar") && (
              <Link
                to={`/whatsapp-apis/${registro.id}/editar`}
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
            <ItemDetalhe rotulo="API">
              <Badge size="sm" color="info">
                {registro.api_rotulo}
              </Badge>
            </ItemDetalhe>
            <ItemDetalhe rotulo="URL">
              <span className="break-all">{registro.url}</span>
            </ItemDetalhe>
            <ItemDetalhe rotulo="Status de sucesso">
              {ouTraco(registro.status_sucesso)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Contas vinculadas">
              {registro.contas_count ?? 0}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Empresa">
              {ouTraco(registro.empresa?.nome)}
            </ItemDetalhe>
          </dl>
        )}
      </div>
    </div>
  );
}
