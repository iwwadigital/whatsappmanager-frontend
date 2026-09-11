import { useEffect, useMemo, useState, type FormEvent } from "react";
import AbaAlerta from "./AbaAlerta";
import { useTiposDeGrupo } from "./useTiposDeGrupo";
import AbaDisponibilidade from "./AbaDisponibilidade";
import AbaObservacoes from "./AbaObservacoes";
import AbaProgramas from "./AbaProgramas";
import StatusDoAlerta from "./StatusDoAlerta";
import Abas from "../crud/Abas";
import Button from "../ui/button/Button";
import CampoDataHora from "../campos/CampoDataHora";
import Carregador from "../campos/Carregador";
import { MensagemErro } from "../crud/EstadosLista";
import { useEmpresaAtiva } from "../../context/EmpresaAtivaContext";
import {
  ITINERARIO_AMARRADO,
  TRECHO_AMARRADO,
  TRECHO_IDA,
  TRECHO_VOLTA,
} from "../../utils/alertas";
import {
  formularioInicial,
  mesesEmBranco,
  paraEnvio,
  type DadosFormularioAlerta,
} from "./formulario";
import type { ErrosValidacao } from "../../types/api";
import type { Alerta, DadosAlerta } from "../../types/modelos";

interface FormularioAlertaProps {
  registro?: Alerta | null;
  salvando: boolean;
  erros: ErrosValidacao;
  erroGeral?: string | null;
  aoEnviar: (dados: DadosAlerta) => void;
  aoCancelar: () => void;
}

/** As abas, na ordem em que a especificação as descreve. */
const ABAS = [
  { chave: "alerta", rotulo: "Adicionar novo alerta" },
  { chave: "programas", rotulo: "Programas de fidelidade" },
  { chave: "disponibilidade", rotulo: "Disponibilidade" },
  { chave: "observacoes", rotulo: "Observações e links úteis" },
];

/**
 * Formulário compartilhado pelo cadastro e pela edição de um alerta.
 *
 * As quatro abas são **um formulário só**, e vão para a API em uma requisição:
 * o alerta não faz sentido pela metade, e salvar aba por aba criaria estados
 * intermediários que a fila do robô já teria consumido.
 *
 * Por isso o conteúdo das abas inativas continua montado — trocar de aba não
 * pode jogar fora o que foi digitado — e um erro de validação marca a aba onde
 * ele está, em vez de obrigar a procurar de uma em uma.
 *
 * **O itinerário é o eixo do formulário.** Mudá-lo muda a aba de programas (os
 * campos de volta) e reconstrói a de disponibilidade (meses ou pares de
 * datas), porque as duas formas não têm como conviver na mesma linha.
 */
