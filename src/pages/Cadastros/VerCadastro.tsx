import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import ItemDetalhe from "../../components/crud/ItemDetalhe";
import ValorDoCampo from "../../components/cadastros/ValorDoCampo";
import Badge from "../../components/ui/badge/Badge";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { useRegistro } from "../../hooks/useRegistro";
import { cadastrosApi, listarTiposDeCampo } from "../../services/api";
import type { Cadastro, TipoCampoCatalogo } from "../../types/modelos";
import { camposParaExibicao } from "../../utils/camposPersonalizados";
import { formatarDataHora, ouTraco } from "../../utils/formato";

export default function VerCadastro() {
  const { id } = useParams();
  const { temPermissao } = useAutenticacao();
  const { registro, carregando, erro } = useRegistro<Cadastro>(
    cadastrosApi.mostrar,
    id,
  );

  // O catálogo diz o que cada tipo de campo é — inclusive quais têm arquivo.
  const [catalogo, setCatalogo] = useState<TipoCampoCatalogo[]>([]);

  useEffect(() => {
    let ativo = true;

    listarTiposDeCampo()
      .then((tipos) => ativo && setCatalogo(tipos))
      .catch(() => ativo && setCatalogo([]));

    return () => {
      ativo = false;
    };
  }, []);

  // Tudo que está gravado: os campos declarados pela empresa e também os
  // valores que sobraram de uma configuração anterior.
  const campos = camposParaExibicao(registro?.declaracao ?? [], registro?.meta);

  return (
    <div>
      <PageMeta
        title="Cadastro | WhatsApp Manager"
        description="Detalhes do cadastro"
      />

      <CabecalhoPagina
        titulo="Detalhes do cadastro"
        trilha={[
          { rotulo: "Cadastros", caminho: "/cadastros" },
          { rotulo: registro?.nome ?? "Detalhes" },
        ]}
        acoes={
          <>
            <Link
              to="/cadastros"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Voltar
            </Link>
            {registro && temPermissao("cadastro.editar") && (
              <Link
                to={`/cadastros/${registro.id}/editar`}
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
            <dl>
              <ItemDetalhe rotulo="Código">{registro.id}</ItemDetalhe>
              <ItemDetalhe rotulo="Nome">{registro.nome}</ItemDetalhe>
              <ItemDetalhe rotulo="Tipo de cadastro">
                {registro.tipo?.nome ?? "—"}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Descrição">
                {ouTraco(registro.descricao)}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Data de criação">
                {formatarDataHora(registro.created_at)}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Última atualização">
                {formatarDataHora(registro.updated_at)}
              </ItemDetalhe>
            </dl>

            {campos.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-800">
                <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                  Campos personalizados
                </h3>

                <dl>
                  {campos.map(({ campo, declarado }) => (
                    <ItemDetalhe key={campo.key} rotulo={campo.label}>
                      {declarado ? (
                        <ValorDoCampo
                          campo={campo}
                          catalogo={catalogo}
                          valor={registro.meta?.[campo.key]}
                        />
                      ) : (
                        // Campo que saiu da configuração da empresa: o valor
                        // continua gravado, e some da tela só quando alguém
                        // o apagar de propósito.
                        <div className="flex flex-wrap items-center gap-3">
                          <ValorDoCampo
                            campo={campo}
                            catalogo={catalogo}
                            valor={registro.meta?.[campo.key]}
                          />
                          <Badge size="sm" color="warning">
                            Fora da configuração atual
                          </Badge>
                        </div>
                      )}
                    </ItemDetalhe>
                  ))}
                </dl>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
