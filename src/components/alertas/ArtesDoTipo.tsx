import { useState } from "react";
import CampoImagem from "../campos/CampoImagem";
import { alertasApi } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import type { AlertaGrupoTipo } from "../../types/modelos";

interface ArtesDoTipoProps {
  alertaId: number;
  vinculo: AlertaGrupoTipo;
  /** Sem trecho de volta, a arte da volta não faz sentido. */
  temVolta: boolean;
  podeEditar: boolean;
  aoAtualizar: () => Promise<void> | void;
  aoFalhar: (mensagem: string | null) => void;
}

/**
 * As artes do alerta em um tipo de grupo: a da ida e a da volta.
 *
 * As imagens **não estão no formulário** porque o caminho delas no disco usa o
 * id do alerta e o do tipo de grupo — o mesmo contrato da imagem de capa de um
 * grupo: primeiro o registro existe, depois o arquivo sobe. Por isso elas
 * aparecem aqui, na tela de detalhes, onde o alerta já existe.
 *
 * Escolher o arquivo já envia: não há botão de salvar nesta tela, e guardar a
 * escolha sem enviá-la deixaria a impressão de que a arte foi trocada.
 */
export default function ArtesDoTipo({
  alertaId,
  vinculo,
  temVolta,
  podeEditar,
  aoAtualizar,
  aoFalhar,
}: ArtesDoTipoProps) {
  const [enviando, setEnviando] = useState<string | null>(null);

  const enviar = async (campo: string, arquivo: File | null) => {
    if (!arquivo) return;

    setEnviando(campo);
    aoFalhar(null);

    try {
      await alertasApi.enviarImagemDoTipo(
        alertaId,
        vinculo.grupo_tipo_id,
        campo,
        arquivo,
      );
      await aoAtualizar();
    } catch (falha) {
      aoFalhar(mensagemDoErro(falha));
    } finally {
      setEnviando(null);
    }
  };

  const remover = async (campo: string) => {
    setEnviando(campo);
    aoFalhar(null);

    try {
      await alertasApi.removerImagemDoTipo(
        alertaId,
        vinculo.grupo_tipo_id,
        campo,
      );
      await aoAtualizar();
    } catch (falha) {
      aoFalhar(mensagemDoErro(falha));
    } finally {
      setEnviando(null);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
          {vinculo.grupo_tipo?.nome ?? `Tipo #${vinculo.grupo_tipo_id}`}
        </span>

        {vinculo.grupo_tipo?.e_gratis && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-theme-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            Grupo gratuito
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <CampoImagem
          id={`imagem-ida-${vinculo.grupo_tipo_id}`}
          label="Arte da ida"
          urlAtual={vinculo.imagem_ida_url}
          arquivo={null}
          aoSelecionar={(arquivo) => void enviar("imagem_ida", arquivo)}
          aoRemover={
            vinculo.imagem_ida_url !== null && podeEditar
              ? () => void remover("imagem_ida")
              : undefined
          }
          removendo={enviando === "imagem_ida"}
          desabilitado={!podeEditar || enviando !== null}
        />

        {temVolta && (
          <CampoImagem
            id={`imagem-volta-${vinculo.grupo_tipo_id}`}
            label="Arte da volta"
            urlAtual={vinculo.imagem_volta_url}
            arquivo={null}
            aoSelecionar={(arquivo) => void enviar("imagem_volta", arquivo)}
            aoRemover={
              vinculo.imagem_volta_url !== null && podeEditar
                ? () => void remover("imagem_volta")
                : undefined
            }
            removendo={enviando === "imagem_volta"}
            desabilitado={!podeEditar || enviando !== null}
          />
        )}
      </div>
    </div>
  );
}
