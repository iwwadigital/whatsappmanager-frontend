import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { useAutenticacao } from "../context/AutenticacaoContext";
import {
  BoltIcon,
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  MultiUserIcon,
  PlugInIcon,
  UserCircleIcon,
} from "../icons";
import { cn } from "../utils";

export interface SubItemMenu {
  nome: string;
  caminho: string;
  /**
   * Permissão exigida para ver o item. Quando ausente, o item aparece
   * para qualquer usuário autenticado.
   */
  permissao?: string | string[];
}

export interface ItemMenu {
  nome: string;
  icone: ReactNode;
  caminho?: string;
  permissao?: string | string[];
  subItens?: SubItemMenu[];
}

const itensMenu: ItemMenu[] = [
  {
    nome: "Início",
    icone: <GridIcon />,
    caminho: "/",
  },
  {
    nome: "Grupos",
    icone: <GroupIcon />,
    subItens: [
      { nome: "Grupos", caminho: "/grupos", permissao: "grupo.ver" },
      {
        nome: "Tipos de grupo",
        caminho: "/grupos-tipos",
        permissao: "grupo_tipo.ver",
      },
      {
        nome: "Atividades",
        caminho: "/grupos-atividades",
        permissao: "grupo_atividade.ver",
      },
    ],
  },
  {
    nome: "Ações",
    icone: <BoltIcon />,
    subItens: [
      { nome: "Ações", caminho: "/acoes", permissao: "acao.ver" },
      {
        nome: "Execuções",
        caminho: "/acoes-grupos",
        permissao: "acao_grupo.ver",
      },
      {
        nome: "Logs das execuções",
        caminho: "/acoes-grupos-logs",
        permissao: "acao_grupo_log.ver",
      },
      {
        nome: "Tipos de ação",
        caminho: "/acoes-tipos",
        permissao: "acao_tipo.ver",
      },
    ],
  },
  {
    nome: "Membros",
    icone: <MultiUserIcon />,
    caminho: "/membros",
    permissao: "membro.ver",
  },
  {
    nome: "WhatsApp",
    icone: <PlugInIcon />,
    subItens: [
      {
        nome: "Contas",
        caminho: "/whatsapp-contas",
        permissao: "whatsapp_conta.ver",
      },
      {
        nome: "APIs",
        caminho: "/whatsapp-apis",
        permissao: "whatsapp_api.ver",
      },
    ],
  },
  {
    nome: "Usuários",
    icone: <UserCircleIcon />,
    subItens: [
      { nome: "Usuários", caminho: "/usuarios", permissao: "usuario.ver" },
      {
        nome: "Tipos de usuário",
        caminho: "/usuarios-tipos",
        permissao: "usuario_tipo.ver",
      },
      {
        nome: "Permissões",
        caminho: "/permissoes",
        permissao: "permissao.ver",
      },
    ],
  },
  {
    nome: "Empresas",
    icone: <BoxCubeIcon />,
    caminho: "/empresas",
    permissao: "empresa.ver",
  },
];


