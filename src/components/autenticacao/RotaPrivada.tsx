import { Navigate, Outlet, useLocation } from "react-router";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import TelaCarregando from "./TelaCarregando";

/** Bloqueia o acesso de quem não está autenticado. */
export default function RotaPrivada() {
  const { autenticado, carregando } = useAutenticacao();
  const local = useLocation();

  if (carregando) {
    return <TelaCarregando />;
  }

  if (!autenticado) {
    return <Navigate to="/login" state={{ de: local.pathname }} replace />;
  }

  return <Outlet />;
}
