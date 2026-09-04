import { useState } from "react";
import Carregador from "../campos/Carregador";
import { DownloadIcon } from "../../icons";
import type { ValorArquivo } from "../../types/modelos";

interface BotaoBaixarArquivoProps {
  arquivo: ValorArquivo;
}

/**
 * Baixa o arquivo de um campo personalizado do tipo `file`.
 *
 * O arquivo é servido pelo disco público da API, que pode estar em outra
 * origem — e aí o navegador **ignora** o atributo `download` de um link e
 * abre o arquivo em vez de salvá-lo. Por isso o conteúdo é buscado e salvo a
 * partir de um blob; se a busca falhar (rede, CORS), abrir a URL direto
 * continua sendo uma saída, e o usuário não fica sem o arquivo.
 *
 * Não passa pelo `baixarArquivo` de `services/http`: a URL é pública e
 * absoluta, e não uma rota da API com token.
 */
export default function BotaoBaixarArquivo({
  arquivo,
}: BotaoBaixarArquivoProps) {
  const [baixando, setBaixando] = useState(false);

  const baixar = async () => {
    setBaixando(true);

    try {
      const resposta = await fetch(arquivo.url);

      if (!resposta.ok) {
        throw new Error("Não foi possível baixar o arquivo.");
      }

      const url = window.URL.createObjectURL(await resposta.blob());
      const ancora = document.createElement("a");

      ancora.href = url;
      ancora.download = arquivo.nome;
      document.body.appendChild(ancora);
      ancora.click();
      ancora.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(arquivo.url, "_blank", "noopener");
    } finally {
      setBaixando(false);
    }
  };

  return (
    <button
      type="button"
      onClick={baixar}
      disabled={baixando}
      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-theme-xs text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
    >
      {baixando ? (
        <Carregador tamanho="size-4" />
      ) : (
        <DownloadIcon className="size-4" />
      )}
      Baixar
    </button>
  );
}
