import { corOcupacao, percentualOcupacao } from "../../utils/ocupacao";

interface ResumoOcupacaoProps {
  /** Vínculos ativos em `grupos_membros` (withCount do `show`). */
  membros?: number;
  quantidadeParticipantes?: number;
  quantidadeParticipantesMax?: number | null;
}

interface ItemProps {
  rotulo: string;
  valor: string;
  className?: string;
}

function Item({ rotulo, valor, className = "" }: ItemProps) {
  return (
    <div className="min-w-0 flex-1 px-4 py-3">
      <p className="text-theme-xs uppercase text-gray-500 dark:text-gray-400">
        {rotulo}
      </p>
      <p
        className={`mt-0.5 text-lg font-semibold text-gray-800 dark:text-white/90 ${className}`}
      >
        {valor}
      </p>
    </div>
  );
}

/** Resumo do grupo acima da listagem: membros, participantes e o máximo. */
export default function ResumoOcupacao({
  membros,
  quantidadeParticipantes = 0,
  quantidadeParticipantesMax,
}: ResumoOcupacaoProps) {
  const percentual = percentualOcupacao(
    quantidadeParticipantes,
    quantidadeParticipantesMax ?? null,
  );

  const vagas =
    quantidadeParticipantesMax == null
      ? null
      : Math.max(0, quantidadeParticipantesMax - quantidadeParticipantes);

  return (
    <div className="mb-4 flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white sm:flex-row sm:divide-x sm:divide-y-0 dark:divide-white/[0.05] dark:border-white/[0.05] dark:bg-white/[0.03]">
      <Item rotulo="Membros no sistema" valor={String(membros ?? 0)} />
      <Item
        rotulo="Participantes"
        valor={String(quantidadeParticipantes)}
        className={corOcupacao(percentual)}
      />
      <Item
        rotulo="Máximo de participantes"
        valor={quantidadeParticipantesMax?.toString() ?? "Sem limite"}
      />
      <Item rotulo="Vagas" valor={vagas === null ? "—" : String(vagas)} />
    </div>
  );
}
