import { useRef, useState } from "react";
import Label from "../form/Label";
import Carregador from "./Carregador";
import { TrashBinIcon } from "../../icons";

/** O arquivo já gravado no registro. */
export interface ArquivoAtual {
  nome: string;
  url: string;
}

interface CampoArquivoProps {
  id: string;
  label: string;
  /** Extensões aceitas, no formato do `accept` (".pdf,.jpg"). */
  aceitos?: string;
  /** Arquivo escolhido e ainda não enviado. */
  arquivo: File | null;
  aoSelecionar: (arquivo: File | null) => void;
  /** O arquivo que já está gravado, quando houver. */
  atual?: ArquivoAtual | null;
  /**
   * Remove o arquivo gravado — costuma chamar a API, então pode devolver uma
   * promessa: o componente mostra o loader até ela terminar.
   */
  aoRemover?: () => void | Promise<void>;
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  desabilitado?: boolean;
}

/**
 * Seleção de arquivo, no formato dos demais campos do sistema.
 *
 * O `<input type="file">` do navegador desenha o próprio botão e um
 * "Nenhum arquivo escolhido" que não dá para traduzir nem estilizar — e o
 * nome do arquivo já enviado sobrava embaixo dele. Aqui a entrada fica
 * escondida e a caixa mostra, **na mesma linha**, o botão de escolher, o
 * arquivo atual (com link) e a lixeira que o remove.
 *
 * O envio não acontece aqui: quem escolhe entrega o arquivo para a tela
 * mandar depois de salvar o registro, como no `CampoImagem`.
 */
export default function CampoArquivo({
  id,
  label,
  aceitos,
  arquivo,
  aoSelecionar,
  atual,
  aoRemover,
  erro,
  dica,
  obrigatorio = false,
  desabilitado = false,
}: CampoArquivoProps) {
  const entradaRef = useRef<HTMLInputElement>(null);
  const [removendo, setRemovendo] = useState(false);

  const bloqueado = desabilitado || removendo;
  const temArquivo = Boolean(arquivo ?? atual);
  // A escolha ainda não enviada sempre pode ser desfeita; o arquivo gravado
  // só some se a tela souber removê-lo.
  const podeRemover = Boolean(arquivo) || Boolean(atual && aoRemover);

  const limparSelecao = () => {
    aoSelecionar(null);

    if (entradaRef.current) {
      entradaRef.current.value = "";
    }
  };

  /**
   * A lixeira faz o que cabe ao estado: desfaz a escolha ainda não enviada
   * (nada a pedir para a API) ou apaga o arquivo gravado, com loader até a
   * remoção terminar.
   */
  const remover = async () => {
    if (arquivo) {
      limparSelecao();

      return;
    }

    if (!aoRemover) {
      return;
    }

    setRemovendo(true);

    try {
      await aoRemover();
    } finally {
      setRemovendo(false);
    }
  };

  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {obrigatorio && <span className="text-error-500">*</span>}
      </Label>

      <div
        className={`flex h-11 w-full items-center rounded-lg border shadow-theme-xs dark:bg-gray-900 ${
          erro
            ? "border-error-500 dark:border-error-500"
            : "border-gray-300 dark:border-gray-700"
        } ${bloqueado ? "opacity-50" : ""}`}
      >
        <input
          ref={entradaRef}
          id={id}
          name={id}
          type="file"
          accept={aceitos}
          disabled={bloqueado}
          onChange={(evento) => aoSelecionar(evento.target.files?.[0] ?? null)}
          className="sr-only"
        />

        <button
          type="button"
          onClick={() => entradaRef.current?.click()}
          disabled={bloqueado}
          className="flex h-full shrink-0 items-center self-stretch rounded-l-lg border-r border-gray-300 bg-gray-50 px-4 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          {temArquivo ? "Trocar arquivo" : "Escolher arquivo"}
        </button>

        <div className="min-w-0 flex-1 px-3">
          {arquivo ? (
            <span className="block truncate text-sm text-gray-800 dark:text-white/90">
              {arquivo.name}
            </span>
          ) : atual ? (
            <a
              href={atual.url}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-sm text-brand-500 hover:underline"
            >
              {atual.nome}
            </a>
          ) : (
            <span className="block truncate text-sm text-gray-400 dark:text-white/30">
              Nenhum arquivo escolhido
            </span>
          )}
        </div>

        {podeRemover && (
          <button
            type="button"
            title={arquivo ? "Descartar o arquivo escolhido" : "Remover arquivo"}
            onClick={() => void remover()}
            disabled={bloqueado}
            className="flex h-full shrink-0 items-center self-stretch px-3 text-gray-500 transition hover:text-error-500 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-error-500"
          >
            {removendo ? (
              <Carregador tamanho="size-4" />
            ) : (
              <TrashBinIcon className="size-5 fill-current" />
            )}
          </button>
        )}
      </div>

      {(erro ?? dica) && (
        <p
          className={`mt-1.5 text-xs ${
            erro ? "text-error-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {erro ?? dica}
        </p>
      )}
    </div>
  );
}
