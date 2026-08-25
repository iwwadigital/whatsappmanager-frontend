/** Datas chegam da API no fuso America/Sao_Paulo, como "YYYY-MM-DD HH:mm:ss". */
export function formatarDataHora(valor?: string | null): string {
  if (!valor) {
    return "—";
  }

  const partes = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(valor);

  if (!partes) {
    return valor;
  }

  const [, ano, mes, dia, hora, minuto] = partes;

  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

/** Somente a data, sem a hora. */
export function formatarData(valor?: string | null): string {
  const completo = formatarDataHora(valor);

  return completo === "—" ? completo : completo.split(" ")[0];
}

/** Texto vazio vira traço, para não deixar célula em branco na tabela. */
export function ouTraco(valor?: string | null): string {
  return valor && valor.trim() !== "" ? valor : "—";
}
