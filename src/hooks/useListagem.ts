import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mensagemDoErro } from "../services/http";
import type {
  Paginacao,
  ParametrosListagem,
  ResultadoLista,
} from "../types/api";

export type Filtros = Record<string, string>;

/** Atraso antes de consultar a API quando o usuário digita em um filtro. */
const ATRASO_FILTRO = 400;

interface OpcoesListagem<T> {
  listar: (parametros?: ParametrosListagem) => Promise<ResultadoLista<T>>;
  filtrosIniciais?: Filtros;
  porPagina?: number;
}

/**
 * Estado das listagens: filtros (scopes do Model) aplicados automaticamente,
 * paginação da API, carregamento, estado vazio ("aviso") e erros.
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

  // "filtros" acompanha os campos na tela; "aplicados" é o que vai para a API.
  const [filtros, setFiltros] = useState<Filtros>(iniciaisRef.current);
  const [aplicados, setAplicados] = useState<Filtros>(iniciaisRef.current);
  const [pagina, setPagina] = useState(1);
  const [itens, setItens] = useState<T[]>([]);
  const [paginacao, setPaginacao] = useState<Paginacao | null>(null);
  const [mensagemVazio, setMensagemVazio] = useState(
    "Nenhum registro encontrado.",
  );
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const chaveFiltros = JSON.stringify(filtros);
  const chaveAplicados = JSON.stringify(aplicados);

  // Digitação vira consulta depois do atraso, sem botão de "filtrar".
  useEffect(() => {
    if (chaveFiltros === chaveAplicados) {
      return;
    }

    const temporizador = window.setTimeout(() => {
      setAplicados(JSON.parse(chaveFiltros) as Filtros);
      setPagina(1);
    }, ATRASO_FILTRO);

    return () => window.clearTimeout(temporizador);
  }, [chaveFiltros, chaveAplicados]);

  const carregar = useCallback(async () => {
    const requisicao = requisicaoRef.current + 1;

    requisicaoRef.current = requisicao;
    setCarregando(true);
    setErro(null);

    try {
      const resultado = await listarRef.current({
        ...aplicados,
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
  }, [aplicados, pagina, porPagina]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  /**
   * Atualiza um filtro. Campos de texto usam o atraso padrão; selects,
   * datas e autocompletes devem passar `imediato` para consultar na hora.
   */
  const definirFiltro = useCallback(
    (campo: string, valor: string, imediato = false) => {
      setFiltros((atuais) => ({ ...atuais, [campo]: valor }));

      if (imediato) {
        setAplicados((atuais) => ({ ...atuais, [campo]: valor }));
        setPagina(1);
      }
    },
    [],
  );

  const limparFiltros = useCallback(() => {
    setFiltros(iniciaisRef.current);
    setAplicados(iniciaisRef.current);
    setPagina(1);
  }, []);

  const temFiltroAtivo = useMemo(
    () => Object.values(filtros).some((valor) => valor !== ""),
    [filtros],
  );

  return {
    itens,
    paginacao,
    pagina,
    filtros,
    carregando,
    erro,
    mensagemVazio,
    temFiltroAtivo,
    irParaPagina: setPagina,
    definirFiltro,
    limparFiltros,
    recarregar: carregar,
  };
}
