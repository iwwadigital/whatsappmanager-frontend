import { useState } from "react";
import { useNavigate } from "react-router";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { ChevronDownIcon, LogoutIcon } from "../../icons";

export default function UserDropdown() {
  const { usuario, sair } = useAutenticacao();
  const navegar = useNavigate();
  const [aberto, setAberto] = useState(false);

  const iniciais = (usuario?.nome ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");

  const encerrar = async () => {
    setAberto(false);
    await sair();
    navegar("/login", { replace: true });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        className="dropdown-toggle flex items-center gap-2 text-gray-700 dark:text-gray-400"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-sm font-medium text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
          {iniciais}
        </span>
        <span className="hidden text-theme-sm font-medium sm:block">
          {usuario?.nome}
        </span>
        <ChevronDownIcon
          className={`size-5 transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}
        />
      </button>

      <Dropdown
        isOpen={aberto}
        onClose={() => setAberto(false)}
        className="mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="border-b border-gray-200 pb-3 dark:border-gray-800">
          <span className="block text-theme-sm font-medium text-gray-700 dark:text-gray-400">
            {usuario?.nome}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {usuario?.email}
          </span>
          {usuario?.tipo?.nome && (
            <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
              {usuario.tipo.nome}
              {usuario.empresa?.nome ? ` · ${usuario.empresa.nome}` : ""}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={encerrar}
          className="group mt-3 flex items-center gap-3 rounded-lg px-3 py-2 text-theme-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          <LogoutIcon className="size-5 fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" />
          Sair
        </button>
      </Dropdown>
    </div>
  );
}
