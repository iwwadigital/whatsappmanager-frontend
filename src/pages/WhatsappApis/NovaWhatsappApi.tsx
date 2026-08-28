import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioWhatsappApi from "../../components/whatsappApis/FormularioWhatsappApi";
import { whatsappApisApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosWhatsappApi } from "../../types/modelos";

export default function NovaWhatsappApi() {
  const navegar = useNavigate();
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async (dados: DadosWhatsappApi) => {
    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await whatsappApisApi.criar(dados);

      navegar("/whatsapp-apis", {
        state: { mensagem: "API cadastrada com sucesso." },
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
        title="Nova API de WhatsApp | WhatsApp Manager"
        description="Cadastro de API de WhatsApp"
      />
      <CabecalhoPagina
        titulo="Nova API"
        trilha={[
          { rotulo: "APIs de WhatsApp", caminho: "/whatsapp-apis" },
          { rotulo: "Nova" },
        ]}
      />

      <FormularioWhatsappApi
        salvando={salvando}
        erros={erros}
        erroGeral={erroGeral}
        aoEnviar={salvar}
        aoCancelar={() => navegar("/whatsapp-apis")}
      />
    </div>
  );
}