const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } =
    useSidebar();
  const { temPermissao } = useAutenticacao();
  const location = useLocation();

  const [submenuAberto, setSubmenuAberto] = useState<number | null>(null);
  const [alturaSubmenu, setAlturaSubmenu] = useState<Record<number, number>>({});
  const refsSubmenu = useRef<Record<number, HTMLDivElement | null>>({});

  const mostrarTexto = isExpanded || isHovered || isMobileOpen;

  const permitido = useCallback(
    (permissao?: string | string[]) => {
      if (permissao === undefined) {
        return true;
      }

      const chaves = Array.isArray(permissao) ? permissao : [permissao];

      return temPermissao(...chaves);
    },
    [temPermissao],
  );

  // Um item de menu só aparece quando o usuário tem a permissão exigida.
  const itensVisiveis = useMemo(() => {
    return itensMenu
      .map((item) => ({
        ...item,
        subItens: item.subItens?.filter((sub) => permitido(sub.permissao)),
      }))
      .filter((item) => {
        if (!permitido(item.permissao)) {
          return false;
        }

        // Grupo sem nenhum filho visível também desaparece.
        return item.subItens ? item.subItens.length > 0 : true;
      });
  }, [permitido]);

  const estaAtivo = useCallback(
    (caminho: string) =>
      location.pathname === caminho ||
      location.pathname.startsWith(`${caminho}/`),
    [location.pathname],
  );

  // Fecha a sidebar no mobile ao trocar de página.
  useEffect(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Abre o grupo que contém a rota atual.
  useEffect(() => {
    const indice = itensVisiveis.findIndex((item) =>
      item.subItens?.some((sub) => estaAtivo(sub.caminho)),
    );

    setSubmenuAberto(indice >= 0 ? indice : null);
  }, [estaAtivo, itensVisiveis]);

  useEffect(() => {
    if (submenuAberto === null) return;

    const elemento = refsSubmenu.current[submenuAberto];

    if (elemento) {
      setAlturaSubmenu((alturas) => ({
        ...alturas,
        [submenuAberto]: elemento.scrollHeight,
      }));
    }
  }, [submenuAberto, itensVisiveis]);

  const alternarSubmenu = (indice: number) => {
    setSubmenuAberto((atual) => (atual === indice ? null : indice));
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 xl:translate-x-0",
        isExpanded || isMobileOpen || isHovered ? "w-[290px]" : "w-[90px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "flex py-8",
          !isExpanded && !isHovered ? "xl:justify-center" : "justify-start",
        )}
      >
        <Link to="/">
          {mostrarTexto ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="WhatsApp Manager"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="WhatsApp Manager"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="WhatsApp Manager"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <h2
            className={cn(
              "mb-4 flex text-xs uppercase leading-[20px] text-gray-400",
              !isExpanded && !isHovered ? "xl:justify-center" : "justify-start",
            )}
          >
            {mostrarTexto ? "Menu" : <HorizontaLDots className="size-6" />}
          </h2>

          <ul className="flex flex-col gap-4">
            {itensVisiveis.map((item, indice) => (
              <li key={item.nome}>
                {item.subItens ? (
                  <button
                    type="button"
                    onClick={() => alternarSubmenu(indice)}
                    className={cn(
                      "group menu-item cursor-pointer",
                      submenuAberto === indice
                        ? "menu-item-active"
                        : "menu-item-inactive",
                      !isExpanded && !isHovered
                        ? "xl:justify-center"
                        : "xl:justify-start",
                    )}
                  >
                    <span
                      className={cn(
                        "menu-item-icon-size",
                        submenuAberto === indice
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive",
                      )}
                    >
                      {item.icone}
                    </span>

                    {mostrarTexto && (
                      <span className="menu-item-text">{item.nome}</span>
                    )}

                    {mostrarTexto && (
                      <ChevronDownIcon
                        className={cn(
                          "ml-auto h-5 w-5 transition-transform duration-200",
                          submenuAberto === indice
                            ? "rotate-180 text-brand-500"
                            : "",
                        )}
                      />
                    )}
                  </button>
                ) : (
                  item.caminho && (
                    <Link
                      to={item.caminho}
                      className={cn(
                        "group menu-item",
                        estaAtivo(item.caminho)
                          ? "menu-item-active"
                          : "menu-item-inactive",
                      )}
                    >
                      <span
                        className={cn(
                          "menu-item-icon-size",
                          estaAtivo(item.caminho)
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive",
                        )}
                      >
                        {item.icone}
                      </span>
                      {mostrarTexto && (
                        <span className="menu-item-text">{item.nome}</span>
                      )}
                    </Link>
                  )
                )}

                {item.subItens && mostrarTexto && (
                  <div
                    ref={(elemento) => {
                      refsSubmenu.current[indice] = elemento;
                    }}
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      height:
                        submenuAberto === indice
                          ? `${alturaSubmenu[indice] ?? 0}px`
                          : "0px",
                    }}
                  >
                    <ul className="ml-9 mt-2 space-y-1">
                      {item.subItens.map((sub) => (
                        <li key={sub.caminho}>
                          <Link
                            to={sub.caminho}
                            className={cn(
                              "menu-dropdown-item",
                              estaAtivo(sub.caminho)
                                ? "menu-dropdown-item-active"
                                : "menu-dropdown-item-inactive",
                            )}
                          >
                            {sub.nome}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
