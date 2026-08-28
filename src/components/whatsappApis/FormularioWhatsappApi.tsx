import { useEffect, useState, type FormEvent } from "react";
import CampoSelect from "../campos/CampoSelect";
import CampoTexto from "../campos/CampoTexto";
import Carregador from "../campos/Carregador";
import Button from "../ui/button/Button";
import { MensagemErro } from "../crud/EstadosLista";
import { apisDisponiveisApi } from "../../services/api";
import type { ErrosValidacao } from "../../types/api";
import type {
  ApiDisponivel,
  DadosWhatsappApi,
  WhatsappApi,
} from "../../types/modelos";

interface FormularioWhatsappApiProps {
  /** Registro em edição; ausente no cadastro. */
  registro?: WhatsappApi | null;
  salvando: boolean;
  erros: ErrosValidacao;
  erroGeral?: string | null;
  aoEnviar: (dados: DadosWhatsappApi) => void;
  aoCancelar: () => void;
}

/** Formulário compartilhado pelas telas de cadastro e edição de API. */
export default function FormularioWhatsappApi({
  registro,
  salvando,
  erros,
  erroGeral,
  aoEnviar,
  aoCancelar,
}: FormularioWhatsappApiProps) {
  const [nome, setNome] = useState("");
  const [api, setApi] = useState("");
  const [url, setUrl] = useState("");
  const [statusSucesso, setStatusSucesso] = useState("");

  // As opções vêm da API: são as interfaces de conexão que o sistema sabe
  // operar (App\Support\WhatsApp\GerenciadorWhatsApp).
  const [disponiveis, setDisponiveis] = useState<ApiDisponivel[]>([]);

  useEffect(() => {
    let ativo = true;

    void apisDisponiveisApi.listar().then((lista) => {
      if (ativo) setDisponiveis(lista);
    });

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    setNome(registro?.nome ?? "");
    setApi(registro?.api ?? "");
    setUrl(registro?.url ?? "");
    setStatusSucesso(registro?.status_sucesso ?? "");
  }, [registro]);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    aoEnviar({
      nome: nome.trim(),
      api,
      url: url.trim(),
      status_sucesso: statusSucesso.trim() === "" ? null : statusSucesso.trim(),
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
          placeholder="Como esta API é chamada internamente"
          erro={erros.nome?.[0]}
        />

        <CampoSelect
          id="api"
          label="API"
          obrigatorio
          valor={api}
          aoAlterar={setApi}
          opcoes={disponiveis.map((item) => ({
            valor: item.chave,
            rotulo: item.rotulo,
          }))}
          placeholder="Selecione a API"
          dica="Define qual interface de conexão o sistema usa para falar com ela."
          erro={erros.api?.[0]}
        />

        <div className="sm:col-span-2">
          <CampoTexto
            id="url"
            label="URL"
            obrigatorio
            valor={url}
            aoAlterar={setUrl}
            placeholder="https://api.exemplo.com.br"
            dica="Endereço base da API, com http:// ou https://."
            erro={erros.url?.[0]}
          />
        </div>

        <CampoTexto
          id="status_sucesso"
          label="Status de sucesso"
          valor={statusSucesso}
          aoAlterar={setStatusSucesso}
          placeholder="Connected"
          dica="Valor que a API devolve quando a conta está conectada."
          erro={erros.status_sucesso?.[0]}
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
