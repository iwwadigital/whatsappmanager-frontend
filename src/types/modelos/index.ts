/**
 * Models da API espelhados no frontend — um arquivo por model.
 * Importe daqui (`types/modelos`) ou direto do arquivo do model.
 */
export type { Acao, DadosAcao } from "./acao";
export type {
  AcaoGrupo,
  AcaoGrupoAcao,
  AcaoGrupoConta,
  DadosAcaoGrupo,
} from "./acaoGrupo";
export type { AcaoGrupoLog, AcaoGrupoLogExecucao } from "./acaoGrupoLog";
export type { AcaoTipo, AcaoTipoResumo, DadosAcaoTipo } from "./acaoTipo";
export type {
  Cadastro,
  DadosCadastro,
  LinhaRepetidor,
  MetaCadastro,
  ValorArquivo,
  ValorTaxonomia,
} from "./cadastro";
export type {
  CadastroTipo,
  CadastroTipoResumo,
  DadosCadastroTipo,
} from "./cadastroTipo";
export type {
  AtributoCampo,
  CampoPersonalizado,
  FormatoAtributo,
  GrupoCamposPersonalizados,
  OpcaoAtributo,
  OpcaoCampo,
  TipoCampoCatalogo,
} from "./campoPersonalizado";
export type {
  Empresa,
  EmpresaResumo,
  DadosEmpresa,
  CamposPersonalizados,
} from "./empresa";
export type { Grupo, GrupoResumo, DadosGrupo } from "./grupo";
export type { GrupoTipo, GrupoTipoResumo, DadosGrupoTipo } from "./grupoTipo";
export type { GrupoMembro, DadosGrupoMembro } from "./grupoMembro";
export type { GrupoAtividade } from "./grupoAtividade";
export type {
  Membro,
  MembroGrupo,
  MembroResumo,
  DadosMembro,
} from "./membro";
export type { Permissao, DadosPermissao } from "./permissao";
export type { UsuarioTipo, DadosUsuarioTipo } from "./usuarioTipo";
export type { Usuario, DadosUsuario } from "./usuario";
export type { UsuarioAutenticado, Autenticacao } from "./autenticacao";
export type {
  ApiDisponivel,
  WhatsappApi,
  WhatsappApiResumo,
  DadosWhatsappApi,
} from "./whatsappApi";
export type {
  WhatsappConta,
  DadosWhatsappConta,
  DadosGrupoConta,
} from "./whatsappConta";
