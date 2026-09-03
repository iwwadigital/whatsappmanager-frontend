import CampoAutocomplete from "../campos/CampoAutocomplete";
import CampoData from "../campos/CampoData";
import CampoSelect from "../campos/CampoSelect";
import CampoTexto from "../campos/CampoTexto";
import Badge from "../ui/badge/Badge";
import Label from "../form/Label";
import { cadastrosApi } from "../../services/api";
import {
  aceitosDoGrupo,
  linhaVazia,
  tipoDoCampo,
} from "../../utils/camposPersonalizados";
import type { ErrosValidacao } from "../../types/api";
import type {
  Cadastro,
  CampoPersonalizado,
  TipoCampoCatalogo,
  ValorArquivo,
} from "../../types/modelos";

export interface CampoDoCadastroProps {
  campo: CampoPersonalizado;
  catalogo: TipoCampoCatalogo[];
  valor: unknown;
  aoAlterar: (valor: unknown) => void;
  /**
   * Caminho da chave, usado no upload e nas mensagens de erro: `contrato`
   * no nível do cadastro, `anexos.0.comprovante` dentro de um repetidor.
   */
  caminho: string;
  erros: ErrosValidacao;
  /** Arquivo escolhido e ainda não enviado, por caminho. */
  arquivos: Record<string, File | null>;
  aoSelecionarArquivo: (caminho: string, arquivo: File | null) => void;
  aoRemoverArquivo: (caminho: string) => void;
  /** Falso enquanto o cadastro não existe: o upload só vem depois de salvar. */
  podeAnexar: boolean;
  desabilitado?: boolean;
}

/**
 * Desenha **um** campo personalizado, pelo tipo declarado.
 *
 * O componente não tem a lista de tipos escrita: ele confere o catálogo
 * (`GET /cadastros-campos-tipos`) para saber se conhece o tipo, e escolhe o
 * componente pelo `type`. Um tipo que o back passou a aceitar mas que esta
 * tela ainda não desenha cai no texto simples, **marcado** — o valor é
 * preservado em vez de a tela quebrar.
 */
