import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import ConstrutorCampos from "../../components/empresas/camposPersonalizados/ConstrutorCampos";
import Carregador from "../../components/campos/Carregador";
import Button from "../../components/ui/button/Button";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useRegistro } from "../../hooks/useRegistro";
import {
  cadastrosTiposApi,
  empresasApi,
  listarTiposDeCampo,
} from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type {
  CadastroTipo,
  Empresa,
  GrupoCamposPersonalizados,
  TipoCampoCatalogo,
} from "../../types/modelos";

/**
 * Os campos personalizados de cadastro de uma empresa.
 *
 * Tem página própria — e não uma seção do formulário da empresa — porque o
 * construtor é grande: são grupos por tipo de cadastro, campos dentro de
 * cada grupo e, num repetidor, campos dentro de campos.
 *
 * Salva só este campo, com um PUT da empresa: os demais dados vão junto,
 * inalterados, para o update não zerá-los.
 */
export default function CamposPersonalizadosEmpresa() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { registro, carregando, erro } = useRegistro<Empresa>(
    empresasApi.mostrar,
    id,
  );

  const [grupos, setGrupos] = useState<GrupoCamposPersonalizados[]>([]);
  const [catalogo, setCatalogo] = useState<TipoCampoCatalogo[]>([]);
  const [tiposDeCadastro, setTiposDeCadastro] = useState<CadastroTipo[]>([]);

  const [carregandoApoio, setCarregandoApoio] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  /* O catálogo de tipos de campo e os tipos de cadastro da empresa. */
  useEffect(() => {
    let ativo = true;

    Promise.all([
      listarTiposDeCampo(),
      cadastrosTiposApi.listar({ por_pagina: 100 }),
    ])
      .then(([tipos, resultado]) => {
        if (!ativo) return;

        setCatalogo(tipos);
        setTiposDeCadastro(resultado.itens);
      })
      .catch((falha) => ativo && setErroGeral(mensagemDoErro(falha)))
      .finally(() => ativo && setCarregandoApoio(false));

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    setGrupos(registro?.cadastros_campos_personalizados ?? []);
  }, [registro]);

  const salvar = async () => {
    if (!id || !registro) return;

    setSalvando(true);
    setErros({});
    setErroGeral(null);
    setMensagem(null);

    try {
      await empresasApi.atualizar(id, {
        // Os demais campos vão junto, sem alteração: o update da empresa
        // recebe o registro inteiro.
        nome: registro.nome,
        quantidade_max_admin_por_grupo: registro.quantidade_max_admin_por_grupo,
        horario_alertas_do_dia: registro.horario_alertas_do_dia,
        convite_quantidade_dias_atualizacao:
          registro.convite_quantidade_dias_atualizacao,
        cadastros_campos_personalizados: grupos,
      });

      setMensagem("Campos personalizados salvos com sucesso.");
    } catch (falha) {
      if (falha instanceof ErroApi && falha.ehValidacao) {
        setErros(falha.erros);
        setErroGeral("Verifique os campos destacados.");
      } else {
        setErroGeral(mensagemDoErro(falha));
      }
    } finally {
      setSalvando(false);
    }
  };

  const ocupado = carregando || carregandoApoio;

  return (
    <div>
      <PageMeta
        title="Campos personalizados | WhatsApp Manager"
        description="Campos personalizados de cadastro da empresa"
      />

      <CabecalhoPagina
        titulo="Campos personalizados"
        trilha={[
          { rotulo: "Empresas", caminho: "/empresas" },
          {
            rotulo: registro?.nome ?? "Empresa",
            caminho: id ? `/empresas/${id}` : undefined,
          },
          { rotulo: "Campos personalizados" },
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-6">
        {ocupado && <EstadoCarregando />}

        {!ocupado && erro && <MensagemErro mensagem={erro} />}

        {!ocupado && !erro && (
          <>
            {erroGeral && (
              <div className="mb-5">
                <MensagemErro mensagem={erroGeral} />
              </div>
            )}

            {mensagem && (
              <p className="mb-5 rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700 dark:bg-success-500/10 dark:text-success-400">
                {mensagem}
              </p>
            )}

            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
              Cada tipo de cadastro recebe os campos declarados aqui. Eles
              aparecem no formulário do cadastro, na ordem em que estiverem
              nesta tela.
            </p>

            {tiposDeCadastro.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cadastre um tipo de cadastro antes de configurar os campos
                personalizados.
              </p>
            ) : (
              <ConstrutorCampos
                valor={grupos}
                aoAlterar={setGrupos}
                catalogo={catalogo}
                tiposDeCadastro={tiposDeCadastro}
                erros={erros}
                desabilitado={salvando}
              />
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                onClick={salvar}
                disabled={salvando || tiposDeCadastro.length === 0}
                startIcon={salvando ? <Carregador tamanho="size-4" /> : undefined}
              >
                Salvar
              </Button>
              <button
                type="button"
                onClick={() => navegar("/empresas")}
                disabled={salvando}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
              >
                Voltar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
