import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioAcaoTipo from "../../components/acoesTipos/FormularioAcaoTipo";
import { acoesTiposApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosAcaoTipo } from "../../types/modelos";

export default function NovoAcaoTipo() {
  const navegar = useNavigate();
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async (dados: DadosAcaoTipo) => {
    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await acoesTiposApi.criar(dados);

      navegar("/acoes-tipos", {
        state: { mensagem: "Tipo de ação cadastrado com sucesso." },
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
        title="Novo tipo de ação | WhatsApp Manager"
        description="Cadastro de tipo de ação"
      />
      <CabecalhoPagina
        titulo="Novo tipo de ação"
        trilha={[
          { rotulo: "Tipos de ação", caminho: "/acoes-tipos" },
          { rotulo: "Novo" },
        ]}
      />

      <FormularioAcaoTipo
        salvando={salvando}
        erros={erros}
        erroGeral={erroGeral}
        aoEnviar={salvar}
        aoCancelar={() => navegar("/acoes-tipos")}
      />
    </div>
  );
}
