import { useCallback, useEffect, useState, type FormEvent } from "react";
import CampoAlternador from "../campos/CampoAlternador";
import CampoAutocomplete from "../campos/CampoAutocomplete";
import CampoTelefone, {
  DDI_PADRAO,
  formatarTelefoneInternacional,
} from "../campos/CampoTelefone";
import CampoTexto from "../campos/CampoTexto";
import Carregador from "../campos/Carregador";
import Button from "../ui/button/Button";
import { MensagemErro } from "../crud/EstadosLista";
import { whatsappApisApi } from "../../services/api";
import type { ErrosValidacao } from "../../types/api";
import type {
  DadosWhatsappConta,
  WhatsappApi,
  WhatsappConta,
} from "../../types/modelos";
import { numeroValido, somenteDigitos } from "../../utils/formato";

/** Cadastro novo já começa com o DDI do Brasil. */
const NUMERO_INICIAL = formatarTelefoneInternacional(DDI_PADRAO);

interface FormularioWhatsappContaProps {
  /** Registro em edição; ausente no cadastro. */
  registro?: WhatsappConta | null;
  salvando: boolean;
  erros: ErrosValidacao;
  erroGeral?: string | null;
  aoEnviar: (dados: DadosWhatsappConta) => void;
  aoCancelar: () => void;
}

/** Formulário compartilhado pelas telas de cadastro e edição de conta. */
export default function FormularioWhatsappConta({
  registro,
  salvando,
  erros,
  erroGeral,
  aoEnviar,
  aoCancelar,
}: FormularioWhatsappContaProps) {
  const [whatsappApiId, setWhatsappApiId] = useState<number | null>(null);
  const [numero, setNumero] = useState(NUMERO_INICIAL);
  const [nome, setNome] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState(true);
  // Validação do telefone no cliente, antes de chamar a API.
  const [erroNumero, setErroNumero] = useState<string | null>(null);

  useEffect(() => {
    setWhatsappApiId(registro?.whatsapp_api_id ?? null);
    setNumero(
      registro ? formatarTelefoneInternacional(registro.numero) : NUMERO_INICIAL,
    );
    setNome(registro?.nome ?? "");
    setToken(registro?.token ?? "");
    setStatus(registro?.status ?? true);
    setErroNumero(null);
  }, [registro]);

  const buscarApis = useCallback(async (termo: string) => {
    const resultado = await whatsappApisApi.listar({
      nome: termo,
      por_pagina: 20,
    });

    return resultado.itens;
  }, []);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (!numeroValido(numero)) {
      setErroNumero("Informe um número de telefone válido, com DDI e DDD.");

      return;
    }

    setErroNumero(null);

    aoEnviar({
      whatsapp_api_id: whatsappApiId ?? 0,
      // O número é gravado sem máscara.
      numero: somenteDigitos(numero),
      nome: nome.trim(),
      token: token.trim(),
      status,
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
        <CampoAutocomplete<WhatsappApi>
          id="whatsapp_api_id"
          label="API"
          obrigatorio
          valor={whatsappApiId}
          rotuloSelecionado={registro?.whatsapp_api?.nome}
          aoSelecionar={(api) => setWhatsappApiId(api?.id ?? null)}
          buscar={buscarApis}
          obterValor={(api) => api.id}
          obterRotulo={(api) => api.nome}
          obterDescricao={(api) => api.url}
          placeholder="Busque pelo nome da API"
          erro={erros.whatsapp_api_id?.[0]}
        />

        <CampoTexto
          id="nome"
          label="Nome"
          obrigatorio
          valor={nome}
          aoAlterar={setNome}
          placeholder="Como esta conta é chamada internamente"
          erro={erros.nome?.[0]}
        />

        <CampoTelefone
          id="numero"
          label="Número"
          obrigatorio
          internacional
          valor={numero}
          aoAlterar={(valor) => {
            setNumero(valor);
            setErroNumero(null);
          }}
          dica="Com DDI: +55 para o Brasil. É gravado só com dígitos."
          erro={erroNumero ?? erros.numero?.[0]}
        />

        <CampoTexto
          id="token"
          label="Token"
          obrigatorio
          valor={token}
          aoAlterar={setToken}
          placeholder="Token da conta na API"
          dica="É com ele que o sistema se autentica na API."
          erro={erros.token?.[0]}
        />

        <CampoAlternador
          id="status"
          label="Status"
          descricao={status ? "Ativa" : "Inativa"}
          valor={status}
          aoAlterar={setStatus}
          erro={erros.status?.[0]}
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
