import { BrowserRouter as Router, Route, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import RotaComPermissao from "./components/autenticacao/RotaComPermissao";
import RotaPrivada from "./components/autenticacao/RotaPrivada";
import AppLayout from "./layout/AppLayout";

import Login from "./pages/Autenticacao/Login";
import Painel from "./pages/Inicio/Painel";
import NaoEncontrado from "./pages/Erros/NaoEncontrado";
import SemPermissao from "./pages/Erros/SemPermissao";

import ListaUsuarios from "./pages/Usuarios/ListaUsuarios";
import NovoUsuario from "./pages/Usuarios/NovoUsuario";
import EditarUsuario from "./pages/Usuarios/EditarUsuario";
import VerUsuario from "./pages/Usuarios/VerUsuario";

import ListaUsuariosTipos from "./pages/UsuariosTipos/ListaUsuariosTipos";
import NovoUsuarioTipo from "./pages/UsuariosTipos/NovoUsuarioTipo";
import EditarUsuarioTipo from "./pages/UsuariosTipos/EditarUsuarioTipo";
import VerUsuarioTipo from "./pages/UsuariosTipos/VerUsuarioTipo";

import ListaPermissoes from "./pages/Permissoes/ListaPermissoes";
import NovaPermissao from "./pages/Permissoes/NovaPermissao";
import EditarPermissao from "./pages/Permissoes/EditarPermissao";
import VerPermissao from "./pages/Permissoes/VerPermissao";

import ListaAcoes from "./pages/Acoes/ListaAcoes";
import EditarAcao from "./pages/Acoes/EditarAcao";

import ListaAcoesGrupos from "./pages/AcoesGrupos/ListaAcoesGrupos";
import EditarAcaoGrupo from "./pages/AcoesGrupos/EditarAcaoGrupo";
import ListaAcoesGruposLogs from "./pages/AcoesGruposLogs/ListaAcoesGruposLogs";

import ListaAcoesTipos from "./pages/AcoesTipos/ListaAcoesTipos";
import NovoAcaoTipo from "./pages/AcoesTipos/NovoAcaoTipo";
import EditarAcaoTipo from "./pages/AcoesTipos/EditarAcaoTipo";
import VerAcaoTipo from "./pages/AcoesTipos/VerAcaoTipo";

import ListaGrupos from "./pages/Grupos/ListaGrupos";
import NovoGrupo from "./pages/Grupos/NovoGrupo";
import EditarGrupo from "./pages/Grupos/EditarGrupo";
import VerGrupo from "./pages/Grupos/VerGrupo";

import MembrosDoGrupo from "./pages/Grupos/MembrosDoGrupo";
import ContasDoGrupo from "./pages/Grupos/ContasDoGrupo";

import ListaWhatsappApis from "./pages/WhatsappApis/ListaWhatsappApis";
import NovaWhatsappApi from "./pages/WhatsappApis/NovaWhatsappApi";
import EditarWhatsappApi from "./pages/WhatsappApis/EditarWhatsappApi";
import VerWhatsappApi from "./pages/WhatsappApis/VerWhatsappApi";

import ListaWhatsappContas from "./pages/WhatsappContas/ListaWhatsappContas";
import NovaWhatsappConta from "./pages/WhatsappContas/NovaWhatsappConta";
import EditarWhatsappConta from "./pages/WhatsappContas/EditarWhatsappConta";
import VerWhatsappConta from "./pages/WhatsappContas/VerWhatsappConta";

import ListaGruposAtividades from "./pages/GruposAtividades/ListaGruposAtividades";

import ListaMembros from "./pages/Membros/ListaMembros";
import NovoMembro from "./pages/Membros/NovoMembro";
import EditarMembro from "./pages/Membros/EditarMembro";
import VerMembro from "./pages/Membros/VerMembro";

import ListaGruposTipos from "./pages/GruposTipos/ListaGruposTipos";
import NovoGrupoTipo from "./pages/GruposTipos/NovoGrupoTipo";
import EditarGrupoTipo from "./pages/GruposTipos/EditarGrupoTipo";
import VerGrupoTipo from "./pages/GruposTipos/VerGrupoTipo";

import ListaEmpresas from "./pages/Empresas/ListaEmpresas";
import NovaEmpresa from "./pages/Empresas/NovaEmpresa";
import EditarEmpresa from "./pages/Empresas/EditarEmpresa";
import VerEmpresa from "./pages/Empresas/VerEmpresa";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Público */}
        <Route path="/login" element={<Login />} />

        {/* Autenticado */}
        <Route element={<RotaPrivada />}>
          <Route element={<AppLayout />}>
            {/* Sem exigência de permissão */}
            <Route index element={<Painel />} />
            <Route path="/sem-permissao" element={<SemPermissao />} />

            {/* Usuários */}
            <Route element={<RotaComPermissao permissao="usuario.ver" />}>
              <Route path="/usuarios" element={<ListaUsuarios />} />
              <Route path="/usuarios/:id" element={<VerUsuario />} />
            </Route>
            <Route element={<RotaComPermissao permissao="usuario.criar" />}>
              <Route path="/usuarios/novo" element={<NovoUsuario />} />
            </Route>
            <Route element={<RotaComPermissao permissao="usuario.editar" />}>
              <Route path="/usuarios/:id/editar" element={<EditarUsuario />} />
            </Route>

            {/* Tipos de usuário */}
            <Route element={<RotaComPermissao permissao="usuario_tipo.ver" />}>
              <Route path="/usuarios-tipos" element={<ListaUsuariosTipos />} />
              <Route path="/usuarios-tipos/:id" element={<VerUsuarioTipo />} />
            </Route>
            <Route
              element={<RotaComPermissao permissao="usuario_tipo.criar" />}
            >
              <Route
                path="/usuarios-tipos/novo"
                element={<NovoUsuarioTipo />}
              />
            </Route>
            <Route
              element={<RotaComPermissao permissao="usuario_tipo.editar" />}
            >
              <Route
                path="/usuarios-tipos/:id/editar"
                element={<EditarUsuarioTipo />}
              />
            </Route>

            {/* Permissões */}
            <Route element={<RotaComPermissao permissao="permissao.ver" />}>
              <Route path="/permissoes" element={<ListaPermissoes />} />
              <Route path="/permissoes/:id" element={<VerPermissao />} />
            </Route>
            <Route element={<RotaComPermissao permissao="permissao.criar" />}>
              <Route path="/permissoes/novo" element={<NovaPermissao />} />
            </Route>
            <Route element={<RotaComPermissao permissao="permissao.editar" />}>
              <Route
                path="/permissoes/:id/editar"
                element={<EditarPermissao />}
              />
            </Route>

            {/* Grupos */}
            <Route element={<RotaComPermissao permissao="grupo.ver" />}>
              <Route path="/grupos" element={<ListaGrupos />} />
              <Route path="/grupos/:id" element={<VerGrupo />} />
            </Route>
            <Route element={<RotaComPermissao permissao="grupo.criar" />}>
              <Route path="/grupos/novo" element={<NovoGrupo />} />
            </Route>
            <Route element={<RotaComPermissao permissao="grupo.editar" />}>
              <Route path="/grupos/:id/editar" element={<EditarGrupo />} />
            </Route>

            {/* Membros do grupo */}
            <Route element={<RotaComPermissao permissao="grupo_membro.ver" />}>
              <Route
                path="/grupos/:id/membros"
                element={<MembrosDoGrupo />}
              />
            </Route>

            {/* Contas de WhatsApp do grupo */}
            <Route
              element={<RotaComPermissao permissao="grupo_whatsapp_conta.ver" />}
            >
              <Route path="/grupos/:id/contas" element={<ContasDoGrupo />} />
            </Route>

            {/* APIs de WhatsApp */}
            <Route element={<RotaComPermissao permissao="whatsapp_api.ver" />}>
              <Route path="/whatsapp-apis" element={<ListaWhatsappApis />} />
              <Route path="/whatsapp-apis/:id" element={<VerWhatsappApi />} />
            </Route>
            <Route element={<RotaComPermissao permissao="whatsapp_api.criar" />}>
              <Route path="/whatsapp-apis/novo" element={<NovaWhatsappApi />} />
            </Route>
            <Route
              element={<RotaComPermissao permissao="whatsapp_api.editar" />}
            >
              <Route
                path="/whatsapp-apis/:id/editar"
                element={<EditarWhatsappApi />}
              />
            </Route>

            {/* Contas de WhatsApp */}
            <Route element={<RotaComPermissao permissao="whatsapp_conta.ver" />}>
              <Route path="/whatsapp-contas" element={<ListaWhatsappContas />} />
              <Route
                path="/whatsapp-contas/:id"
                element={<VerWhatsappConta />}
              />
            </Route>
            <Route
              element={<RotaComPermissao permissao="whatsapp_conta.criar" />}
            >
              <Route
                path="/whatsapp-contas/novo"
                element={<NovaWhatsappConta />}
              />
            </Route>
            <Route
              element={<RotaComPermissao permissao="whatsapp_conta.editar" />}
            >
              <Route
                path="/whatsapp-contas/:id/editar"
                element={<EditarWhatsappConta />}
              />
            </Route>

            {/* Atividades dos grupos (log, somente leitura) */}
            <Route
              element={<RotaComPermissao permissao="grupo_atividade.ver" />}
            >
              <Route
                path="/grupos-atividades"
                element={<ListaGruposAtividades />}
              />
            </Route>

            {/* Membros */}
            <Route element={<RotaComPermissao permissao="membro.ver" />}>
              <Route path="/membros" element={<ListaMembros />} />
              <Route path="/membros/:id" element={<VerMembro />} />
            </Route>
            <Route element={<RotaComPermissao permissao="membro.criar" />}>
              <Route path="/membros/novo" element={<NovoMembro />} />
            </Route>
            <Route element={<RotaComPermissao permissao="membro.editar" />}>
              <Route path="/membros/:id/editar" element={<EditarMembro />} />
            </Route>

            {/* Tipos de grupo */}
            <Route element={<RotaComPermissao permissao="grupo_tipo.ver" />}>
              <Route path="/grupos-tipos" element={<ListaGruposTipos />} />
              <Route path="/grupos-tipos/:id" element={<VerGrupoTipo />} />
            </Route>
            <Route element={<RotaComPermissao permissao="grupo_tipo.criar" />}>
              <Route path="/grupos-tipos/novo" element={<NovoGrupoTipo />} />
            </Route>
            <Route element={<RotaComPermissao permissao="grupo_tipo.editar" />}>
              <Route
                path="/grupos-tipos/:id/editar"
                element={<EditarGrupoTipo />}
              />
            </Route>

            {/* Ações (sem cadastro: são criadas pelo sistema) */}
            <Route element={<RotaComPermissao permissao="acao.ver" />}>
              <Route path="/acoes" element={<ListaAcoes />} />
            </Route>
            <Route element={<RotaComPermissao permissao="acao.editar" />}>
              <Route path="/acoes/:id/editar" element={<EditarAcao />} />
            </Route>

            {/* Execuções das ações nos grupos (nascem junto com a ação) */}
            <Route element={<RotaComPermissao permissao="acao_grupo.ver" />}>
              <Route path="/acoes-grupos" element={<ListaAcoesGrupos />} />
            </Route>
            <Route element={<RotaComPermissao permissao="acao_grupo.editar" />}>
              <Route
                path="/acoes-grupos/:id/editar"
                element={<EditarAcaoGrupo />}
              />
            </Route>

            {/* Logs das execuções (gravados pelo robô) */}
            <Route
              element={<RotaComPermissao permissao="acao_grupo_log.ver" />}
            >
              <Route
                path="/acoes-grupos-logs"
                element={<ListaAcoesGruposLogs />}
              />
            </Route>

            {/* Tipos de ação */}
            <Route element={<RotaComPermissao permissao="acao_tipo.ver" />}>
              <Route path="/acoes-tipos" element={<ListaAcoesTipos />} />
              <Route path="/acoes-tipos/:id" element={<VerAcaoTipo />} />
            </Route>
            <Route element={<RotaComPermissao permissao="acao_tipo.criar" />}>
              <Route path="/acoes-tipos/novo" element={<NovoAcaoTipo />} />
            </Route>
            <Route element={<RotaComPermissao permissao="acao_tipo.editar" />}>
              <Route
                path="/acoes-tipos/:id/editar"
                element={<EditarAcaoTipo />}
              />
            </Route>

            {/* Empresas */}
            <Route element={<RotaComPermissao permissao="empresa.ver" />}>
              <Route path="/empresas" element={<ListaEmpresas />} />
              <Route path="/empresas/:id" element={<VerEmpresa />} />
            </Route>
            <Route element={<RotaComPermissao permissao="empresa.criar" />}>
              <Route path="/empresas/novo" element={<NovaEmpresa />} />
            </Route>
            <Route element={<RotaComPermissao permissao="empresa.editar" />}>
              <Route path="/empresas/:id/editar" element={<EditarEmpresa />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NaoEncontrado />} />
      </Routes>
    </Router>
  );
}
