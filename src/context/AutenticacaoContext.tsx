import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  autenticacaoApi,
  extrairAutenticacao,
  type DadosLogin,
} from "../services/api";
import {
  gravarToken,
  gravarUsuario,
  lerToken,
  lerUsuario,
  limparSessao,
} from "../services/armazenamento";
import { EVENTO_SESSAO_EXPIRADA } from "../services/http";
import type { UsuarioAutenticado } from "../types/modelos";

interface ContextoAutenticacao {
  usuario: UsuarioAutenticado | null;
  autenticado: boolean;
  /** Validando a sessão gravada no navegador. */
  carregando: boolean;
  entrando: boolean;
  entrar: (dados: DadosLogin) => Promise<UsuarioAutenticado>;
  sair: () => Promise<void>;
  /** Sem chaves informadas o acesso é livre (item público). */
  temPermissao: (...chaves: string[]) => boolean;
}

const Contexto = createContext<ContextoAutenticacao | undefined>(undefined);

export function AutenticacaoProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(() =>
    lerUsuario(),
  );
  const [carregando, setCarregando] = useState<boolean>(() =>
    Boolean(lerToken()),
  );
  const [entrando, setEntrando] = useState(false);

  // Revalida o token gravado a cada carregamento da aplicação.
  useEffect(() => {
    let ativo = true;

    if (!lerToken()) {
      setUsuario(null);
      setCarregando(false);

      return () => {
        ativo = false;
      };
    }

    autenticacaoApi
      .eu()
      .then((autenticado) => {
        if (!ativo) return;

        gravarUsuario(autenticado);
        setUsuario(autenticado);
      })
      .catch(() => {
        if (!ativo) return;

        limparSessao();
        setUsuario(null);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  // 401 em qualquer requisição derruba a sessão.
  useEffect(() => {
    const aoExpirar = () => setUsuario(null);

    window.addEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);

    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);
  }, []);

  const entrar = useCallback(async (dados: DadosLogin) => {
    setEntrando(true);

    try {
      const resposta = await autenticacaoApi.entrar(dados);
      const autenticacao = extrairAutenticacao(resposta);

      gravarToken(autenticacao.token);
      gravarUsuario(autenticacao.usuario);
      setUsuario(autenticacao.usuario);

      return autenticacao.usuario;
    } finally {
      setEntrando(false);
    }
  }, []);

  const sair = useCallback(async () => {
    try {
      await autenticacaoApi.sair();
    } catch {
      // Mesmo se a revogação falhar, a sessão local é encerrada.
    } finally {
      limparSessao();
      setUsuario(null);
    }
  }, []);

  const temPermissao = useCallback(
    (...chaves: string[]) => {
      if (chaves.length === 0) {
        return true;
      }

      if (!usuario) {
        return false;
      }

      return chaves.some((chave) => usuario.permissoes.includes(chave));
    },
    [usuario],
  );

  const valor = useMemo<ContextoAutenticacao>(
    () => ({
      usuario,
      autenticado: usuario !== null,
      carregando,
      entrando,
      entrar,
      sair,
      temPermissao,
    }),
    [usuario, carregando, entrando, entrar, sair, temPermissao],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAutenticacao(): ContextoAutenticacao {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error(
      "useAutenticacao precisa ser usado dentro de AutenticacaoProvider.",
    );
  }

  return contexto;
}
