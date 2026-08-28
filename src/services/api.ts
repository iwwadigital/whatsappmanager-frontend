import type { RespostaApi } from "../types/api";
import type {
  Acao,
  AcaoGrupo,
  AcaoTipo,
  Autenticacao,
  DadosAcao,
  DadosAcaoGrupo,
  DadosAcaoTipo,
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
  ApiDisponivel,
  DadosGrupoConta,
  DadosWhatsappApi,
  DadosWhatsappConta,
  WhatsappApi,
  WhatsappConta,
} from "../types/modelos";
import { requisitar } from "./http";
import { criarRecurso } from "./recurso";

/* ------------------------------- Recursos ------------------------------- */

/** Catálogo global de tipos de ação (não é dividido por empresa). */
export const acoesTiposApi = criarRecurso<AcaoTipo, DadosAcaoTipo>({
  caminho: "acoes-tipos",
  chaveLista: "acoes_tipos",
  chaveItem: "acao_tipo",
});

/**
 * Ações da empresa ativa. A API não tem `store`: a ação é criada pelo
 * sistema, então `criar()` deste recurso não deve ser usado.
 */
export const acoesApi = criarRecurso<Acao, DadosAcao>({
  caminho: "acoes",
  chaveLista: "acoes",
  chaveItem: "acao",
});

/**
 * Execuções das ações nos grupos. A API não tem `store` nem `destroy`: a
 * linha é criada pelo robô, e só `prioridade` e `iniciar_apartir_de` podem
 * ser editados.
 */
export const acoesGruposApi = criarRecurso<AcaoGrupo, DadosAcaoGrupo>({
  caminho: "acoes-grupos",
  chaveLista: "acoes_grupos",
  chaveItem: "acao_grupo",
});

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

/**
 * Alocação automática de um membro em um tipo de grupo: a API escolhe o
 * grupo com menos participantes que ainda tem vaga — ou cria um novo.
 *
 * Não usa `criarRecurso` porque aqui a **mensagem** da API é o resultado que
 * interessa: é ela que diz em qual grupo o membro entrou, e se o grupo
 * precisou ser criado.
 */
export const gruposTiposMembrosApi = {
  async alocar(
    grupoTipoId: number | string,
    dados: DadosGrupoMembro,
  ): Promise<{ vinculo: GrupoMembro; mensagem: string }> {
    const resposta = await requisitar({
      metodo: "POST",
      caminho: `grupos-tipos/${grupoTipoId}/membros`,
      dados,
    });

    return {
      vinculo: resposta.grupo_membro as GrupoMembro,
      mensagem: resposta.message,
    };
  },
};

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

/* --------------------------- WhatsApp --------------------------- */

/** APIs de WhatsApp da empresa ativa. */
export const whatsappApisApi = criarRecurso<WhatsappApi, DadosWhatsappApi>({
  caminho: "whatsapp-apis",
  chaveLista: "whatsapp_apis",
  chaveItem: "whatsapp_api",
});

/**
 * Interfaces de conexão que o sistema sabe operar — alimenta o campo "API"
 * do formulário. Só exige autenticação.
 */
export const apisDisponiveisApi = {
  async listar(): Promise<ApiDisponivel[]> {
    const resposta = await requisitar({ caminho: "whatsapp-apis-disponiveis" });

    // "aviso" = nenhuma interface registrada no GerenciadorWhatsApp.
    return resposta.type === "aviso"
      ? []
      : ((resposta.apis_disponiveis as ApiDisponivel[] | undefined) ?? []);
  },
};

/** Contas de WhatsApp da empresa ativa (listagem sem paginação). */
export const whatsappContasApi = {
  ...criarRecurso<WhatsappConta, DadosWhatsappConta>({
    caminho: "whatsapp-contas",
    chaveLista: "whatsapp_contas",
    chaveItem: "whatsapp_conta",
  }),

  /**
   * Consulta o status da conta na API e grava o resultado.
   * Devolve a conta atualizada e a mensagem — que também explica a falha
   * quando a API não responde (alerta 409, tratado por quem chama).
   */
  async sincronizarStatus(
    id: number | string,
  ): Promise<{ conta: WhatsappConta; mensagem: string }> {
    const resposta = await requisitar({
      metodo: "POST",
      caminho: `whatsapp-contas/${id}/status`,
    });

    return {
      conta: resposta.whatsapp_conta as WhatsappConta,
      mensagem: resposta.message,
    };
  },
};

/**
 * Contas de WhatsApp de um grupo (`grupos_whatsapp_contas`). O vínculo não
 * tem atributos nem edição: `listar`, `criar` e `remover` (pelo id da conta).
 */
export function criarGruposContasApi(grupoId: number | string) {
  return criarRecurso<WhatsappConta, DadosGrupoConta>({
    caminho: `grupos/${grupoId}/whatsapp-contas`,
    chaveLista: "whatsapp_contas",
    chaveItem: "whatsapp_conta",
  });
}

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
