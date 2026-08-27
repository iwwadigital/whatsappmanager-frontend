import type { RespostaApi } from "../types/api";
import type {
  Autenticacao,
  DadosEmpresa,
  DadosGrupo,
  DadosGrupoMembro,
  DadosGrupoTipo,
  DadosMembro,
  DadosPermissao,
  DadosUsuario,
  DadosUsuarioTipo,
  Empresa,
  EmpresaResumo,
  Grupo,
  GrupoAtividade,
  GrupoMembro,
  GrupoTipo,
  Membro,
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

/** Grupos e tipos de grupo são divididos pela empresa ativa (X-Empresa-Id). */
export const gruposApi = criarRecurso<Grupo, DadosGrupo>({
  caminho: "grupos",
  chaveLista: "grupos",
  chaveItem: "grupo",
});

export const gruposTiposApi = criarRecurso<GrupoTipo, DadosGrupoTipo>({
  caminho: "grupos-tipos",
  chaveLista: "grupos_tipos",
  chaveItem: "grupo_tipo",
});

/**
 * Membros do grupo (tabela pivô com chave composta): o caminho depende do
 * grupo, por isso o recurso é montado por grupo. O id usado em `atualizar` e
 * `remover` é o do **membro**, como na rota /grupos/{grupo}/membros/{membro}.
 */
export function criarGruposMembrosApi(grupoId: number | string) {
  return criarRecurso<GrupoMembro, DadosGrupoMembro>({
    caminho: `grupos/${grupoId}/membros`,
    chaveLista: "grupos_membros",
    chaveItem: "grupo_membro",
  });
}

/** Log de atividades dos grupos — somente leitura (apenas `listar`). */
export const gruposAtividadesApi = criarRecurso<GrupoAtividade, never>({
  caminho: "grupos-atividades",
  chaveLista: "grupos_atividades",
  chaveItem: "grupo_atividade",
});

export const membrosApi = criarRecurso<Membro, DadosMembro>({
  caminho: "membros",
  chaveLista: "membros",
  chaveItem: "membro",
});

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
