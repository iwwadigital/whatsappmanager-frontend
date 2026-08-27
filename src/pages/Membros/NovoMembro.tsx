import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioMembro from "../../components/membros/FormularioMembro";
import { membrosApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosMembro } from "../../types/modelos";

export default function NovoMembro() {
  const navegar = useNavigate();
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async (dados: DadosMembro) => {
    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await membrosApi.criar(dados);

      navegar("/membros", {
        state: { mensagem: "Membro cadastrado com sucesso." },
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
        title="Novo membro | WhatsApp Manager"
        description="Cadastro de membro"
      />
      <CabecalhoPagina
        titulo="Novo membro"
        trilha={[{ rotulo: "Membros", caminho: "/membros" }, { rotulo: "Novo" }]}
      />

      <FormularioMembro
        salvando={salvando}
        erros={erros}
        erroGeral={erroGeral}
        aoEnviar={salvar}
        aoCancelar={() => navegar("/membros")}
      />
    </div>
  );
}
