import { Navigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "../AuthPages/AuthPageLayout";
import FormularioLogin from "../../components/autenticacao/FormularioLogin";
import TelaCarregando from "../../components/autenticacao/TelaCarregando";
import { useAutenticacao } from "../../context/AutenticacaoContext";

export default function Login() {
  const { autenticado, carregando } = useAutenticacao();

  if (carregando) {
    return <TelaCarregando />;
  }

  if (autenticado) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PageMeta
        title="Entrar | WhatsApp Manager"
        description="Acesse o painel de gestão do WhatsApp Manager"
      />
      <AuthLayout>
        <div className="flex w-full flex-1 flex-col lg:w-1/2">
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            <div className="mb-6">
              <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90">
                Entrar
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Informe seu e-mail e senha para acessar o painel.
              </p>
            </div>

            <FormularioLogin />
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
