import { useEffect, useRef, useState } from "react";
import Label from "../form/Label";
import Carregador from "./Carregador";

/** Mesmas regras da API (App\Support\ImagemCapa). */
export const IMAGEM_TAMANHO_MAX_MB = 5;
export const IMAGEM_FORMATOS = ["jpeg", "jpg", "png", "gif", "webp"];
const ACEITOS = "image/jpeg,image/png,image/gif,image/webp";

/** Valida o arquivo antes de enviar; devolve a mensagem de erro ou null. */
export function validarImagem(arquivo: File): string | null {
  if (!arquivo.type.startsWith("image/")) {
    return "O arquivo selecionado precisa ser uma imagem.";
  }

  if (arquivo.size > IMAGEM_TAMANHO_MAX_MB * 1024 * 1024) {
    return `A imagem deve ter no máximo ${IMAGEM_TAMANHO_MAX_MB} MB.`;
  }

  return null;
}

interface CampoImagemProps {
  id: string;
  label: string;
  /** URL da imagem já gravada no registro. */
  urlAtual?: string | null;
  /** Arquivo escolhido e ainda não enviado. */
  arquivo: File | null;
  aoSelecionar: (arquivo: File | null) => void;
  /** Remove a imagem já gravada (chama a API). Ausente no cadastro. */
  aoRemover?: () => void;
  removendo?: boolean;
  erro?: string;
  dica?: string;
  desabilitado?: boolean;
}

/**
 * Seleção de imagem de capa, com pré-visualização e remoção.
 *
 * O envio é feito por rota própria (`POST /<recurso>/{id}/imagem`), então o
 * componente só entrega o arquivo escolhido para a tela enviar depois de
 * salvar o registro.
 */
export default function CampoImagem({
  id,
  label,
  urlAtual,
  arquivo,
  aoSelecionar,
  aoRemover,
  removendo = false,
  erro,
  dica,
  desabilitado = false,
}: CampoImagemProps) {
  const entradaRef = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  // A prévia do arquivo escolhido vive só enquanto ele estiver selecionado.
  useEffect(() => {
    if (!arquivo) {
      setPrevia(null);

      return;
    }

    const url = URL.createObjectURL(arquivo);

    setPrevia(url);

    return () => URL.revokeObjectURL(url);
  }, [arquivo]);

  const exibida = previa ?? urlAtual ?? null;
  const mensagem = erro ?? erroLocal ?? undefined;

  const escolher = (lista: FileList | null) => {
    const selecionado = lista?.[0] ?? null;

    if (!selecionado) {
      return;
    }

    const falha = validarImagem(selecionado);

    setErroLocal(falha);
    aoSelecionar(falha ? null : selecionado);
  };

  const limparSelecao = () => {
    setErroLocal(null);
    aoSelecionar(null);

    if (entradaRef.current) {
      entradaRef.current.value = "";
    }
  };

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
          {exibida ? (
            <img
              src={exibida}
              alt={label}
              className="size-full object-cover"
            />
          ) : (
            <span className="text-theme-xs text-gray-400 dark:text-gray-500">
              Sem imagem
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={entradaRef}
            id={id}
            name={id}
            type="file"
            accept={ACEITOS}
            disabled={desabilitado || removendo}
            onChange={(evento) => escolher(evento.target.files)}
            className="sr-only"
          />

          <label
            htmlFor={id}
            className={`inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 ${
              desabilitado || removendo
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03]"
            }`}
          >
            {exibida ? "Trocar imagem" : "Selecionar imagem"}
          </label>

          {arquivo && (
            <button
              type="button"
              onClick={limparSelecao}
              disabled={desabilitado}
              className="inline-flex items-center justify-center rounded-lg px-3 py-2.5 text-sm text-gray-500 transition hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-white/90"
            >
              Cancelar
            </button>
          )}

          {!arquivo && urlAtual && aoRemover && (
            <button
              type="button"
              onClick={aoRemover}
              disabled={desabilitado || removendo}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm text-error-500 transition hover:text-error-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {removendo && <Carregador tamanho="size-4" />}
              Remover imagem
            </button>
          )}
        </div>
      </div>

      {(mensagem ?? dica) && (
        <p
          className={`mt-2 text-xs ${
            mensagem ? "text-error-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {mensagem ??
            dica ??
            `Formatos: ${IMAGEM_FORMATOS.join(", ")}. Até ${IMAGEM_TAMANHO_MAX_MB} MB.`}
        </p>
      )}
    </div>
  );
}
