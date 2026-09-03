import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioCadastroTipo from "../../components/cadastrosTipos/FormularioCadastroTipo";
import { cadastrosTiposApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosCadastroTipo } from "../../types/modelos";

export default function NovoCadastroTipo() {
  const navegar = useNavigate();
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async (dados: DadosCadastroTipo) => {
    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await cadastrosTiposApi.criar(dados);

      navegar("/cadastros-tipos", {
        state: { mensagem: "Tipo de cadastro cadastrado com sucesso." },
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
        title="Novo tipo de cadastro | WhatsApp Manager"
        description="Cadastro de tipo de cadastro"
      />
      <CabecalhoPagina
        titulo="Novo tipo de cadastro"
        trilha={[
          { rotulo: "Tipos de cadastro", caminho: "/cadastros-tipos" },
          { rotulo: "Novo" },
        ]}
      />

      <FormularioCadastroTipo
        salvando={salvando}
        erros={erros}
        erroGeral={erroGeral}
        aoEnviar={salvar}
        aoCancelar={() => navegar("/cadastros-tipos")}
      />
    </div>
  );
}
