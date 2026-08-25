import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioUsuario from "../../components/usuarios/FormularioUsuario";
import { usuariosApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosUsuario } from "../../types/modelos";

export default function NovoUsuario() {
  const navegar = useNavigate();
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async (dados: DadosUsuario) => {
    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await usuariosApi.criar(dados);

      navegar("/usuarios", {
        state: { mensagem: "Usuário cadastrado com sucesso." },
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
        title="Novo usuário | WhatsApp Manager"
        description="Cadastro de usuário"
      />
      <CabecalhoPagina
        titulo="Novo usuário"
        trilha={[
          { rotulo: "Usuários", caminho: "/usuarios" },
          { rotulo: "Novo" },
        ]}
      />

      <FormularioUsuario
        salvando={salvando}
        erros={erros}
        erroGeral={erroGeral}
        aoEnviar={salvar}
        aoCancelar={() => navegar("/usuarios")}
      />
    </div>
  );
}
