import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router";
import CampoSelect from "../campos/CampoSelect";
import CampoTexto from "../campos/CampoTexto";
import Carregador from "../campos/Carregador";
import Button from "../ui/button/Button";
import { MensagemErro } from "../crud/EstadosLista";
import type { ErrosValidacao } from "../../types/api";
import type { DadosEmpresa, Empresa } from "../../types/modelos";
import { normalizarHorario, opcoesHorarioAlertas } from "../../utils/horarios";

/** Mesmos padrões da tabela "empresas". */
const PADRAO_QUANTIDADE_MAX_ADMIN = "50";
const PADRAO_HORARIO_ALERTAS = "20:00";
const PADRAO_CONVITE_DIAS = "1";

interface FormularioEmpresaProps {
  /** Registro em edição; ausente no cadastro. */
  registro?: Empresa | null;
  salvando: boolean;
  erros: ErrosValidacao;
  erroGeral?: string | null;
  aoEnviar: (dados: DadosEmpresa) => void;
  aoCancelar: () => void;
}

/** Formulário compartilhado pelas telas de cadastro e edição de empresa. */
export default function FormularioEmpresa({
  registro,
  salvando,
  erros,
  erroGeral,
  aoEnviar,
  aoCancelar,
}: FormularioEmpresaProps) {
  const [nome, setNome] = useState("");
  const [quantidadeMaxAdmin, setQuantidadeMaxAdmin] = useState(
    PADRAO_QUANTIDADE_MAX_ADMIN,
  );
  const [horarioAlertas, setHorarioAlertas] = useState(PADRAO_HORARIO_ALERTAS);
  const [conviteDias, setConviteDias] = useState(PADRAO_CONVITE_DIAS);

  const horarios = useMemo(() => opcoesHorarioAlertas(), []);

  useEffect(() => {
    setNome(registro?.nome ?? "");
    setQuantidadeMaxAdmin(
      registro
        ? String(registro.quantidade_max_admin_por_grupo)
        : PADRAO_QUANTIDADE_MAX_ADMIN,
    );
    setHorarioAlertas(
      normalizarHorario(registro?.horario_alertas_do_dia) ||
        PADRAO_HORARIO_ALERTAS,
    );
    setConviteDias(
      registro
        ? String(registro.convite_quantidade_dias_atualizacao)
        : PADRAO_CONVITE_DIAS,
    );
  }, [registro]);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    aoEnviar({
      nome,
      quantidade_max_admin_por_grupo: Number(quantidadeMaxAdmin),
      horario_alertas_do_dia: horarioAlertas,
      convite_quantidade_dias_atualizacao: Number(conviteDias),
      // Os campos personalizados têm tela própria: mandá-los daqui
      // sobrescreveria a configuração com o que este formulário não edita.
      cadastros_campos_personalizados:
        registro?.cadastros_campos_personalizados ?? null,
    });
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <CampoTexto
          id="nome"
          label="Nome"
          obrigatorio
          valor={nome}
          aoAlterar={setNome}
          placeholder="Nome da empresa"
          erro={erros.nome?.[0]}
        />

        <CampoSelect
          id="horario_alertas_do_dia"
          label="Horário dos alertas do dia"
          obrigatorio
          valor={horarioAlertas}
          aoAlterar={setHorarioAlertas}
          opcoes={horarios}
          placeholder="Selecione o horário"
          dica="De 18:00 até 23:30, de 30 em 30 minutos."
          erro={erros.horario_alertas_do_dia?.[0]}
        />

        <CampoTexto
          id="quantidade_max_admin_por_grupo"
          label="Máximo de administradores por grupo"
          tipo="number"
          obrigatorio
          valor={quantidadeMaxAdmin}
          aoAlterar={setQuantidadeMaxAdmin}
          placeholder="50"
          dica="Entre 1 e 1000 administradores."
          erro={erros.quantidade_max_admin_por_grupo?.[0]}
        />

        <CampoTexto
          id="convite_quantidade_dias_atualizacao"
          label="Dias para atualização do convite"
          tipo="number"
          obrigatorio
          valor={conviteDias}
          aoAlterar={setConviteDias}
          placeholder="1"
          dica="Intervalo, em dias, entre as atualizações do link de convite."
          erro={erros.convite_quantidade_dias_atualizacao?.[0]}
        />

        {/* O construtor tem tela própria: são grupos por tipo de cadastro,
            campos dentro de cada grupo e, num repetidor, campos dentro de
            campos. Só aparece na edição, quando a empresa já tem id. */}
        {registro && (
          <div className="sm:col-span-2 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <p className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90">
              Campos personalizados de cadastro
            </p>
            <p className="mb-3 text-theme-xs text-gray-500 dark:text-gray-400">
              Os campos extras que cada tipo de cadastro recebe.
            </p>
            <Link
              to={`/empresas/${registro.id}/campos-personalizados`}
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Configurar campos personalizados
            </Link>
          </div>
        )}
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
