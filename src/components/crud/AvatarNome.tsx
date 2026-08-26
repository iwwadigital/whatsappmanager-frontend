interface AvatarNomeProps {
  /** URL da imagem de capa; sem ela mostra as iniciais. */
  url?: string | null;
  nome: string;
  /** Linha secundária (ex.: o ID do WhatsApp ou o slug). */
  detalhe?: string | null;
}

/** Iniciais usadas quando o registro não tem imagem. */
function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) {
    return "?";
  }

  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";

  return `${primeira}${ultima}`.toUpperCase();
}

/** Imagem circular pequena + nome, usada na primeira coluna das listagens. */
export default function AvatarNome({ url, nome, detalhe }: AvatarNomeProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
        {url ? (
          <img src={url} alt={nome} className="size-full object-cover" />
        ) : (
          <span className="text-theme-xs font-medium text-gray-500 dark:text-gray-400">
            {iniciais(nome)}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate font-medium text-gray-800 dark:text-white/90">
          {nome}
        </p>
        {detalhe && (
          <p className="truncate text-theme-xs text-gray-500 dark:text-gray-400">
            {detalhe}
          </p>
        )}
      </div>
    </div>
  );
}
