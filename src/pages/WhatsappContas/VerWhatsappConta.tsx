import { Link, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import BadgeStatus from "../../components/crud/BadgeStatus";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import ItemDetalhe from "../../components/crud/ItemDetalhe";
import Badge from "../../components/ui/badge/Badge";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { useRegistro } from "../../hooks/useRegistro";
import { whatsappContasApi } from "../../services/api";
import type { WhatsappConta } from "../../types/modelos";
import { formatarDataHora, formatarNumero, ouTraco } from "../../utils/formato";

export default function VerWhatsappConta() {
  const { id } = useParams();
  const { temPermissao } = useAutenticacao();
  const { registro, carregando, erro } = useRegistro<WhatsappConta>(
    whatsappContasApi.mostrar,
    id,
  );

  const excluida = Boolean(registro?.deleted_at);

  return (
    <div>
      <PageMeta
        title="Conta de WhatsApp | WhatsApp Manager"
        description="Detalhes da conta de WhatsApp"
      />

      <CabecalhoPagina
        titulo="Detalhes da conta"
        trilha={[
          { rotulo: "Contas de WhatsApp", caminho: "/whatsapp-contas" },
          { rotulo: registro?.nome ?? "Detalhes" },
        ]}
        acoes={
          <>
            <Link
              to="/whatsapp-contas"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Voltar
            </Link>
            {registro && !excluida && temPermissao("whatsapp_conta.editar") && (
              <Link
                to={`/whatsapp-contas/${registro.id}/editar`}
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
            <ItemDetalhe rotulo="Número">
              {formatarNumero(registro.numero)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="API">
              {ouTraco(registro.whatsapp_api?.nome)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Token">
              <span className="break-all">{registro.token}</span>
            </ItemDetalhe>
            <ItemDetalhe rotulo="Status na API">
              <Badge
                size="sm"
                color={registro.conectada ? "success" : "error"}
              >
                {registro.conectada
                  ? "Conectada"
                  : ouTraco(registro.status_api) === "—"
                    ? "Sem verificação"
                    : registro.status_api}
              </Badge>
            </ItemDetalhe>
            <ItemDetalhe rotulo="Status de sucesso da API">
              {ouTraco(registro.whatsapp_api?.status_sucesso)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Ativa">
              <BadgeStatus ativo={registro.status} />
            </ItemDetalhe>
            <ItemDetalhe rotulo="Grupos">
              {registro.grupos && registro.grupos.length > 0 ? (
                <span className="flex flex-wrap gap-2">
                  {registro.grupos.map((grupo) => (
                    <Link
                      key={grupo.id}
                      to={`/grupos/${grupo.id}/contas`}
                      className="inline-flex"
                      title={`Ver as contas de ${grupo.nome}`}
                    >
                      <Badge size="sm" color="light">
                        {grupo.nome}
                      </Badge>
                    </Link>
                  ))}
                </span>
              ) : (
                "Não está em nenhum grupo."
              )}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Empresa">
              {ouTraco(registro.empresa?.nome)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Data de criação">
              {formatarDataHora(registro.created_at)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Última atualização">
              {formatarDataHora(registro.updated_at)}
            </ItemDetalhe>
            {registro.deleted_at && (
              <ItemDetalhe rotulo="Excluída em">
                {formatarDataHora(registro.deleted_at)}
              </ItemDetalhe>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}
