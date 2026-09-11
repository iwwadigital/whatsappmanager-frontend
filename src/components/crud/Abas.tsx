export interface Aba {
  chave: string;
  rotulo: string;
  /** Quantidade exibida ao lado do rótulo (ex.: linhas preenchidas). */
  contador?: number;
  /** Marca a aba que tem campo com erro de validação. */
  comErro?: boolean;
}

interface AbasProps {
  abas: Aba[];
  ativa: string;
  aoSelecionar: (chave: string) => void;
}

/**
 * Navegação por abas de um formulário longo.
 *
 * O conteúdo de todas as abas continua **montado** — quem usa este componente
 * esconde as inativas com `hidden`, não as desmonta. Num formulário, desmontar
 * a aba jogaria fora o que foi digitado nela, e um erro de validação vindo da
 * API precisa encontrar o campo dele para marcá-lo.
 *
 * Por isso existe `comErro`: com quatro abas e uma resposta 422, a marca no
 * rótulo é o que diz onde está o problema sem obrigar a abrir uma por uma.
 *
 * No mobile a lista rola na horizontal em vez de quebrar em duas linhas — o
 * sublinhado da aba ativa é a referência de onde se está, e ele se perde
 * quando os rótulos se reorganizam.
 */
export default function Abas({ abas, ativa, aoSelecionar }: AbasProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <nav className="custom-scrollbar -mb-px flex gap-1 overflow-x-auto sm:gap-2">
        {abas.map((aba) => {
          const selecionada = aba.chave === ativa;

          return (
            <button
              key={aba.chave}
              type="button"
              onClick={() => aoSelecionar(aba.chave)}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition ${
                selecionada
                  ? "border-brand-500 text-brand-500"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {aba.rotulo}

              {aba.contador !== undefined && aba.contador > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-theme-xs ${
                    selecionada
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {aba.contador}
                </span>
              )}

              {aba.comErro && (
                <span
                  aria-label="Esta aba tem campos com erro"
                  className="size-1.5 rounded-full bg-error-500"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
