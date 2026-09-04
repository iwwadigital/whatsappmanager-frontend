import CampoAlternador from "../../campos/CampoAlternador";
import CampoSelect from "../../campos/CampoSelect";
import CampoTexto from "../../campos/CampoTexto";
import Badge from "../../ui/badge/Badge";
import Label from "../../form/Label";
import EditorAtributo from "./EditorAtributo";
import {
  ajustarAtributos,
  campoVazio,
  gerarChave,
  tipoDoCampo,
  valorInicialDoAtributo,
} from "../../../utils/camposPersonalizados";
import type { ErrosValidacao } from "../../../types/api";
import type {
  CadastroTipo,
  CampoPersonalizado,
  TipoCampoCatalogo,
} from "../../../types/modelos";
import { PlusIcon, TrashBinIcon } from "../../../icons";

interface EditorCampoProps {
  campo: CampoPersonalizado;
  catalogo: TipoCampoCatalogo[];
  tiposDeCadastro: CadastroTipo[];
  aoAlterar: (campo: CampoPersonalizado) => void;
  aoRemover: () => void;
  /**
   * Dentro de um repetidor a lista de tipos é menor: o back não aceita
   * repeater dentro de repeater, e é ele quem diz isso
   * (`permite_dentro_de_repeater`).
   */
  dentroDeRepeater?: boolean;
  /** Caminho deste campo nos erros da API (ex.: `...campos.0`). */
  caminhoErro: string;
  erros: ErrosValidacao;
  desabilitado?: boolean;
}

/**
 * A **declaração** de um campo personalizado: label, chave, tipo,
 * obrigatoriedade e os atributos extras que o tipo escolhido exige.
 *
 * O componente não conhece os tipos: ele lê o catálogo da API e desenha os
 * atributos que vierem. Trocar o tipo zera os atributos que ele não usa —
 * mas só os que a tela conhece, para não descartar configuração gravada por
 * uma versão mais nova.
 */
export default function EditorCampo({
  campo,
  catalogo,
  tiposDeCadastro,
  aoAlterar,
  aoRemover,
  dentroDeRepeater = false,
  caminhoErro,
  erros,
  desabilitado = false,
}: EditorCampoProps) {
  const tipo = tipoDoCampo(catalogo, campo);
  const prefixo = caminhoErro.replace(/\./g, "-");

  const disponiveis = catalogo.filter(
    (item) => !dentroDeRepeater || item.permite_dentro_de_repeater,
  );

  const alterarRotulo = (texto: string) => {
    // A chave acompanha o nome enquanto ninguém a edita à mão.
    const chaveAutomatica =
      campo.key === "" || campo.key === gerarChave(campo.label);

    aoAlterar({
      ...campo,
      label: texto,
      key: chaveAutomatica ? gerarChave(texto) : campo.key,
    });
  };

  const alterarTipo = (chave: string) => {
    const novoTipo = catalogo.find((item) => item.chave === chave);
    const ajustado = ajustarAtributos({ ...campo, type: chave }, novoTipo, catalogo);

    // Atributo recém-exigido começa com um valor utilizável (uma opção em
    // branco, uma lista vazia), e não como null.
    novoTipo?.atributos.forEach((atributo) => {
      if (ajustado[atributo.chave] == null) {
        ajustado[atributo.chave] = valorInicialDoAtributo(atributo.formato);
      }
    });

    aoAlterar(ajustado);
  };

  return (
    <>
      <div className="mb-2 flex items-center justify-between gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
        <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {campo.label || "Campo sem nome"}
        </span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {}}
            disabled={desabilitado}
            className="text-theme-xs text-gray-500  hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlusIcon className="size-5 fill-current" />
          </button>
          <button
              type="button"
              onClick={aoRemover}
              disabled={desabilitado}
              className="text-theme-xs text-gray-500  hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TrashBinIcon className="size-5 fill-current" />
            </button>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <CampoTexto
            id={`${prefixo}-label`}
            label="Nome do campo"
            obrigatorio
            valor={campo.label ?? ""}
            aoAlterar={alterarRotulo}
            placeholder="Selo de destaque"
            erro={erros[`${caminhoErro}.label`]?.[0]}
            desabilitado={desabilitado}
          />

          <CampoTexto
            id={`${prefixo}-key`}
            label="Chave"
            obrigatorio
            valor={campo.key ?? ""}
            aoAlterar={(texto) => aoAlterar({ ...campo, key: gerarChave(texto) })}
            placeholder="selo-de-destaque"
            dica="Gerada a partir do nome; é ela que identifica o valor gravado."
            erro={erros[`${caminhoErro}.key`]?.[0]}
            desabilitado={desabilitado}
          />

          <div>
            <CampoSelect
              id={`${prefixo}-type`}
              label="Tipo"
              obrigatorio
              valor={campo.type ?? ""}
              aoAlterar={alterarTipo}
              opcoes={disponiveis.map((item) => ({
                valor: item.chave,
                rotulo: item.rotulo,
              }))}
              erro={erros[`${caminhoErro}.type`]?.[0]}
              desabilitado={desabilitado}
            />
            {/* Tipo gravado que sumiu do catálogo: fica visível em vez de a
                tela trocá-lo em silêncio. */}
            {campo.type && !tipo && (
              <p className="mt-1.5 flex items-center gap-2 text-theme-xs text-gray-500 dark:text-gray-400">
                <Badge size="sm" color="warning">
                  Tipo não reconhecido
                </Badge>
                {campo.type}
              </p>
            )}
          </div>

          <CampoAlternador
            id={`${prefixo}-required`}
            label="Obrigatório"
            descricao={campo.required ? "Sim" : "Não"}
            valor={Boolean(campo.required)}
            aoAlterar={(marcado) => aoAlterar({ ...campo, required: marcado })}
            desabilitado={desabilitado}
          />
        </div>
        {/* Os atributos extras do tipo escolhido, na ordem que o back declara. */}
        {(tipo?.atributos ?? []).map((atributo) => (
          <div className="grid grid-cols-1 gap-5 border-t border-gray-200  dark:border-gray-800">
            <EditorAtributo
              key={atributo.chave}
              atributo={atributo}
              valor={campo[atributo.chave]}
              aoAlterar={(valor) =>
                aoAlterar({ ...campo, [atributo.chave]: valor })
              }
              tiposDeCadastro={tiposDeCadastro}
              prefixo={prefixo}
              erro={erros[`${caminhoErro}.${atributo.chave}`]?.[0]}
              desabilitado={desabilitado}
              renderizarListaDeCampos={() => (
                <ListaDeCampos
                  campos={(campo[atributo.chave] as CampoPersonalizado[]) ?? []}
                  aoAlterar={(campos) =>
                    aoAlterar({ ...campo, [atributo.chave]: campos })
                  }
                  catalogo={catalogo}
                  tiposDeCadastro={tiposDeCadastro}
                  caminhoErro={`${caminhoErro}.${atributo.chave}`}
                  erros={erros}
                  rotulo={atributo.rotulo}
                  desabilitado={desabilitado}
                />
              )}
            />
          </div>
        ))}
      </div>
    </>
  );
}

