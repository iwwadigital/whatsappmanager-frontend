import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioWhatsappConta from "../../components/whatsappContas/FormularioWhatsappConta";
import { whatsappContasApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosWhatsappConta } from "../../types/modelos";

export default function NovaWhatsappConta() {
  const navegar = useNavigate();
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async (dados: DadosWhatsappConta) => {
    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await whatsappContasApi.criar(dados);

      navegar("/whatsapp-contas", {
        state: { mensagem: "Conta cadastrada com sucesso." },
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
        title="Nova conta de WhatsApp | WhatsApp Manager"
        description="Cadastro de conta de WhatsApp"
      />
      <CabecalhoPagina
        titulo="Nova conta"
        trilha={[
          { rotulo: "Contas de WhatsApp", caminho: "/whatsapp-contas" },
          { rotulo: "Nova" },
        ]}
      />

      <FormularioWhatsappConta
        salvando={salvando}
        erros={erros}
        erroGeral={erroGeral}
        aoEnviar={salvar}
        aoCancelar={() => navegar("/whatsapp-contas")}
      />
    </div>
  );
}
