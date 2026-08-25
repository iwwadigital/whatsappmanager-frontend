import type { ParametrosListagem, ResultadoLista } from "../types/api";

/**
 * Percorre todas as páginas de uma listagem (por_pagina máximo da API = 100).
 * Usado quando a tela precisa da lista completa, como o vínculo de permissões.
 */
export async function carregarTodos<T>(
  listar: (parametros?: ParametrosListagem) => Promise<ResultadoLista<T>>,
  parametros: ParametrosListagem = {},
  limitePaginas = 20,
): Promise<T[]> {
  const itens: T[] = [];
  let pagina = 1;

  for (let volta = 0; volta < limitePaginas; volta += 1) {
    const resultado = await listar({
      ...parametros,
      page: pagina,
      por_pagina: 100,
    });

    itens.push(...resultado.itens);

    const ultima = resultado.paginacao?.last_page ?? pagina;

    if (resultado.vazio || pagina >= ultima) {
      break;
    }

    pagina += 1;
  }

  return itens;
}
