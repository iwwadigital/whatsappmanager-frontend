import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioCadastro, {
  type EnvioCadastro,
} from "../../components/cadastros/FormularioCadastro";
import { cadastrosApi, enviarArquivoDoCampo } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";

export default function NovoCadastro() {
  const navegar = useNavigate();
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async ({ dados, arquivos }: EnvioCadastro) => {
    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      const criado = await cadastrosApi.criar(dados);

      // Os arquivos só podem subir depois: o caminho no disco usa o id.
      const pendentes = Object.entries(arquivos).filter(([, arquivo]) => arquivo);

      for (const [caminho, arquivo] of pendentes) {
        await enviarArquivoDoCampo(criado.id, caminho, arquivo as File);
      }

      navegar("/cadastros", {
        state: { mensagem: "Cadastro cadastrado com sucesso." },
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
        title="Novo cadastro | WhatsApp Manager"
        description="Cadastro de registro"
      />
      <CabecalhoPagina
        titulo="Novo cadastro"
        trilha={[
          { rotulo: "Cadastros", caminho: "/cadastros" },
          { rotulo: "Novo" },
        ]}
      />

      <FormularioCadastro
        salvando={salvando}
        erros={erros}
        erroGeral={erroGeral}
        aoEnviar={salvar}
        aoCancelar={() => navegar("/cadastros")}
      />
    </div>
  );
}
