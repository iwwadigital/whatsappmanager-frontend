import { Navigate, Outlet } from "react-router";
import { useAutenticacao } from "../../context/AutenticacaoContext";

interface RotaComPermissaoProps {
  /**
   * Permissão exigida pela página. Sem esta prop a rota é liberada para
   * qualquer usuário autenticado (página que não exige permissão).
   */
  permissao?: string | string[];
}

/** Redireciona para /sem-permissao quem não tem a permissão da página. */
export default function RotaComPermissao({
  permissao,
}: RotaComPermissaoProps) {
  const { temPermissao } = useAutenticacao();

  const chaves =
    permissao === undefined
      ? []
      : Array.isArray(permissao)
        ? permissao
        : [permissao];

  if (!temPermissao(...chaves)) {
    return <Navigate to="/sem-permissao" replace />;
  }

  return <Outlet />;
}
