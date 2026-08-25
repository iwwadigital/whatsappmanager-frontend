import type { ReactNode } from "react";
import { Link } from "react-router";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import PageMeta from "../../components/common/PageMeta";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { BoxCubeIcon, GroupIcon, ListIcon, LockIcon } from "../../icons";

interface Atalho {
  titulo: string;
  descricao: string;
  caminho: string;
  permissao?: string;
  icone: ReactNode;
}

const atalhos: Atalho[] = [
  {
    titulo: "Usuários",
    descricao: "Cadastro e acesso das pessoas que usam o sistema.",
    caminho: "/usuarios",
    permissao: "usuario.ver",
    icone: <GroupIcon className="size-6" />,
  },
  {
    titulo: "Tipos de usuário",
    descricao: "Perfis de acesso e as permissões de cada um.",
    caminho: "/usuarios-tipos",
    permissao: "usuario_tipo.ver",
    icone: <ListIcon className="size-6" />,
  },
  {
    titulo: "Permissões",
    descricao: "Chaves de permissão disponíveis no sistema.",
    caminho: "/permissoes",
    permissao: "permissao.ver",
    icone: <LockIcon className="size-6" />,
  },
  {
    titulo: "Empresas",
    descricao: "Empresas atendidas pelo painel.",
    caminho: "/empresas",
    permissao: "empresa.ver",
    icone: <BoxCubeIcon className="size-6" />,
  },
];

export default function Painel() {
  const { usuario, temPermissao } = useAutenticacao();

  const disponiveis = atalhos.filter((atalho) =>
    atalho.permissao ? temPermissao(atalho.permissao) : true,
  );

  return (
    <div>
      <PageMeta
        title="Início | WhatsApp Manager"
        description="Painel inicial do WhatsApp Manager"
      />
      <CabecalhoPagina titulo="Início" />

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-6">
        <h3 className="text-theme-xl font-semibold text-gray-800 dark:text-white/90">
          Olá, {usuario?.nome}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {usuario?.tipo?.nome
            ? `Você está conectado como ${usuario.tipo.nome}`
            : "Você está conectado"}
          {usuario?.empresa?.nome ? ` na empresa ${usuario.empresa.nome}.` : "."}
        </p>
      </div>

      {disponiveis.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Seu usuário ainda não tem permissão para acessar nenhum cadastro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {disponiveis.map((atalho) => (
            <Link
              key={atalho.caminho}
              to={atalho.caminho}
              className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-brand-500 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500"
            >
              <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                {atalho.icone}
              </span>
              <h4 className="text-base font-medium text-gray-800 dark:text-white/90">
                {atalho.titulo}
              </h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {atalho.descricao}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
