import type { RespostaApi } from "../types/api";
import type {
  Autenticacao,
  DadosEmpresa,
  DadosPermissao,
  DadosUsuario,
  DadosUsuarioTipo,
  Empresa,
  EmpresaResumo,
  Permissao,
  Usuario,
  UsuarioAutenticado,
  UsuarioTipo,
} from "../types/modelos";
import { requisitar } from "./http";
import { criarRecurso } from "./recurso";

/* ------------------------------- Recursos ------------------------------- */

export const empresasApi = criarRecurso<Empresa, DadosEmpresa>({
  caminho: "empresas",
  chaveLista: "empresas",
  chaveItem: "empresa",
});

/**
 * Empresas que o usuário pode escolher no seletor do header.
 * Só exige autenticação (não depende da permissão `empresa.ver`).
 */
export const empresasDisponiveisApi = {
  async listar(): Promise<EmpresaResumo[]> {
    const resposta = await requisitar({ caminho: "empresas-disponiveis" });

    // "aviso" = nenhuma empresa disponível.
    return resposta.type === "aviso"
      ? []
      : ((resposta.empresas as EmpresaResumo[] | undefined) ?? []);
  },
};

export const permissoesApi = criarRecurso<Permissao, DadosPermissao>({
  caminho: "permissoes",
  chaveLista: "permissoes",
  chaveItem: "permissao",
});

export const usuariosTiposApi = criarRecurso<UsuarioTipo, DadosUsuarioTipo>({
  caminho: "usuarios-tipos",
  chaveLista: "usuarios_tipos",
  chaveItem: "usuario_tipo",
});

export const usuariosApi = criarRecurso<Usuario, DadosUsuario>({
  caminho: "usuarios",
  chaveLista: "usuarios",
  chaveItem: "usuario",
});

/* ----------------------------- Autenticação ----------------------------- */

export interface DadosLogin {
  email: string;
  senha: string;
  empresa_id?: number | null;
}

export const autenticacaoApi = {
  /** POST /login (rota pública). */
  async entrar(dados: DadosLogin): Promise<RespostaApi> {
    return requisitar({
      metodo: "POST",
      caminho: "login",
      dados,
      autenticar: false,
    });
  },

  /** GET /eu — revalida o token e devolve o usuário autenticado. */
  async eu(): Promise<UsuarioAutenticado> {
    const resposta = await requisitar({ caminho: "eu" });

    return resposta.usuario as UsuarioAutenticado;
  },

  /** POST /logout — revoga o token atual. */
  async sair(): Promise<void> {
    await requisitar({ metodo: "POST", caminho: "logout" });
  },
};

/** Extrai o bloco "autenticacao" do retorno do login. */
export function extrairAutenticacao(resposta: RespostaApi): Autenticacao {
  return resposta.autenticacao as Autenticacao;
}
