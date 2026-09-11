import { useState } from "react";
import { Link, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import ItemDetalhe from "../../components/crud/ItemDetalhe";
import StatusDoAlerta from "../../components/alertas/StatusDoAlerta";
import ArtesDoTipo from "../../components/alertas/ArtesDoTipo";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import {
  CLASSE_CABECALHO,
  Celula,
  CelulaCabecalho,
} from "../../components/crud/Tabela";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { useRegistro } from "../../hooks/useRegistro";
import { alertasApi } from "../../services/api";
import {
  ITINERARIO_AMARRADO,
  TIPO_LINK_UTIL,
  TIPO_PONTO_ATENCAO,
  TIPO_RODAPE_GRATIS,
  TRECHO_IDA,
  rotuloItinerario,
  rotuloMes,
} from "../../utils/alertas";
import { formatarData, formatarDataHora, ouTraco } from "../../utils/formato";
import type { Alerta } from "../../types/modelos";

const CARTAO =
  "rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-6";

export default function VerAlerta() {
  const { id } = useParams();
  const { temPermissao } = useAutenticacao();

  const { registro, carregando, erro, recarregar } = useRegistro<Alerta>(
    alertasApi.mostrar,
    id,
  );

  const [erroArte, setErroArte] = useState<string | null>(null);

  return (
    <div>
      <PageMeta
        title="Alerta | WhatsApp Manager"
        description="Detalhes do alerta de oferta de passagem"
      />
      <CabecalhoPagina
        titulo={registro?.nome ?? "Alerta"}
        trilha={[
          { rotulo: "Alertas", caminho: "/alertas" },
          { rotulo: registro?.nome ?? "Detalhes" },
        ]}
        acoes={
          <>
            <Link
              to="/alertas"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Voltar
            </Link>

            {registro && temPermissao("alerta.editar") && (
              <Link
                to={`/alertas/${registro.id}/editar`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                Editar
              </Link>
            )}
          </>
        }
      />

      {carregando && (
        <div className={CARTAO}>
          <EstadoCarregando />
        </div>
      )}

      {!carregando && erro && <MensagemErro mensagem={erro} />}

      {!carregando && registro && (
        <div className="space-y-6">
          <StatusDoAlerta
            situacao={registro.situacao}
            agendamento={registro.nao_disparar_antes_de}
            total={registro.execucoes_total}
            enviados={
              registro.execucoes_total !== undefined &&
              registro.execucoes_pendentes !== undefined
                ? registro.execucoes_total - registro.execucoes_pendentes
                : undefined
            }
          />

          {/* ------------------------- Dados do alerta ------------------- */}
          <div className={CARTAO}>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <ItemDetalhe rotulo="Nome">{registro.nome}</ItemDetalhe>
              <ItemDetalhe rotulo="Chamada">{registro.chamada}</ItemDetalhe>
              <ItemDetalhe rotulo="Selo de destaque">
                {ouTraco(registro.selo_destaque?.nome)}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Rota aérea">
                {ouTraco(registro.rota_aerea?.nome)}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Itinerário">
                {rotuloItinerario(registro.itinerario)}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Voo direto">
                {registro.voo_direto ? "Sim" : "Não"}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Frase editorial">
                {ouTraco(registro.frase_editorial)}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Criado por">
                {ouTraco(registro.criado_por?.nome)}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Criado em">
                {formatarDataHora(registro.created_at)}
              </ItemDetalhe>
            </dl>
          </div>

          {/* --------------- Tipos de grupo e as artes de cada um -------- */}
          <div className={CARTAO}>
            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
              Tipos de grupo
            </h3>

            {erroArte && (
              <div className="mb-4">
                <MensagemErro mensagem={erroArte} />
              </div>
            )}

            {(registro.grupos_tipos ?? []).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhum tipo de grupo escolhido: o alerta não está na fila.
              </p>
            ) : (
              <div className="space-y-5">
                {(registro.grupos_tipos ?? []).map((vinculo) => (
                  <ArtesDoTipo
                    key={vinculo.grupo_tipo_id}
                    alertaId={registro.id}
                    vinculo={vinculo}
                    temVolta={registro.itinerario !== 0}
                    podeEditar={temPermissao("alerta.editar")}
                    aoAtualizar={recarregar}
                    aoFalhar={setErroArte}
                  />
                ))}
              </div>
            )}
          </div>

          {/* --------------------- Programas de fidelidade --------------- */}
          <div className={CARTAO}>
            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
              Programas de fidelidade
            </h3>

            {(registro.programas ?? []).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhum programa informado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className={CLASSE_CABECALHO}>
                    <TableRow>
                      <CelulaCabecalho>Programa</CelulaCabecalho>
                      <CelulaCabecalho>Ida (milhas)</CelulaCabecalho>
                      <CelulaCabecalho>Taxas de ida</CelulaCabecalho>
                      <CelulaCabecalho>Volta (milhas)</CelulaCabecalho>
                      <CelulaCabecalho>Taxas de volta</CelulaCabecalho>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(registro.programas ?? []).map((programa) => (
                      <TableRow key={programa.id}>
                        <Celula destaque>
                          <span className="flex flex-wrap items-center gap-2">
                            {ouTraco(programa.programa?.nome)}
                            {programa.melhor_escolha && (
                              <Badge color="success" size="sm">
                                Melhor escolha
                              </Badge>
                            )}
                          </span>
                        </Celula>
                        <Celula>
                          {faixa(programa.custo_ida, programa.custo_ida_maximo)}
                        </Celula>
                        <Celula>
                          {programa.moeda_ida?.nome ?? ""}{" "}
                          {programa.custo_ida_taxa}
                        </Celula>
                        <Celula>
                          {programa.custo_volta === null
                            ? "—"
                            : faixa(
                                programa.custo_volta,
                                programa.custo_volta_maximo,
                              )}
                        </Celula>
                        <Celula>
                          {programa.custo_volta_taxa === null
                            ? "—"
                            : `${programa.moeda_volta?.nome ?? ""} ${programa.custo_volta_taxa}`}
                        </Celula>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* -------------------------- Disponibilidade ------------------ */}
          <div className={CARTAO}>
            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
              Disponibilidade
            </h3>

            {(registro.disponibilidades ?? []).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhuma data informada.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className={CLASSE_CABECALHO}>
                    <TableRow>
                      {registro.itinerario === ITINERARIO_AMARRADO ? (
                        <>
                          <CelulaCabecalho>Ida</CelulaCabecalho>
                          <CelulaCabecalho>Volta</CelulaCabecalho>
                        </>
                      ) : (
                        <>
                          <CelulaCabecalho>Trecho</CelulaCabecalho>
                          <CelulaCabecalho>Mês</CelulaCabecalho>
                          <CelulaCabecalho>Dias</CelulaCabecalho>
                          <CelulaCabecalho>Esconder (grátis)</CelulaCabecalho>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(registro.disponibilidades ?? []).map((linha) => (
                      <TableRow key={linha.id}>
                        {registro.itinerario === ITINERARIO_AMARRADO ? (
                          <>
                            <Celula destaque>
                              {formatarData(linha.data_ida)}
                            </Celula>
                            <Celula>{formatarData(linha.data_volta)}</Celula>
                          </>
                        ) : (
                          <>
                            <Celula destaque>
                              {linha.itinerario === TRECHO_IDA
                                ? "Ida"
                                : "Volta"}
                            </Celula>
                            <Celula>{rotuloMes(linha.mes)}</Celula>
                            <Celula>{ouTraco(linha.dias)}</Celula>
                            <Celula>
                              {linha.esconder_gratis ? "Sim" : "Não"}
                            </Celula>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* ----------------- Observações e links úteis ----------------- */}
          <div className={CARTAO}>
            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
              Observações e links úteis
            </h3>

            <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
              <ItemDetalhe rotulo="Vale observar">
                {listaPorTipo(registro, TIPO_PONTO_ATENCAO)}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Links úteis">
                {listaPorTipo(registro, TIPO_LINK_UTIL)}
              </ItemDetalhe>
              <ItemDetalhe rotulo="Rodapé para Mundo Grátis">
                {listaPorTipo(registro, TIPO_RODAPE_GRATIS)}
              </ItemDetalhe>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

/** "20.000" ou "20.000 a 25.000", quando há custo máximo. */
function faixa(minimo: number, maximo: number | null): string {
  const formatado = (valor: number) => valor.toLocaleString("pt-BR");

  return maximo === null
    ? formatado(minimo)
    : `${formatado(minimo)} a ${formatado(maximo)}`;
}

/** Os cadastros do alerta de um tipo, em lista. */
function listaPorTipo(alerta: Alerta, slug: string) {
  const itens = (alerta.cadastros ?? []).filter(
    (cadastro) => cadastro.tipo?.slug === slug,
  );

  if (itens.length === 0) {
    return "—";
  }

  return (
    <ul className="list-inside list-disc space-y-1">
      {itens.map((item) => (
        <li key={item.id}>{item.nome}</li>
      ))}
    </ul>
  );
}
