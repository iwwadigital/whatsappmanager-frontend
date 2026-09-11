import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioAlerta from "../../components/alertas/FormularioAlerta";
import { alertasApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosAlerta } from "../../types/modelos";

export default function NovoAlerta() {
  const navegar = useNavigate();

  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async (dados: DadosAlerta) => {
    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await alertasApi.criar(dados);

      navegar("/alertas", {
        state: { mensagem: "Alerta cadastrado com sucesso." },
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
        title="Novo alerta | WhatsApp Manager"
        description="Cadastro de alerta de oferta de passagem"
      />
      <CabecalhoPagina
        titulo="Novo alerta"
        trilha={[{ rotulo: "Alertas", caminho: "/alertas" }, { rotulo: "Novo" }]}
      />

      <FormularioAlerta
        salvando={salvando}
        erros={erros}
        erroGeral={erroGeral}
        aoEnviar={salvar}
        aoCancelar={() => navegar("/alertas")}
      />
    </div>
  );
}
