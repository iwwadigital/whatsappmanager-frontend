import { useEffect, useState, type FormEvent } from "react";
import CampoTexto from "../campos/CampoTexto";
import CampoSelecaoMultipla, {
  type ItemSelecao,
} from "../campos/CampoSelecaoMultipla";
import Carregador from "../campos/Carregador";
import Button from "../ui/button/Button";
import { MensagemErro } from "../crud/EstadosLista";
import { permissoesApi } from "../../services/api";
import { carregarTodos } from "../../services/carregarTodos";
import { mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosUsuarioTipo, UsuarioTipo } from "../../types/modelos";

interface FormularioUsuarioTipoProps {
  registro?: UsuarioTipo | null;
  salvando: boolean;
  erros: ErrosValidacao;
  erroGeral?: string | null;
  aoEnviar: (dados: DadosUsuarioTipo) => void;
  aoCancelar: () => void;
}

export default function FormularioUsuarioTipo({
  registro,
  salvando,
  erros,
  erroGeral,
  aoEnviar,
  aoCancelar,
}: FormularioUsuarioTipoProps) {
  const [nome, setNome] = useState("");
  const [selecionadas, setSelecionadas] = useState<number[]>([]);
  const [permissoes, setPermissoes] = useState<ItemSelecao[]>([]);
  const [carregandoPermissoes, setCarregandoPermissoes] = useState(true);
  const [avisoPermissoes, setAvisoPermissoes] = useState<string | null>(null);

  useEffect(() => {
    setNome(registro?.nome ?? "");
    setSelecionadas((registro?.permissoes ?? []).map((item) => item.id));
  }, [registro]);

  useEffect(() => {
    let ativo = true;

    carregarTodos(permissoesApi.listar)
      .then((itens) => {
        if (!ativo) return;

        setPermissoes(
          itens.map((item) => ({
            valor: item.id,
            rotulo: item.nome,
            descricao: item.permissao,
          })),
        );
      })
      .catch((falha) => {
        if (ativo) setAvisoPermissoes(mensagemDoErro(falha));
      })
      .finally(() => {
        if (ativo) setCarregandoPermissoes(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    aoEnviar({ nome, permissoes: selecionadas });
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
          placeholder="Ex.: Administrador"
          erro={erros.nome?.[0]}
        />

        <div className="sm:col-span-2">
          <CampoSelecaoMultipla
            id="permissoes"
            label="Permissões"
            itens={permissoes}
            valores={selecionadas}
            carregando={carregandoPermissoes}
            aoAlterar={setSelecionadas}
            erro={erros.permissoes?.[0] ?? avisoPermissoes ?? undefined}
            dica="Os usuários deste tipo herdam as permissões marcadas."
            mensagemVazia="Nenhuma permissão cadastrada."
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
