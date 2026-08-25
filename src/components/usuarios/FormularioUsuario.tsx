import { useCallback, useEffect, useState, type FormEvent } from "react";
import CampoAlternador from "../campos/CampoAlternador";
import CampoAutocomplete from "../campos/CampoAutocomplete";
import CampoSenha from "../campos/CampoSenha";
import CampoTelefone, { formatarTelefone } from "../campos/CampoTelefone";
import CampoTexto from "../campos/CampoTexto";
import Carregador from "../campos/Carregador";
import Button from "../ui/button/Button";
import { MensagemErro } from "../crud/EstadosLista";
import { empresasApi, usuariosTiposApi } from "../../services/api";
import type { ErrosValidacao } from "../../types/api";
import type {
  DadosUsuario,
  Empresa,
  Usuario,
  UsuarioTipo,
} from "../../types/modelos";

interface FormularioUsuarioProps {
  registro?: Usuario | null;
  salvando: boolean;
  erros: ErrosValidacao;
  erroGeral?: string | null;
  aoEnviar: (dados: DadosUsuario) => void;
  aoCancelar: () => void;
}

export default function FormularioUsuario({
  registro,
  salvando,
  erros,
  erroGeral,
  aoEnviar,
  aoCancelar,
}: FormularioUsuarioProps) {
  const edicao = Boolean(registro);

  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [empresaRotulo, setEmpresaRotulo] = useState("");
  const [tipoId, setTipoId] = useState<number | null>(null);
  const [tipoRotulo, setTipoRotulo] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState(true);

  useEffect(() => {
    setEmpresaId(registro?.empresa_id ?? null);
    setEmpresaRotulo(registro?.empresa?.nome ?? "");
    setTipoId(registro?.usuario_tipo_id ?? null);
    setTipoRotulo(registro?.tipo?.nome ?? "");
    setNome(registro?.nome ?? "");
    setEmail(registro?.email ?? "");
    setTelefone(formatarTelefone(registro?.telefone ?? ""));
    setStatus(registro?.status ?? true);
    setSenha("");
  }, [registro]);

  const buscarEmpresas = useCallback(async (termo: string) => {
    const resultado = await empresasApi.listar({
      nome: termo,
      por_pagina: 10,
    });

    return resultado.itens;
  }, []);

  const buscarTipos = useCallback(async (termo: string) => {
    const resultado = await usuariosTiposApi.listar({
      nome: termo,
      por_pagina: 10,
    });

    return resultado.itens;
  }, []);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    const dados: DadosUsuario = {
      empresa_id: empresaId,
      usuario_tipo_id: tipoId,
      nome,
      email,
      telefone: telefone.trim() === "" ? null : telefone,
      status,
    };

    // Senha em branco na edição significa "manter a senha atual".
    if (!edicao || senha.trim() !== "") {
      dados.senha = senha;
    }

    aoEnviar(dados);
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
          placeholder="Nome completo"
          erro={erros.nome?.[0]}
        />

        <CampoTexto
          id="email"
          label="E-mail"
          tipo="email"
          obrigatorio
          valor={email}
          aoAlterar={setEmail}
          placeholder="usuario@empresa.com.br"
          erro={erros.email?.[0]}
        />

        <CampoAutocomplete<UsuarioTipo>
          id="usuario_tipo_id"
          label="Tipo de usuário"
          obrigatorio
          valor={tipoId}
          rotuloSelecionado={tipoRotulo}
          buscar={buscarTipos}
          obterValor={(item) => item.id}
          obterRotulo={(item) => item.nome}
          aoSelecionar={(item) => setTipoId(item ? item.id : null)}
          erro={erros.usuario_tipo_id?.[0]}
        />

        <CampoAutocomplete<Empresa>
          id="empresa_id"
          label="Empresa"
          valor={empresaId}
          rotuloSelecionado={empresaRotulo}
          buscar={buscarEmpresas}
          obterValor={(item) => item.id}
          obterRotulo={(item) => item.nome}
          aoSelecionar={(item) => setEmpresaId(item ? item.id : null)}
          dica="Opcional: deixe em branco para usuários sem empresa."
          erro={erros.empresa_id?.[0]}
        />

        <CampoSenha
          id="senha"
          label="Senha"
          obrigatorio={!edicao}
          valor={senha}
          aoAlterar={setSenha}
          dica={
            edicao
              ? "Deixe em branco para manter a senha atual."
              : "Mínimo de 8 caracteres, com letras e números."
          }
          erro={erros.senha?.[0]}
        />

        <CampoTelefone
          id="telefone"
          label="Telefone"
          valor={telefone}
          aoAlterar={setTelefone}
          erro={erros.telefone?.[0]}
        />

        <CampoAlternador
          id="status"
          label="Status"
          descricao={status ? "Ativo" : "Inativo"}
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
