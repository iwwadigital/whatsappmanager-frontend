import { Link } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { useEmpresaAtiva } from "../context/EmpresaAtivaContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import SeletorEmpresa from "../components/header/SeletorEmpresa";
import UserDropdown from "../components/header/UserDropdown";

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { exibirSeletor } = useEmpresaAtiva();

  const alternar = () => {
    if (window.innerWidth >= 1280) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-40 flex w-full flex-col border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex w-full items-center justify-between gap-2 px-3 py-3 sm:gap-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={alternar}
            aria-label="Abrir menu"
            className="flex size-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400 xl:size-11"
          >
            {isMobileOpen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6L18 18M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 7H20M4 12H20M4 17H14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>

          <Link to="/" className="xl:hidden">
            <img
              className="dark:hidden"
              src="/images/logo/logo-icon.svg"
              alt="WhatsApp Manager"
              width={32}
              height={32}
            />
            <img
              className="hidden dark:block"
              src="/images/logo/logo-icon.svg"
              alt="WhatsApp Manager"
              width={32}
              height={32}
            />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* No mobile o seletor desce para a segunda linha, para não
              espremer o menu, o tema e o avatar em telas estreitas. */}
          <SeletorEmpresa
            id="empresa-ativa"
            className="hidden sm:block sm:w-44 xl:w-56"
          />
          <ThemeToggleButton />
          <UserDropdown />
        </div>
      </div>

      {exibirSeletor && (
        <div className="border-t border-gray-200 px-3 py-2 dark:border-gray-800 sm:hidden">
          <SeletorEmpresa id="empresa-ativa-mobile" className="w-full" />
        </div>
      )}
    </header>
  );
};

export default AppHeader;
