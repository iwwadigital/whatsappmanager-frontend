import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import ItemDetalhe from "../../components/crud/ItemDetalhe";
import CampoDataHora from "../../components/campos/CampoDataHora";
import Carregador from "../../components/campos/Carregador";
import Button from "../../components/ui/button/Button";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useRegistro } from "../../hooks/useRegistro";
import { acoesApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { Acao } from "../../types/modelos";
import {
  deCampoDataHora,
  formatarDataHora,
  ouTraco,
  paraCampoDataHora,
} from "../../utils/formato";

/**
 * Edição da ação. A ação é criada pelo sistema, então o **único** campo
 * liberado é o agendamento — o resto aparece só como contexto.
 */
export default function EditarAcao() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { registro, carregando, erro } = useRegistro<Acao>(acoesApi.mostrar, id);

  const [agendamento, setAgendamento] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  useEffect(() => {
    setAgendamento(paraCampoDataHora(registro?.agendamento));
  }, [registro]);

  const salvar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (!id) return;

    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await acoesApi.atualizar(id, {
        agendamento: deCampoDataHora(agendamento),
      });

      navegar("/acoes", {
        state: { mensagem: "Ação atualizada com sucesso." },
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
        title="Editar ação | WhatsApp Manager"
        description="Edição do agendamento da ação"
      />
      <CabecalhoPagina
        titulo="Editar ação"
        trilha={[
          { rotulo: "Ações", caminho: "/acoes" },
          { rotulo: registro?.tipo?.nome ?? "Editar" },
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

          <div className="max-w-md">
            <CampoDataHora
              id="agendamento"
              label="Agendamento"
              valor={agendamento}
              aoAlterar={setAgendamento}
              dica="Deixe em branco para remover o agendamento."
              erro={erros.agendamento?.[0]}
            />
          </div>

          {/* Contexto da ação: criado pelo sistema, não é editável. */}
          <dl className="mt-6 border-t border-gray-100 pt-2 dark:border-gray-800">
            <ItemDetalhe rotulo="Tipo de ação">
              {ouTraco(registro.tipo?.nome)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Tipo de grupo">
              {ouTraco(registro.grupo_tipo?.nome)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Grupo">
              {ouTraco(registro.grupo?.nome)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Data de criação">
              {formatarDataHora(registro.created_at)}
            </ItemDetalhe>
            <ItemDetalhe rotulo="Payload">
              <pre className="custom-scrollbar mt-1 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-theme-xs text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
                {JSON.stringify(registro.payload ?? {}, null, 2)}
              </pre>
            </ItemDetalhe>
          </dl>

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
              onClick={() => navegar("/acoes")}
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
