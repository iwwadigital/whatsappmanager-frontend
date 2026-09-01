import type { OpcaoSelect } from "../components/campos/CampoSelect";

/**
 * Onde o membro está **de verdade** dentro do grupo do WhatsApp — espelha
 * `App\Models\Grupo\GrupoMembro::situacoes()` da API.
 *
 * Não confundir com o `status` do vínculo, que é o ativo/inativo do cadastro.
 * Membro comum não é mais adicionado à força: ele recebe o link de convite e
 * entra quando quiser, então "cadastrado" e "dentro do grupo" deixaram de ser
 * a mesma coisa. Quem confirma é a varredura do robô.
 */
export const SITUACOES_VINCULO: Record<string, string> = {
  pendente: "Aguardando entrar",
  confirmado: "No grupo",
  saiu: "Saiu do grupo",
};

/** Rótulo da situação; uma chave desconhecida é exibida como veio. */
export function rotuloSituacao(situacao?: string | null): string {
  if (!situacao) {
    return "—";
  }

  return SITUACOES_VINCULO[situacao] ?? situacao;
}

/** Cor do badge da situação na listagem. */
export function corSituacao(
  situacao?: string | null,
): "success" | "error" | "warning" | "light" {
  switch (situacao) {
    case "confirmado":
      return "success";
    case "saiu":
      return "error";
    case "pendente":
      return "warning";
    default:
      return "light";
  }
}

/** Opções do select de situação da barra de filtros. */
export function opcoesSituacao(): OpcaoSelect[] {
  return Object.entries(SITUACOES_VINCULO).map(([valor, rotulo]) => ({
    valor,
    rotulo,
  }));
}
