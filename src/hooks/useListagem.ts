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
  /**
   * Valor externo que refaz a consulta (voltando à primeira página) quando
   * muda. Nas listagens divididas por empresa, passe o `empresaId` de
   * `useEmpresaAtiva()`.
   */
  chaveRecarga?: string | number;
}

/**
 * Estado das listagens: filtros (scopes do Model) aplicados automaticamente,
 * paginação da API, carregamento, estado vazio ("aviso") e erros.
 */
export function useListagem<T>({
  listar,
  filtrosIniciais = {},
  porPagina = 15,
  chaveRecarga,
}: OpcoesListagem<T>) {
  const listarRef = useRef(listar);
  const iniciaisRef = useRef(filtrosIniciais);
  const requisicaoRef = useRef(0);
  const chaveAnteriorRef = useRef(chaveRecarga);

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

  // Trocar de empresa (ou de qualquer chave externa) recomeça na página 1.
  // Ajuste de estado durante o render: evita a consulta descartada que um
  // useEffect faria com a página anterior.
  if (chaveAnteriorRef.current !== chaveRecarga) {
    chaveAnteriorRef.current = chaveRecarga;
    setPagina(1);
  }

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
    // A empresa ativa vai no cabeçalho: guardamos a chave da requisição para
    // descartar a resposta se ela mudar no meio do caminho.
    const chaveDaRequisicao = chaveRecarga;

    requisicaoRef.current = requisicao;
    setCarregando(true);
    setErro(null);

    /** Resposta de requisição antiga ou de outra empresa é descartada. */
    const obsoleta = () =>
      requisicaoRef.current !== requisicao ||
      chaveAnteriorRef.current !== chaveDaRequisicao;

    try {
      const resultado = await listarRef.current({
        ...aplicados,
        page: pagina,
        por_pagina: porPagina,
      });

      if (obsoleta()) return;

      setItens(resultado.itens);
      setPaginacao(resultado.paginacao);

      if (resultado.vazio) {
        setMensagemVazio(resultado.mensagem);
      }
    } catch (falha) {
      if (obsoleta()) return;

      setItens([]);
      setPaginacao(null);
      setErro(mensagemDoErro(falha));
    } finally {
      if (!obsoleta()) {
        setCarregando(false);
      }
    }
  }, [aplicados, pagina, porPagina, chaveRecarga]);

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