export default function CampoDoCadastro({
  campo,
  catalogo,
  valor,
  aoAlterar,
  caminho,
  erros,
  arquivos,
  aoSelecionarArquivo,
  aoRemoverArquivo,
  podeAnexar,
  desabilitado = false,
}: CampoDoCadastroProps) {
  const erro = erros[`meta.${caminho}`]?.[0];
  const tipo = tipoDoCampo(catalogo, campo);
  const id = `meta-${caminho.replace(/\./g, "-")}`;

  /* ------------------------------ Texto -------------------------------- */
  if (campo.type === "string" || !tipo) {
    return (
      <div>
        <CampoTexto
          id={id}
          label={campo.label}
          obrigatorio={campo.required}
          valor={typeof valor === "string" ? valor : ""}
          aoAlterar={aoAlterar}
          erro={erro}
          desabilitado={desabilitado}
        />
        {/* Tipo que esta versão da tela não conhece: o valor continua
            editável como texto, e nada se perde. */}
        {!tipo && (
          <p className="mt-1.5 flex items-center gap-2 text-theme-xs text-gray-500 dark:text-gray-400">
            <Badge size="sm" color="warning">
              Tipo não reconhecido
            </Badge>
            {campo.type}
          </p>
        )}
      </div>
    );
  }

  /* ------------------------------- Data -------------------------------- */
  if (campo.type === "date") {
    return (
      <CampoData
        id={id}
        label={campo.label}
        obrigatorio={campo.required}
        valor={typeof valor === "string" ? valor : ""}
        aoAlterar={aoAlterar}
        erro={erro}
        desabilitado={desabilitado}
      />
    );
  }

  /* ------------------------------ Seleção ------------------------------ */
  if (campo.type === "select") {
    return (
      <CampoSelect
        id={id}
        label={campo.label}
        obrigatorio={campo.required}
        valor={typeof valor === "string" ? valor : ""}
        aoAlterar={aoAlterar}
        opcoes={(campo.values ?? []).map((opcao) => ({
          valor: opcao.key,
          rotulo: opcao.label,
        }))}
        erro={erro}
        desabilitado={desabilitado}
      />
    );
  }

  /* ------------------- Vínculo com outro cadastro ---------------------- */
  if (campo.type === "taxonomy") {
    const escolhido = valor as { id: number; nome: string | null } | null;

    return (
      <CampoAutocomplete<Cadastro>
        id={id}
        label={campo.label}
        obrigatorio={campo.required}
        valor={escolhido?.id ?? null}
        rotuloSelecionado={escolhido?.nome ?? ""}
        aoSelecionar={(item) =>
          aoAlterar(item ? { id: item.id, nome: item.nome } : null)
        }
        buscar={async (termo) => {
          // Só os cadastros do tipo declarado no campo.
          const resultado = await cadastrosApi.listar({
            nome: termo,
            cadastro_tipo_slug: campo.taxonomy ?? "",
            por_pagina: 10,
          });

          return resultado.itens;
        }}
        obterValor={(item) => item.id}
        obterRotulo={(item) => item.nome}
        obterDescricao={(item) => item.descricao ?? undefined}
        erro={erro}
        desabilitado={desabilitado}
      />
    );
  }

  /* ------------------------------ Arquivo ------------------------------ */
  if (tipo.gravado_fora_do_formulario) {
    const atual = valor as ValorArquivo | null;
    const pendente = arquivos[caminho] ?? null;
    const formatos = tipo.atributos.find(
      (atributo) => atributo.chave === "accept_file",
    );

    return (
      <div>
        <Label htmlFor={id}>
          {campo.label}
          {campo.required && <span className="text-error-500">*</span>}
        </Label>

        <input
          id={id}
          type="file"
          accept={aceitosDoGrupo(formatos?.opcoes ?? [], campo.accept_file)}
          disabled={desabilitado}
          onChange={(evento) =>
            aoSelecionarArquivo(caminho, evento.target.files?.[0] ?? null)
          }
          className="h-11 w-full cursor-pointer rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 file:mr-4 file:h-11 file:cursor-pointer file:border-0 file:border-r file:border-gray-300 file:bg-gray-50 file:px-4 file:text-sm file:text-gray-700 focus:border-brand-300 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:file:border-gray-700 dark:file:bg-gray-800 dark:file:text-gray-400"
        />

        {/* O upload acontece depois de salvar: o caminho no disco usa o id
            do cadastro. É o mesmo contrato da imagem de capa. */}
        {pendente && (
          <p className="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
            {podeAnexar
              ? `"${pendente.name}" será enviado ao salvar.`
              : `"${pendente.name}" será enviado assim que o cadastro for criado.`}
          </p>
        )}

        {atual && !pendente && (
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-theme-xs">
            <a
              href={atual.url}
              target="_blank"
              rel="noreferrer"
              className="text-brand-500 hover:underline"
            >
              {atual.nome}
            </a>
            <button
              type="button"
              onClick={() => aoRemoverArquivo(caminho)}
              disabled={desabilitado}
              className="text-error-500 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remover
            </button>
          </p>
        )}

        {erro && <p className="mt-1.5 text-theme-xs text-error-500">{erro}</p>}
      </div>
    );
  }

  /* ----------------------------- Repetidor ----------------------------- */
  if (campo.type === "repeater") {
    const subcampos = campo.repeater ?? [];
    const linhas = (Array.isArray(valor) ? valor : []) as Record<
      string,
      unknown
    >[];

    const alterarLinha = (indice: number, chave: string, conteudo: unknown) => {
      const proximas = linhas.map((linha, posicao) =>
        posicao === indice ? { ...linha, [chave]: conteudo } : linha,
      );

      aoAlterar(proximas);
    };

    return (
      <div className="sm:col-span-2">
        <Label>
          {campo.label}
          {campo.required && <span className="text-error-500">*</span>}
        </Label>

        <div className="space-y-4">
          {linhas.map((linha, indice) => (
            <div
              key={indice}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Linha {indice + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    aoAlterar(linhas.filter((_, posicao) => posicao !== indice))
                  }
                  disabled={desabilitado}
                  className="text-theme-xs text-error-500 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remover linha
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {subcampos.map((subcampo) => (
                  <CampoDoCadastro
                    key={subcampo.key}
                    campo={subcampo}
                    catalogo={catalogo}
                    valor={linha[subcampo.key]}
                    aoAlterar={(conteudo) =>
                      alterarLinha(indice, subcampo.key, conteudo)
                    }
                    caminho={`${caminho}.${indice}.${subcampo.key}`}
                    erros={erros}
                    arquivos={arquivos}
                    aoSelecionarArquivo={aoSelecionarArquivo}
                    aoRemoverArquivo={aoRemoverArquivo}
                    podeAnexar={podeAnexar}
                    desabilitado={desabilitado}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => aoAlterar([...linhas, linhaVazia(subcampos)])}
          disabled={desabilitado}
          className="mt-3 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
        >
          Adicionar linha
        </button>

        {erro && <p className="mt-1.5 text-theme-xs text-error-500">{erro}</p>}
      </div>
    );
  }

  /* Tipo conhecido pelo back, mas sem desenho próprio aqui: texto simples. */
  return (
    <CampoTexto
      id={id}
      label={campo.label}
      obrigatorio={campo.required}
      valor={typeof valor === "string" ? valor : ""}
      aoAlterar={aoAlterar}
      erro={erro}
      desabilitado={desabilitado}
    />
  );
}
