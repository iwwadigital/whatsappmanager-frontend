import { useEffect, useState, type FormEvent } from "react";
import CampoTelefone, { formatarTelefone } from "../campos/CampoTelefone";
import CampoTexto from "../campos/CampoTexto";
import Carregador from "../campos/Carregador";
import Button from "../ui/button/Button";
import { MensagemErro } from "../crud/EstadosLista";
import type { ErrosValidacao } from "../../types/api";
import type { DadosMembro, Membro } from "../../types/modelos";
import { numeroValido, somenteDigitos } from "../../utils/formato";

interface FormularioMembroProps {
  /** Registro em edição; ausente no cadastro. */
  registro?: Membro | null;
  salvando: boolean;
  erros: ErrosValidacao;
  erroGeral?: string | null;
  aoEnviar: (dados: DadosMembro) => void;
  aoCancelar: () => void;
}

/** Formulário compartilhado pelas telas de cadastro e edição de membro. */
export default function FormularioMembro({
  registro,
  salvando,
  erros,
  erroGeral,
  aoEnviar,
  aoCancelar,
}: FormularioMembroProps) {
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [identificador, setIdentificador] = useState("");
  // Validação do telefone no cliente, antes de chamar a API.
  const [erroNumero, setErroNumero] = useState<string | null>(null);

  useEffect(() => {
    setNumero(registro ? formatarTelefone(registro.numero) : "");
    setNome(registro?.nome ?? "");
    setIdentificador(registro?.identificador ?? "");
    setErroNumero(null);
  }, [registro]);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (!numeroValido(numero)) {
      setErroNumero("Informe um número de telefone válido, com DDD.");

      return;
    }

    setErroNumero(null);

    aoEnviar({
      // O número é gravado sem máscara.
      numero: somenteDigitos(numero),
      nome: nome.trim() === "" ? null : nome.trim(),
      identificador:
        identificador.trim() === "" ? null : identificador.trim(),
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
        <CampoTelefone
          id="numero"
          label="Número"
          obrigatorio
          valor={numero}
          aoAlterar={(valor) => {
            setNumero(valor);
            setErroNumero(null);
          }}
          dica="Celular ou fixo com DDD. É gravado sem máscara."
          erro={erroNumero ?? erros.numero?.[0]}
        />

        <CampoTexto
          id="nome"
          label="Nome"
          valor={nome}
          aoAlterar={setNome}
          placeholder="Nome do membro"
          erro={erros.nome?.[0]}
        />

        <CampoTexto
          id="identificador"
          label="Identificador"
          valor={identificador}
          aoAlterar={setIdentificador}
          placeholder="Código interno, matrícula, etc."
          dica="Opcional."
          erro={erros.identificador?.[0]}
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