export default function FormularioAlerta({
  registro,
  salvando,
  erros,
  erroGeral,
  aoEnviar,
  aoCancelar,
}: FormularioAlertaProps) {
  const { empresaId } = useEmpresaAtiva();
  const { tipos, carregando: carregandoTipos } = useTiposDeGrupo(empresaId);

  const [aba, setAba] = useState("alerta");
  const [dados, setDados] = useState<DadosFormularioAlerta>(() =>
    formularioInicial(registro),
  );

  useEffect(() => {
    setDados(formularioInicial(registro));
  }, [registro]);

  const definir = <C extends keyof DadosFormularioAlerta>(
    campo: C,
    valor: DadosFormularioAlerta[C],
  ) => {
    setDados((atuais) => ({ ...atuais, [campo]: valor }));
  };

  /**
   * Trocar o itinerário ajusta a disponibilidade — sem jogar fora o que dá
   * para aproveitar.
   *
   * Entrar ou sair do amarrado troca a **forma** da linha (par de datas
   * casadas contra mês com dias), e aí não há o que reaproveitar. Já entre
   * "somente ida" e "ida e volta" os meses de ida valem nos dois: refazê-los
   * apagaria dias que acabaram de ser digitados, e quem só quis acrescentar a
   * volta perderia o trabalho todo.
   */
  const trocarItinerario = (novo: number) => {
    setDados((atuais) => {
      if (atuais.itinerario === novo) return atuais;

      const eraAmarrado = atuais.itinerario === ITINERARIO_AMARRADO;
      const viraAmarrado = novo === ITINERARIO_AMARRADO;

      if (eraAmarrado || viraAmarrado) {
        return {
          ...atuais,
          itinerario: novo,
          disponibilidade_ida: viraAmarrado ? [] : mesesEmBranco(TRECHO_IDA),
          disponibilidade_volta: viraAmarrado ? [] : mesesEmBranco(TRECHO_VOLTA),
        };
      }

      // 0 <-> 1: a ida continua valendo; só a volta entra ou sai de cena.
      return {
        ...atuais,
        itinerario: novo,
        disponibilidade_volta:
          atuais.disponibilidade_volta.length > 0
            ? atuais.disponibilidade_volta
            : mesesEmBranco(TRECHO_VOLTA),
      };
    });
  };

  /** Algum tipo escolhido é gratuito? Liga a coluna "Esconder". */
  const temGrupoGratuito = useMemo(
    () =>
      tipos.some(
        (tipo) => tipo.e_gratis && dados.grupos_tipos.includes(tipo.id),
      ),
    [tipos, dados.grupos_tipos],
  );

  const abas = ABAS.map((item) => ({
    ...item,
    comErro: temErroNaAba(item.chave, erros),
    contador: contadorDaAba(item.chave, dados),
  }));

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    aoEnviar(paraEnvio(dados));
  };

  return (
    <form
      onSubmit={enviar}
      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-6"
    >
      {erroGeral && (
        <div className="mb-5">
          <MensagemErro mensagem={erroGeral} />
        </div>
      )}

      {registro && (
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
      )}

      <div className="mb-6 sm:max-w-xs">
        <CampoDataHora
          id="nao_disparar_antes_de"
          label="Não disparar antes de"
          valor={dados.nao_disparar_antes_de}
          aoAlterar={(valor) => definir("nao_disparar_antes_de", valor)}
          dica={
            registro && !registro.pode_reagendar
              ? "O alerta já foi disparado: a data não pode mais ser alterada."
              : "Em branco, o alerta entra na fila para sair assim que possível."
          }
          erro={erros.nao_disparar_antes_de?.[0]}
          desabilitado={salvando || (registro ? !registro.pode_reagendar : false)}
        />
      </div>

      <Abas abas={abas} ativa={aba} aoSelecionar={setAba} />

      <div className="pt-6">
        {/* As abas inativas continuam montadas: trocar de aba não pode
            descartar o que foi digitado nelas. */}
        <div hidden={aba !== "alerta"}>
          <AbaAlerta
            dados={dados}
            definir={definir}
            aoTrocarItinerario={trocarItinerario}
            erros={erros}
            desabilitado={salvando}
            tipos={tipos}
            carregandoTipos={carregandoTipos}
          />
        </div>

        <div hidden={aba !== "programas"}>
          <AbaProgramas
            itinerario={dados.itinerario}
            programas={dados.programas}
            aoAlterar={(programas) => definir("programas", programas)}
            erros={erros}
            desabilitado={salvando}
          />
        </div>

        <div hidden={aba !== "disponibilidade"}>
          <AbaDisponibilidade
            itinerario={dados.itinerario}
            ida={dados.disponibilidade_ida}
            volta={dados.disponibilidade_volta}
            aoAlterarIda={(linhas) => definir("disponibilidade_ida", linhas)}
            aoAlterarVolta={(linhas) => definir("disponibilidade_volta", linhas)}
            temGrupoGratuito={temGrupoGratuito}
            erros={erros}
            desabilitado={salvando}
          />
        </div>

        <div hidden={aba !== "observacoes"}>
          <AbaObservacoes
            pontos={dados.pontos_atencao}
            links={dados.links_uteis}
            rodapes={dados.rodapes_gratis}
            aoAlterarPontos={(ids) => definir("pontos_atencao", ids)}
            aoAlterarLinks={(ids) => definir("links_uteis", ids)}
            aoAlterarRodapes={(ids) => definir("rodapes_gratis", ids)}
            erros={erros}
            desabilitado={salvando}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          disabled={salvando}
          startIcon={salvando ? <Carregador tamanho="size-4" /> : undefined}
        >
          Salvar
        </Button>
        <button
          type="button"
          onClick={aoCancelar}
          disabled={salvando}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

/** Os campos de cada aba, para marcar onde a validação reclamou. */
const CAMPOS_DA_ABA: Record<string, string[]> = {
  alerta: [
    "selo_destaque_id",
    "rota_aerea_id",
    "nome",
    "chamada",
    "frase_editorial",
    "itinerario",
    "voo_direto",
    "grupos_tipos",
  ],
  programas: ["programas"],
  disponibilidade: ["disponibilidades"],
  observacoes: ["cadastros"],
};

/**
 * A aba tem campo com erro?
 *
 * Os erros de repetidor chegam com índice (`programas.0.custo_ida`), então a
 * comparação é por prefixo.
 */
function temErroNaAba(aba: string, erros: ErrosValidacao): boolean {
  const campos = CAMPOS_DA_ABA[aba] ?? [];

  return Object.keys(erros).some((chave) =>
    campos.some((campo) => chave === campo || chave.startsWith(`${campo}.`)),
  );
}

/** Quantos itens a aba tem preenchidos — o número ao lado do rótulo. */
function contadorDaAba(
  aba: string,
  dados: DadosFormularioAlerta,
): number | undefined {
  switch (aba) {
    case "programas":
      return dados.programas.filter((linha) => linha.programa_id !== null)
        .length;
    case "disponibilidade":
      return dados.itinerario === ITINERARIO_AMARRADO
        ? dados.disponibilidade_ida.filter(
            (linha) =>
              linha.itinerario === TRECHO_AMARRADO &&
              linha.data_ida &&
              linha.data_volta,
          ).length
        : [...dados.disponibilidade_ida, ...dados.disponibilidade_volta].filter(
            (linha) => (linha.dias ?? "").trim() !== "",
          ).length;
    case "observacoes":
      return (
        dados.pontos_atencao.length +
        dados.links_uteis.length +
        dados.rodapes_gratis.length
      );
    default:
      return undefined;
  }
}
