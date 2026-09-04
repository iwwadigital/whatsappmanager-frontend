import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import ItemDetalhe from "../../components/crud/ItemDetalhe";
import ResumoCamposPersonalizados from "../../components/empresas/camposPersonalizados/ResumoCamposPersonalizados";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { useRegistro } from "../../hooks/useRegistro";
import {
  cadastrosTiposApi,
  empresasApi,
  listarTiposDeCampo,
} from "../../services/api";
import type {
  CadastroTipo,
  Empresa,
  TipoCampoCatalogo,
} from "../../types/modelos";
import { formatarDataHora } from "../../utils/formato";
import { normalizarHorario } from "../../utils/horarios";

export default function VerEmpresa() {
  const { id } = useParams();
  const local = useLocation();
  const { temPermissao } = useAutenticacao();
  const { registro, carregando, erro } = useRegistro<Empresa>(
    empresasApi.mostrar,
    id,
  );

  const mensagem = (local.state as { mensagem?: string } | null)?.mensagem;

  // Apoio do resumo dos campos: o catálogo diz o que cada tipo de campo é, e
  // os tipos de cadastro trocam o slug gravado pelo nome. Nenhum dos dois é
  // essencial — sem eles o resumo mostra a chave crua em vez de sumir.
  const [catalogo, setCatalogo] = useState<TipoCampoCatalogo[]>([]);
  const [tiposDeCadastro, setTiposDeCadastro] = useState<CadastroTipo[]>([]);

  useEffect(() => {
    if (!id) return;

    let ativo = true;

    listarTiposDeCampo()
      .then((tipos) => ativo && setCatalogo(tipos))
      .catch(() => ativo && setCatalogo([]));

    // Os tipos são os da empresa desta tela, e não os da empresa ativa.
    cadastrosTiposApi
      .listar({ empresa_id: id, por_pagina: 100 })
      .then((resultado) => ativo && setTiposDeCadastro(resultado.itens))
      .catch(() => ativo && setTiposDeCadastro([]));

    return () => {
      ativo = false;
    };
  }, [id]);

  const grupos = registro?.cadastros_campos_personalizados ?? [];

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
        {mensagem && (
          <p className="mb-5 rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700 dark:bg-success-500/10 dark:text-success-400">
            {mensagem}
          </p>
        )}

        {carregando && <EstadoCarregando />}

        {!carregando && erro && <MensagemErro mensagem={erro} />}

        {!carregando && registro && (
          <>
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
              <ItemDetalhe rotulo="Cadastrada em">
                {formatarDataHora(registro.created_at)}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Última atualização">
                {formatarDataHora(registro.updated_at)}
              </ItemDetalhe>
            </dl>

            <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-800">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                    Campos personalizados de cadastro
                  </h3>
                  <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">
                    Os campos abaixo aparecem no formulário dos cadastros de
                    cada tipo, nesta ordem.
                  </p>
                </div>

                {temPermissao("empresa.editar") && (
                  <Link
                    to={`/empresas/${registro.id}/campos-personalizados`}
                    className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
                  >
                    Configurar
                  </Link>
                )}
              </div>

              {grupos.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhum tipo de cadastro configurado.
                </p>
              ) : (
                <ResumoCamposPersonalizados
                  grupos={grupos}
                  catalogo={catalogo}
                  tiposDeCadastro={tiposDeCadastro}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
