import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioEmpresa from "../../components/empresas/FormularioEmpresa";
import { empresasApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosEmpresa } from "../../types/modelos";

export default function NovaEmpresa() {
  const navegar = useNavigate();
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async (dados: DadosEmpresa) => {
    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await empresasApi.criar(dados);

      navegar("/empresas", {
        state: { mensagem: "Empresa cadastrada com sucesso." },
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
        title="Nova empresa | WhatsApp Manager"
        description="Cadastro de empresa"
      />
      <CabecalhoPagina
        titulo="Nova empresa"
        trilha={[
          { rotulo: "Empresas", caminho: "/empresas" },
          { rotulo: "Nova" },
        ]}
      />

      <FormularioEmpresa
        salvando={salvando}
        erros={erros}
        erroGeral={erroGeral}
        aoEnviar={salvar}
        aoCancelar={() => navegar("/empresas")}
      />
    </div>
  );
}
