import { useCallback, useEffect, useRef, useState } from "react";
import { mensagemDoErro } from "../services/http";
import type {
  Paginacao,
  ParametrosListagem,
  ResultadoLista,
} from "../types/api";

export type Filtros = Record<string, string>;

interface OpcoesListagem<T> {
  listar: (parametros?: ParametrosListagem) => Promise<ResultadoLista<T>>;
  filtrosIniciais?: Filtros;
  porPagina?: number;
}

/**
 * Estado das listagens: filtros (scopes do Model), paginação da API,
 * carregamento, estado vazio ("aviso") e erros.
 */
export function useListagem<T>({
  listar,
  filtrosIniciais = {},
  porPagina = 15,
}: OpcoesListagem<T>) {
  const listarRef = useRef(listar);
  const iniciaisRef = useRef(filtrosIniciais);
  const requisicaoRef = useRef(0);

  useEffect(() => {
    listarRef.current = listar;
  });

  const [filtros, setFiltros] = useState<Filtros>(iniciaisRef.current);
  const [pagina, setPagina] = useState(1);
  const [itens, setItens] = useState<T[]>([]);
  const [paginacao, setPaginacao] = useState<Paginacao | null>(null);
  const [mensagemVazio, setMensagemVazio] = useState(
    "Nenhum registro encontrado.",
  );
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const requisicao = requisicaoRef.current + 1;

    requisicaoRef.current = requisicao;
    setCarregando(true);
    setErro(null);

    try {
      const resultado = await listarRef.current({
        ...filtros,
        page: pagina,
        por_pagina: porPagina,
      });

      // Ignora respostas de requisições antigas.
      if (requisicaoRef.current !== requisicao) return;

      setItens(resultado.itens);
      setPaginacao(resultado.paginacao);

      if (resultado.vazio) {
        setMensagemVazio(resultado.mensagem);
      }
    } catch (falha) {
      if (requisicaoRef.current !== requisicao) return;

      setItens([]);
      setPaginacao(null);
      setErro(mensagemDoErro(falha));
    } finally {
      if (requisicaoRef.current === requisicao) {
        setCarregando(false);
      }
    }
  }, [filtros, pagina, porPagina]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const aplicarFiltros = useCallback((novos: Filtros) => {
    setFiltros(novos);
    setPagina(1);
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltros(iniciaisRef.current);
    setPagina(1);
  }, []);

  return {
    itens,
    paginacao,
    pagina,
    filtros,
    carregando,
    erro,
    mensagemVazio,
    irParaPagina: setPagina,
    aplicarFiltros,
    limparFiltros,
    recarregar: carregar,
  };
}
