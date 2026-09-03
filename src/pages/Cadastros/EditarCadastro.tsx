import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioCadastro, {
  type EnvioCadastro,
} from "../../components/cadastros/FormularioCadastro";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useRegistro } from "../../hooks/useRegistro";
import {
  cadastrosApi,
  enviarArquivoDoCampo,
  removerArquivoDoCampo,
} from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { Cadastro } from "../../types/modelos";

export default function EditarCadastro() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { registro, carregando, erro, recarregar } = useRegistro<Cadastro>(
    cadastrosApi.mostrar,
    id,
  );

  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async ({ dados, arquivos }: EnvioCadastro) => {
    if (!id) return;

    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await cadastrosApi.atualizar(id, dados);

      const pendentes = Object.entries(arquivos).filter(([, arquivo]) => arquivo);

      for (const [caminho, arquivo] of pendentes) {
        await enviarArquivoDoCampo(id, caminho, arquivo as File);
      }

      navegar("/cadastros", {
        state: { mensagem: "Cadastro atualizado com sucesso." },
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

  /** Remove um arquivo já gravado e recarrega o registro. */
  const removerArquivo = async (caminho: string) => {
    if (!id) return;

    setErroGeral(null);

    try {
      await removerArquivoDoCampo(id, caminho);
      await recarregar();
    } catch (falha) {
      setErroGeral(mensagemDoErro(falha));
    }
  };

  return (
    <div>
      <PageMeta
        title="Editar cadastro | WhatsApp Manager"
        description="Edição de cadastro"
      />
      <CabecalhoPagina
        titulo="Editar cadastro"
        trilha={[
          { rotulo: "Cadastros", caminho: "/cadastros" },
          { rotulo: registro?.nome ?? "Editar" },
        ]}
      />

      {carregando && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <EstadoCarregando />
        </div>
      )}

      {!carregando && erro && <MensagemErro mensagem={erro} />}

      {!carregando && registro && (
        <FormularioCadastro
          registro={registro}
          salvando={salvando}
          erros={erros}
          erroGeral={erroGeral}
          aoEnviar={salvar}
          aoRemoverArquivo={removerArquivo}
          aoCancelar={() => navegar("/cadastros")}
        />
      )}
    </div>
  );
}
