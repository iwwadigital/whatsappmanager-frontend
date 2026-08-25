import { useMemo, useState } from "react";
import Checkbox from "../form/input/Checkbox";
import Label from "../form/Label";
import Carregador from "./Carregador";

export interface ItemSelecao {
  valor: number;
  rotulo: string;
  descricao?: string;
}

interface CampoSelecaoMultiplaProps {
  id: string;
  label: string;
  itens: ItemSelecao[];
  valores: number[];
  aoAlterar: (valores: number[]) => void;
  carregando?: boolean;
  erro?: string;
  dica?: string;
  mensagemVazia?: string;
  desabilitado?: boolean;
}

/** Lista de seleção múltipla com busca (usada para vincular permissões). */
export default function CampoSelecaoMultipla({
  id,
  label,
  itens,
  valores,
  aoAlterar,
  carregando = false,
  erro,
  dica,
  mensagemVazia = "Nenhum registro disponível.",
  desabilitado = false,
}: CampoSelecaoMultiplaProps) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return itens;
    }

    return itens.filter(
      (item) =>
        item.rotulo.toLowerCase().includes(termo) ||
        (item.descricao ?? "").toLowerCase().includes(termo),
    );
  }, [itens, busca]);

  const alternar = (valor: number, marcado: boolean) => {
    aoAlterar(
      marcado ? [...valores, valor] : valores.filter((item) => item !== valor),
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={`${id}-busca`}>{label}</Label>
        <span className="mb-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
          {valores.length} selecionada(s)
        </span>
      </div>

      <div className="rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="border-b border-gray-200 p-3 dark:border-gray-800">
          <input
            id={`${id}-busca`}
            type="text"
            value={busca}
            disabled={desabilitado}
            placeholder="Buscar..."
            onChange={(evento) => setBusca(evento.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        <div className="max-h-64 space-y-3 overflow-y-auto p-4">
          {carregando && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Carregador tamanho="size-4" />
              Carregando...
            </div>
          )}

          {!carregando && filtrados.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {busca ? "Nenhum resultado encontrado." : mensagemVazia}
            </p>
          )}

          {!carregando &&
            filtrados.map((item) => (
              <Checkbox
                key={item.valor}
                id={`${id}-${item.valor}`}
                checked={valores.includes(item.valor)}
                disabled={desabilitado}
                onChange={(marcado) => alternar(item.valor, marcado)}
                label={
                  item.descricao
                    ? `${item.rotulo} — ${item.descricao}`
                    : item.rotulo
                }
              />
            ))}
        </div>
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
