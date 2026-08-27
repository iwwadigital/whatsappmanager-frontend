import type { ReactNode } from "react";
import Paginacao from "./Paginacao";
import {
  EstadoCarregando,
  EstadoVazio,
  MensagemErro,
  MensagemSucesso,
} from "./EstadosLista";
import type { Paginacao as DadosPaginacao } from "../../types/api";

interface CartaoListagemProps {
  /** Título acima do cartão; normalmente já vem do breadcrumb da página. */
  titulo?: string;
  /** Campos de filtro exibidos na barra (aplicados automaticamente). */
  filtros?: ReactNode;
  /** Ações da direita da barra (ex.: botão "Novo"). */
  acoes?: ReactNode;
  carregando: boolean;
  erro?: string | null;
  mensagem?: string | null;
  mensagemVazio: string;
  vazio: boolean;
  paginacao: DadosPaginacao | null;
  aoMudarPagina: (pagina: number) => void;
  /**
   * Alinhamento dos filtros na barra. Use "end" quando os campos tiverem
   * rótulo, para que todos fiquem alinhados pela base.
   */
  alinharFiltros?: "center" | "end";
  /** A tabela da listagem. */
  children: ReactNode;
}

const CLASSE_BORDA = "border border-gray-100 dark:border-white/[0.05]";

/** Cartão padrão das listagens: barra de filtros + tabela + paginação. */
export default function CartaoListagem({
  titulo,
  filtros,
  acoes,
  carregando,
  erro,
  mensagem,
  mensagemVazio,
  vazio,
  paginacao,
  aoMudarPagina,
  alinharFiltros = "center",
  children,
}: CartaoListagemProps) {
  const alinhamento =
    alinharFiltros === "end" ? "sm:items-end" : "sm:items-center";

  return (
    <div>
      {titulo && (
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
          {titulo}
        </h3>
      )}

      {mensagem && (
        <div className="mb-4">
          <MensagemSucesso mensagem={mensagem} />
        </div>
      )}

      {erro && (
        <div className="mb-4">
          <MensagemErro mensagem={erro} />
        </div>
      )}

      <div className="rounded-xl bg-white dark:bg-white/[0.03]">
        <div
          className={`flex flex-col gap-2 rounded-t-xl border-b-0 px-4 py-4 sm:flex-row sm:justify-between ${alinhamento} ${CLASSE_BORDA}`}
        >
          <div
            className={`flex flex-col gap-2 sm:flex-row sm:flex-wrap ${alinhamento}`}
          >
            {filtros}
          </div>

          {acoes && <div className="flex items-center gap-3">{acoes}</div>}
        </div>

        <div className="custom-scrollbar max-w-full overflow-x-auto">
          {carregando ? (
            <div className={CLASSE_BORDA}>
              <EstadoCarregando />
            </div>
          ) : vazio ? (
            <div className={CLASSE_BORDA}>
              <EstadoVazio
                mensagem={erro ? "Nenhum registro para exibir." : mensagemVazio}
              />
            </div>
          ) : (
            <>
              {children}
              <Paginacao
                paginacao={paginacao}
                aoMudarPagina={aoMudarPagina}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
