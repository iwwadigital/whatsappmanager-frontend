import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioPermissao from "../../components/permissoes/FormularioPermissao";
import { permissoesApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosPermissao } from "../../types/modelos";

export default function NovaPermissao() {
  const navegar = useNavigate();
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async (dados: DadosPermissao) => {
    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await permissoesApi.criar(dados);

      navegar("/permissoes", {
        state: { mensagem: "Permissão cadastrada com sucesso." },
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
        title="Nova permissão | WhatsApp Manager"
        description="Cadastro de permissão"
      />
      <CabecalhoPagina
        titulo="Nova permissão"
        trilha={[
          { rotulo: "Permissões", caminho: "/permissoes" },
          { rotulo: "Nova" },
        ]}
      />

      <FormularioPermissao
        salvando={salvando}
        erros={erros}
        erroGeral={erroGeral}
        aoEnviar={salvar}
        aoCancelar={() => navegar("/permissoes")}
      />
    </div>
  );
}
