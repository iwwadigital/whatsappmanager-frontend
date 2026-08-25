import { Link } from "react-router";
import { EyeIcon, PencilIcon, TrashBinIcon } from "../../icons";

interface AcoesLinhaProps {
  caminhoVer?: string;
  caminhoEditar?: string;
  aoExcluir?: () => void;
  /** Cada ação só aparece quando o usuário tem a permissão correspondente. */
  podeVer?: boolean;
  podeEditar?: boolean;
  podeExcluir?: boolean;
}

const CLASSE_ACAO =
  "flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-300";

/** Ações da linha da tabela, filtradas pelas permissões do usuário. */
export default function AcoesLinha({
  caminhoVer,
  caminhoEditar,
  aoExcluir,
  podeVer = false,
  podeEditar = false,
  podeExcluir = false,
}: AcoesLinhaProps) {
  const nenhumaAcao =
    !(podeVer && caminhoVer) &&
    !(podeEditar && caminhoEditar) &&
    !(podeExcluir && aoExcluir);

  if (nenhumaAcao) {
    return <span className="text-sm text-gray-400 dark:text-gray-500">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {podeVer && caminhoVer && (
        <Link to={caminhoVer} title="Visualizar" className={CLASSE_ACAO}>
          <EyeIcon className="size-4 fill-current" />
        </Link>
      )}

      {podeEditar && caminhoEditar && (
        <Link to={caminhoEditar} title="Editar" className={CLASSE_ACAO}>
          <PencilIcon className="size-4 fill-current" />
        </Link>
      )}

      {podeExcluir && aoExcluir && (
        <button
          type="button"
          title="Excluir"
          onClick={aoExcluir}
          className={`${CLASSE_ACAO} hover:border-error-500 hover:text-error-500 dark:hover:text-error-500`}
        >
          <TrashBinIcon className="size-4 fill-current" />
        </button>
      )}
    </div>
  );
}
