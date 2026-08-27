import type { OpcaoSelect } from "../components/campos/CampoSelect";

/**
 * Atividades registradas no log dos grupos — espelha
 * `App\Models\Grupo\GrupoAtividade::atividades()` da API.
 */
export const ATIVIDADES: Record<string, string> = {
  entrou: "Entrou",
  saiu: "Saiu",
  post_imagem: "Publicou imagem",
  post_texto: "Publicou texto",
  convite_enviado: "Convite enviado",
};

/** Rótulo da atividade; uma chave desconhecida é exibida como veio. */
export function rotuloAtividade(atividade?: string | null): string {
  if (!atividade) {
    return "—";
  }

  return ATIVIDADES[atividade] ?? atividade;
}

/** Cor do badge da atividade na listagem. */
export function corAtividade(
  atividade: string,
): "success" | "error" | "info" | "light" {
  switch (atividade) {
    case "entrou":
      return "success";
    case "saiu":
      return "error";
    case "convite_enviado":
      return "info";
    default:
      return "light";
  }
}

/** Opções do select de atividade da barra de filtros. */
export function opcoesAtividade(): OpcaoSelect[] {
  return Object.entries(ATIVIDADES).map(([valor, rotulo]) => ({
    valor,
    rotulo,
  }));
}
