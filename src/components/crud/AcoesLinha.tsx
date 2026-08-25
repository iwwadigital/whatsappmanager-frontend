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
  "text-gray-500 transition hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90";

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
    return (
      <span className="flex w-full justify-center text-sm text-gray-400 dark:text-gray-500">
        —
      </span>
    );
  }

  return (
    <div className="flex w-full items-center justify-center gap-3">
      {podeVer && caminhoVer && (
        <Link
          to={caminhoVer}
          title="Visualizar"
          aria-label="Visualizar"
          className={CLASSE_ACAO}
        >
          <EyeIcon className="size-5 fill-current" />
        </Link>
      )}

      {podeEditar && caminhoEditar && (
        <Link
          to={caminhoEditar}
          title="Editar"
          aria-label="Editar"
          className={CLASSE_ACAO}
        >
          <PencilIcon className="size-5 fill-current" />
        </Link>
      )}

      {podeExcluir && aoExcluir && (
        <button
          type="button"
          title="Excluir"
          aria-label="Excluir"
          onClick={aoExcluir}
          className="text-gray-500 transition hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500"
        >
          <TrashBinIcon className="size-5 fill-current" />
        </button>
      )}
    </div>
  );
}