interface ListaDeCamposProps {
  campos: CampoPersonalizado[];
  aoAlterar: (campos: CampoPersonalizado[]) => void;
  catalogo: TipoCampoCatalogo[];
  tiposDeCadastro: CadastroTipo[];
  caminhoErro: string;
  erros: ErrosValidacao;
  rotulo: string;
  desabilitado?: boolean;
}

/**
 * Os campos de dentro de um repetidor.
 *
 * É a mesma estrutura da lista de fora, com uma diferença: os tipos vêm
 * filtrados por `permite_dentro_de_repeater`, então o repetidor não se
 * oferece a si mesmo.
 */
function ListaDeCampos({
  campos,
  aoAlterar,
  catalogo,
  tiposDeCadastro,
  caminhoErro,
  erros,
  rotulo,
  desabilitado = false,
}: ListaDeCamposProps) {
  const padrao = catalogo.find((item) => item.permite_dentro_de_repeater);

  return (
    <div>
      <Label className="mt-3 pt-3">{rotulo}</Label>

      <div className="space-y-4">
        {campos.map((subcampo, indice) => (
          <EditorCampo
            key={indice}
            campo={subcampo}
            catalogo={catalogo}
            tiposDeCadastro={tiposDeCadastro}
            aoAlterar={(alterado) =>
              aoAlterar(
                campos.map((item, posicao) =>
                  posicao === indice ? alterado : item,
                ),
              )
            }
            aoRemover={() =>
              aoAlterar(campos.filter((_, posicao) => posicao !== indice))
            }
            dentroDeRepeater
            caminhoErro={`${caminhoErro}.${indice}`}
            erros={erros}
            desabilitado={desabilitado}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => aoAlterar([...campos, campoVazio(padrao?.chave ?? "string")])}
        disabled={desabilitado || !padrao}
        className="mt-3 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
      >
        Adicionar campo da linha
      </button>

      {erros[caminhoErro]?.[0] && (
        <p className="mt-1.5 text-theme-xs text-error-500">
          {erros[caminhoErro][0]}
        </p>
      )}
    </div>
  );
}
