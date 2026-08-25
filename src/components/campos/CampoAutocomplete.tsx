import { useEffect, useRef, useState } from "react";
import Label from "../form/Label";
import Carregador from "./Carregador";
import { useClickOutside } from "../../hooks/useClickOutside";
import { mensagemDoErro } from "../../services/http";
import { ChevronDownIcon, CloseIcon } from "../../icons";

interface CampoAutocompleteProps<T> {
  id: string;
  /** Sem rótulo o campo fica compacto, para a barra de filtros. */
  label?: string;
  /** Identificador selecionado (null quando nada foi escolhido). */
  valor: number | null;
  /** Rótulo do registro já selecionado — usado nas telas de edição. */
  rotuloSelecionado?: string;
  aoSelecionar: (item: T | null) => void;
  /** Consulta a API e devolve a lista; lista vazia quando não há resultado. */
  buscar: (termo: string) => Promise<T[]>;
  obterValor: (item: T) => number;
  obterRotulo: (item: T) => string;
  obterDescricao?: (item: T) => string | undefined;
  placeholder?: string;
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  desabilitado?: boolean;
  className?: string;
}

/**
 * Campo de busca com sugestões vindas da API.
 * Enquanto a listagem é carregada exibe um loader; sem resultados exibe
 * a mensagem de lista vazia.
 */
export default function CampoAutocomplete<T>({
  id,
  label,
  valor,
  rotuloSelecionado,
  aoSelecionar,
  buscar,
  obterValor,
  obterRotulo,
  obterDescricao,
  placeholder = "Digite para buscar",
  erro,
  dica,
  obrigatorio = false,
  desabilitado = false,
  className = "",
}: CampoAutocompleteProps<T>) {
  const [termo, setTermo] = useState(rotuloSelecionado ?? "");
  const [rotuloAtual, setRotuloAtual] = useState(rotuloSelecionado ?? "");
  const [resultados, setResultados] = useState<T[]>([]);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erroBusca, setErroBusca] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const buscarRef = useRef(buscar);

  useEffect(() => {
    buscarRef.current = buscar;
  });

  // Sincroniza com o registro carregado na tela de edição.
  useEffect(() => {
    setTermo(rotuloSelecionado ?? "");
    setRotuloAtual(rotuloSelecionado ?? "");
  }, [rotuloSelecionado]);

  // Busca com atraso para não disparar uma requisição por tecla.
  useEffect(() => {
    if (!aberto) {
      return;
    }

    let ativo = true;

    setCarregando(true);
    setErroBusca(null);

    const temporizador = window.setTimeout(() => {
      buscarRef
        .current(termo.trim())
        .then((itens) => {
          if (ativo) setResultados(itens);
        })
        .catch((falha) => {
          if (!ativo) return;

          setResultados([]);
          setErroBusca(mensagemDoErro(falha));
        })
        .finally(() => {
          if (ativo) setCarregando(false);
        });
    }, 350);

    return () => {
      ativo = false;
      window.clearTimeout(temporizador);
    };
  }, [termo, aberto]);

  const fechar = () => {
    setAberto(false);
    // Texto digitado sem seleção volta para o rótulo atual.
    setTermo(rotuloAtual);
  };

  useClickOutside(containerRef, fechar);

  const selecionar = (item: T) => {
    const rotulo = obterRotulo(item);

    setRotuloAtual(rotulo);
    setTermo(rotulo);
    setAberto(false);
    aoSelecionar(item);
  };

  const limpar = () => {
    setRotuloAtual("");
    setTermo("");
    setResultados([]);
    aoSelecionar(null);
  };

  const classesEstado = erro
    ? "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500"
    : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800";

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {obrigatorio && <span className="text-error-500">*</span>}
        </Label>
      )}

      <div className="relative" ref={containerRef}>
        <input
          id={id}
          name={id}
          type="text"
          autoComplete="off"
          aria-label={label ?? placeholder}
          value={termo}
          placeholder={placeholder}
          disabled={desabilitado}
          onFocus={() => setAberto(true)}
          onChange={(evento) => {
            setTermo(evento.target.value);
            setAberto(true);
          }}
          className={`h-11 w-full appearance-none rounded-lg border bg-transparent px-4 py-2.5 pr-16 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-40 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:disabled:bg-gray-800 ${classesEstado}`}
        />

        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {carregando && <Carregador tamanho="size-4" />}
          {valor !== null && !desabilitado && (
            <button
              type="button"
              onClick={limpar}
              aria-label="Limpar seleção"
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <CloseIcon className="size-4" />
            </button>
          )}
          <ChevronDownIcon className="size-5 text-gray-400 dark:text-gray-500" />
        </div>

        {aberto && (
          <div className="absolute left-0 right-0 z-40 mt-1 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark">
            {carregando && (
              <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400">
                <Carregador tamanho="size-4" />
                Carregando...
              </div>
            )}

            {!carregando && erroBusca && (
              <p className="px-3 py-2.5 text-sm text-error-500">{erroBusca}</p>
            )}

            {!carregando && !erroBusca && resultados.length === 0 && (
              <p className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400">
                Nenhum resultado encontrado.
              </p>
            )}

            {!carregando &&
              !erroBusca &&
              resultados.map((item) => {
                const descricao = obterDescricao?.(item);
                const selecionado = obterValor(item) === valor;

                return (
                  <button
                    key={obterValor(item)}
                    type="button"
                    onClick={() => selecionar(item)}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5 ${
                      selecionado
                        ? "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {obterRotulo(item)}
                    {descricao && (
                      <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                        {descricao}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {(erro ?? dica) && (
        <p
          className={`mt-1.5 text-xs ${erro ? "text-error-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          {erro ?? dica}
        </p>
      )}
    </div>
  );
}
