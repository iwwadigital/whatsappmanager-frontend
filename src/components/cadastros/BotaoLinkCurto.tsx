import { useState } from "react";
import Carregador from "../campos/Carregador";
import { gerarLinkCurto } from "../../services/api";
import { mensagemDoErro } from "../../services/http";

interface BotaoLinkCurtoProps {
  /** O que está digitado no campo "Url longo". */
  urlLongo: string;
  /** Título do link no Bitly — o nome do cadastro. */
  titulo?: string;
  /** Recebe o link gerado: quem chama o põe no campo "Url curto". */
  aoGerar: (link: string) => void;
  /** Mensagem de falha (ou `null` ao começar uma tentativa nova). */
  aoFalhar: (mensagem: string | null) => void;
  desabilitado?: boolean;
}

/**
 * Gera o link curto da URL digitada, ao lado do campo "Url longo".
 *
 * O botão só **preenche** o campo "Url curto": nada é gravado aqui, e o
 * valor continua editável até o cadastro ser salvo. Com a url longo em
 * branco ele fica desabilitado — não há o que encurtar.
 */
export default function BotaoLinkCurto({
  urlLongo,
  titulo,
  aoGerar,
  aoFalhar,
  desabilitado = false,
}: BotaoLinkCurtoProps) {
  const [gerando, setGerando] = useState(false);
  const url = urlLongo.trim();

  const gerar = async () => {
    aoFalhar(null);

    if (url === "") {
      aoFalhar("Informe a url longo antes de gerar o link curto.");

      return;
    }

    setGerando(true);

    try {
      const gerado = await gerarLinkCurto({
        url_longo: url,
        titulo: titulo?.trim() ? titulo.trim() : null,
      });

      aoGerar(gerado.link);
    } catch (falha) {
      aoFalhar(mensagemDoErro(falha));
    } finally {
      setGerando(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void gerar()}
      disabled={desabilitado || gerando || url === ""}
      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-white px-4 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
    >
      {gerando && <Carregador tamanho="size-4" />}
      {gerando ? "Gerando..." : "Gerar link curto"}
    </button>
  );
}
