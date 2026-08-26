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

import ListaGrupos from "./pages/Grupos/ListaGrupos";
import NovoGrupo from "./pages/Grupos/NovoGrupo";
import EditarGrupo from "./pages/Grupos/EditarGrupo";
import VerGrupo from "./pages/Grupos/VerGrupo";

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
