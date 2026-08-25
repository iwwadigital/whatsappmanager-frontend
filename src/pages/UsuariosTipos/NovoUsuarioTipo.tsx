import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioUsuarioTipo from "../../components/usuarios-tipos/FormularioUsuarioTipo";
import { usuariosTiposApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosUsuarioTipo } from "../../types/modelos";

export default function NovoUsuarioTipo() {
  const navegar = useNavigate();
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async (dados: DadosUsuarioTipo) => {
    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await usuariosTiposApi.criar(dados);

      navegar("/usuarios-tipos", {
        state: { mensagem: "Tipo de usuário cadastrado com sucesso." },
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
        title="Novo tipo de usuário | WhatsApp Manager"
        description="Cadastro de tipo de usuário"
      />
      <CabecalhoPagina
        titulo="Novo tipo de usuário"
        trilha={[
          { rotulo: "Tipos de usuário", caminho: "/usuarios-tipos" },
          { rotulo: "Novo" },
        ]}
      />

      <FormularioUsuarioTipo
        salvando={salvando}
        erros={erros}
        erroGeral={erroGeral}
        aoEnviar={salvar}
        aoCancelar={() => navegar("/usuarios-tipos")}
      />
    </div>
  );
}
