import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { LockIcon } from "../../icons";

/** Destino de quem tenta abrir uma página sem ter a permissão exigida. */
export default function SemPermissao() {
  return (
    <>
      <PageMeta
        title="Sem permissão | WhatsApp Manager"
        description="Você não tem permissão para acessar esta página"
      />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-16">
        <div className="mx-auto w-full max-w-[520px] text-center">
          <span className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-error-50 text-error-500 dark:bg-error-500/15">
            <LockIcon className="size-7 fill-current" />
          </span>

          <h3 className="mb-3 text-theme-xl font-semibold text-gray-800 dark:text-white/90 sm:text-2xl">
            Você não tem permissão para acessar esta página
          </h3>

          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Se você precisa deste acesso, solicite ao administrador do sistema a
            permissão correspondente para o seu tipo de usuário.
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </>
  );
}
