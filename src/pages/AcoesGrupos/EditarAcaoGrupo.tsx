import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import ItemDetalhe from "../../components/crud/ItemDetalhe";
import CampoDataHora from "../../components/campos/CampoDataHora";
import CampoTexto from "../../components/campos/CampoTexto";
import Carregador from "../../components/campos/Carregador";
import Button from "../../components/ui/button/Button";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useRegistro } from "../../hooks/useRegistro";
import { acoesGruposApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { AcaoGrupo } from "../../types/modelos";
import {
  deCampoDataHora,
  formatarDataHora,
  formatarNumero,
  ouTraco,
  paraCampoDataHora,
} from "../../utils/formato";

/**
 * Edição de uma execução. Só prioridade e "inicia a partir de" são
 * editáveis — o resto é do robô e aparece apenas para consulta.
 */
export default function EditarAcaoGrupo() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { registro, carregando, erro } = useRegistro<AcaoGrupo>(
    acoesGruposApi.mostrar,
    id,
  );

  const [prioridade, setPrioridade] = useState("0");
  const [iniciarApartirDe, setIniciarApartirDe] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  useEffect(() => {
    setPrioridade(String(registro?.prioridade ?? 0));
    setIniciarApartirDe(paraCampoDataHora(registro?.iniciar_apartir_de));
  }, [registro]);

  const salvar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (!id) return;

    const quando = deCampoDataHora(iniciarApartirDe);

    if (!quando) {
      setErros({
        iniciar_apartir_de: ["Informe a partir de quando a execução pode começar."],
      });

      return;
    }

    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await acoesGruposApi.atualizar(id, {
        prioridade: Number(prioridade) || 0,
        iniciar_apartir_de: quando,
      });

      navegar("/acoes-grupos", {
        state: { mensagem: "Execução atualizada com sucesso." },
      });
    } catch (falha) {
      if (falha instanceof ErroApi && falha.ehValidacao) {
        setErros(falha.erros);
      } else {
        setErroGeral(mensagemDoErro(falha));
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="Editar execução | WhatsApp Manager"
        description="Edição da execução de uma ação"
      />
      <CabecalhoPagina
        titulo="Editar execução"
        trilha={[
          { rotulo: "Execuções das ações", caminho: "/acoes-grupos" },
          { rotulo: registro?.acao?.tipo?.nome ?? "Editar" },
        ]}
      />

      {carregando && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <EstadoCarregando />
        </div>
      )}

      {!carregando && erro && <MensagemErro mensagem={erro} />}

      {!carregando && registro && (
        <form
          onSubmit={salvar}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-6"
        >
          {erroGeral && (
            <div className="mb-5">
              <MensagemErro mensagem={erroGeral} />
            </div>
          )}

          {/* Contexto da execução: nada aqui é editável. */}
          <dl className="mb-6">
            <ItemDetalhe rotulo="Tipo de ação">
              {ouTraco(registro.acao?.tipo?.nome)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Grupo">
              {ouTraco(registro.grupo?.nome)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Conta">
              {registro.whatsapp_conta
                ? `${registro.whatsapp_conta.nome} — ${formatarNumero(
                    registro.whatsapp_conta.numero,
                  )}`
                : "—"}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Iniciado">
              {formatarDataHora(registro.iniciado)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Finalizado">
              {formatarDataHora(registro.finalizado)}
            </ItemDetalhe>
          </dl>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <CampoTexto
              id="prioridade"
              label="Prioridade"
              obrigatorio
              tipo="number"
              valor={prioridade}
              aoAlterar={setPrioridade}
              dica="Menor primeiro: o robô executa da menor prioridade para a maior. Vem do tipo da ação."
              erro={erros.prioridade?.[0]}
            />

            <CampoDataHora
              id="iniciar_apartir_de"
              label="Inicia a partir de"
              obrigatorio
              valor={iniciarApartirDe}
              aoAlterar={setIniciarApartirDe}
              dica="Execução pendente volta para a fila quando esta hora chegar."
              erro={erros.iniciar_apartir_de?.[0]}
            />
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
              onClick={() => navegar("/acoes-grupos")}
              disabled={salvando}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
