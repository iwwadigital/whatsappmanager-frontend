import type { ReactNode } from "react";
import CampoSelect from "../../campos/CampoSelect";
import CampoTexto from "../../campos/CampoTexto";
import Badge from "../../ui/badge/Badge";
import Label from "../../form/Label";
import { gerarChave } from "../../../utils/camposPersonalizados";
import type {
  AtributoCampo,
  CadastroTipo,
  OpcaoCampo,
} from "../../../types/modelos";

interface EditorAtributoProps {
  atributo: AtributoCampo;
  valor: unknown;
  aoAlterar: (valor: unknown) => void;
  /** Tipos de cadastro da empresa, para o formato `tipo_cadastro`. */
  tiposDeCadastro: CadastroTipo[];
  /** Prefixo do id dos campos, para não repetir ids na página. */
  prefixo: string;
  erro?: string;
  desabilitado?: boolean;
  /** Desenho do formato `lista_campos` — entregue pelo EditorCampo. */
  renderizarListaDeCampos?: () => ReactNode;
}

/**
 * Desenha **um atributo** da declaração de um campo, pelo `formato` dele.
 *
 * É aqui que mora a extensibilidade do lado da tela: o back diz o formato
 * (`Atributo::FORMATO_*`) e este componente escolhe o desenho. Um tipo de
 * campo novo que reaproveite um formato existente não pede nenhuma linha
 * aqui — e um formato novo aparece marcado como não suportado, com o valor
 * preservado, em vez de sumir da configuração.
 */
export default function EditorAtributo({
  atributo,
  valor,
  aoAlterar,
  tiposDeCadastro,
  prefixo,
  erro,
  desabilitado = false,
  renderizarListaDeCampos,
}: EditorAtributoProps) {
  const id = `${prefixo}-${atributo.chave}`;

  /* ---------------------- Opções de um select ------------------------- */
  if (atributo.formato === "lista_opcoes") {
    const opcoes = (Array.isArray(valor) ? valor : []) as OpcaoCampo[];

    const alterar = (indice: number, mudanca: Partial<OpcaoCampo>) =>
      aoAlterar(
        opcoes.map((opcao, posicao) =>
          posicao === indice ? { ...opcao, ...mudanca } : opcao,
        ),
      );

    return (
      <div className="sm:col-span-2">
        <Label>
          {atributo.rotulo}
          {atributo.obrigatorio && <span className="text-error-500">*</span>}
        </Label>

        <div className="space-y-3">
          {opcoes.map((opcao, indice) => (
            <div
              key={indice}
              className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              {/* A chave acompanha o nome enquanto ninguém a edita à mão. */}
              <CampoTexto
                id={`${id}-${indice}-label`}
                label="Nome da opção"
                valor={opcao.label ?? ""}
                aoAlterar={(texto) =>
                  alterar(indice, {
                    label: texto,
                    key:
                      opcao.key === "" ||
                      opcao.key === gerarChave(opcao.label ?? "")
                        ? gerarChave(texto)
                        : opcao.key,
                  })
                }
                placeholder="Econômica"
                desabilitado={desabilitado}
              />
              <CampoTexto
                id={`${id}-${indice}-key`}
                label="Chave da opção"
                valor={opcao.key ?? ""}
                aoAlterar={(texto) => alterar(indice, { key: gerarChave(texto) })}
                placeholder="economica"
                desabilitado={desabilitado}
              />
              <button
                type="button"
                onClick={() =>
                  aoAlterar(opcoes.filter((_, posicao) => posicao !== indice))
                }
                disabled={desabilitado}
                className="h-11 text-theme-xs text-error-500 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remover
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => aoAlterar([...opcoes, { label: "", key: "" }])}
          disabled={desabilitado}
          className="mt-3 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
        >
          Adicionar opção
        </button>

        {erro && <p className="mt-1.5 text-theme-xs text-error-500">{erro}</p>}
      </div>
    );
  }

  /* ------------------- Tipo de cadastro (taxonomia) -------------------- */
  if (atributo.formato === "tipo_cadastro") {
    return (
      // O valor gravado é o slug: é a chave estável do tipo.
      <CampoSelect
        id={id}
        label={atributo.rotulo}
        obrigatorio={atributo.obrigatorio}
        valor={typeof valor === "string" ? valor : ""}
        aoAlterar={aoAlterar}
        opcoes={tiposDeCadastro.map((tipo) => ({
          valor: tipo.slug,
          rotulo: tipo.nome,
        }))}
        dica="O campo vai oferecer os cadastros deste tipo."
        erro={erro}
        desabilitado={desabilitado}
      />
    );
  }

  /* --------------------- Formatos aceitos no upload -------------------- */
  if (atributo.formato === "formato_arquivo") {
    return (
      <CampoSelect
        id={id}
        label={atributo.rotulo}
        obrigatorio={atributo.obrigatorio}
        valor={typeof valor === "string" ? valor : ""}
        aoAlterar={aoAlterar}
        opcoes={atributo.opcoes.map((opcao) => ({
          valor: opcao.chave,
          rotulo: opcao.rotulo,
        }))}
        erro={erro}
        desabilitado={desabilitado}
      />
    );
  }

  /* ----------------------- Campos de um repetidor ---------------------- */
  if (atributo.formato === "lista_campos" && renderizarListaDeCampos) {
    return <div className="sm:col-span-2">{renderizarListaDeCampos()}</div>;
  }

  /* Formato que esta versão da tela não desenha: o valor é preservado. */
  return (
    <div className="sm:col-span-2">
      <Label>{atributo.rotulo}</Label>
      <p className="flex flex-wrap items-center gap-2 text-theme-xs text-gray-500 dark:text-gray-400">
        <Badge size="sm" color="warning">
          Formato não suportado
        </Badge>
        {atributo.formato} — o valor atual é mantido ao salvar.
      </p>
    </div>
  );
}
