import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { empresasDisponiveisApi } from "../services/api";
import {
  EMPRESA_PADRAO_ID,
  gravarEmpresaAtiva,
  lerEmpresaAtiva,
} from "../services/armazenamento";
import { useAutenticacao } from "./AutenticacaoContext";
import type { EmpresaResumo } from "../types/modelos";

interface ContextoEmpresaAtiva {
  /** Empresa em uso; null enquanto a lista não chega. */
  empresa: EmpresaResumo | null;
  /** Id enviado à API (cai em EMPRESA_PADRAO_ID enquanto não há escolha). */
  empresaId: number;
  /** Opções do seletor do header. */
  empresas: EmpresaResumo[];
  /** Só quem não tem empresa própria escolhe a empresa. */
  podeSelecionar: boolean;
  /** O seletor tem algo a mostrar — usado pelo header para reservar espaço. */
  exibirSeletor: boolean;
  carregando: boolean;
  selecionar: (empresa: EmpresaResumo) => void;
}

const Contexto = createContext<ContextoEmpresaAtiva | undefined>(undefined);

/**
 * Empresa ativa: o recorte de conteúdo da sessão.
 *
 * - Usuário COM empresa própria: a empresa é a dele e o seletor não aparece.
 * - Usuário SEM empresa: escolhe no seletor do header; o padrão é a empresa
 *   EMPRESA_PADRAO_ID e a escolha fica no localStorage (`wm.empresa`), do
 *   mesmo modo que o usuário logado.
 *
 * O valor vai à API pelo cabeçalho X-Empresa-Id, injetado em services/http.ts.
 */
export function EmpresaAtivaProvider({ children }: { children: ReactNode }) {
  const { usuario, autenticado } = useAutenticacao();

  // Primitivos (e não o objeto `usuario.empresa`) para o efeito não repetir
  // a consulta a cada revalidação de sessão.
  const empresaDoUsuarioId = usuario?.empresa?.id ?? null;
  const empresaDoUsuarioNome = usuario?.empresa?.nome ?? "";
  const podeSelecionar = autenticado && empresaDoUsuarioId === null;

  const [empresa, setEmpresa] = useState<EmpresaResumo | null>(() =>
    lerEmpresaAtiva(),
  );
  const [empresas, setEmpresas] = useState<EmpresaResumo[]>([]);
  const [carregando, setCarregando] = useState(false);

  const definir = useCallback((escolhida: EmpresaResumo) => {
    gravarEmpresaAtiva(escolhida);
    setEmpresa(escolhida);
  }, []);

  useEffect(() => {
    let ativo = true;

    if (!autenticado) {
      setEmpresa(null);
      setEmpresas([]);

      return () => {
        ativo = false;
      };
    }

    // Empresa própria: nada a escolher e nada a consultar.
    if (empresaDoUsuarioId !== null) {
      const propria = { id: empresaDoUsuarioId, nome: empresaDoUsuarioNome };

      gravarEmpresaAtiva(propria);
      setEmpresa(propria);
      setEmpresas([propria]);

      return () => {
        ativo = false;
      };
    }

    setCarregando(true);

    empresasDisponiveisApi
      .listar()
      .then((lista) => {
        if (!ativo) return;

        setEmpresas(lista);

        if (lista.length === 0) return;

        // Mantém a escolha gravada; se ela sumiu, cai na empresa padrão e,
        // por último, na primeira da lista.
        const gravada = lerEmpresaAtiva();
        const escolhida =
          lista.find((item) => item.id === gravada?.id) ??
          lista.find((item) => item.id === EMPRESA_PADRAO_ID) ??
          lista[0];

        gravarEmpresaAtiva(escolhida);
        setEmpresa(escolhida);
      })
      .catch(() => {
        // Sem a lista o seletor fica vazio; a API assume a empresa padrão.
        if (ativo) setEmpresas([]);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [autenticado, empresaDoUsuarioId, empresaDoUsuarioNome]);

  const valor = useMemo<ContextoEmpresaAtiva>(
    () => ({
      empresa,
      empresaId: empresa?.id ?? EMPRESA_PADRAO_ID,
      empresas,
      podeSelecionar,
      exibirSeletor: podeSelecionar && (empresas.length > 0 || carregando),
      carregando,
      selecionar: definir,
    }),
    [empresa, empresas, podeSelecionar, carregando, definir],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEmpresaAtiva(): ContextoEmpresaAtiva {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error(
      "useEmpresaAtiva precisa ser usado dentro de EmpresaAtivaProvider.",
    );
  }

  return contexto;
}
