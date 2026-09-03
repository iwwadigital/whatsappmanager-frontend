import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioCadastroTipo from "../../components/cadastrosTipos/FormularioCadastroTipo";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useRegistro } from "../../hooks/useRegistro";
import { cadastrosTiposApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { CadastroTipo, DadosCadastroTipo } from "../../types/modelos";

export default function EditarCadastroTipo() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { registro, carregando, erro } = useRegistro<CadastroTipo>(
    cadastrosTiposApi.mostrar,
    id,
  );

  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async (dados: DadosCadastroTipo) => {
    if (!id) return;

    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await cadastrosTiposApi.atualizar(id, dados);

      navegar("/cadastros-tipos", {
        state: { mensagem: "Tipo de cadastro atualizado com sucesso." },
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
        title="Editar tipo de cadastro | WhatsApp Manager"
        description="Edição de tipo de cadastro"
      />
      <CabecalhoPagina
        titulo="Editar tipo de cadastro"
        trilha={[
          { rotulo: "Tipos de cadastro", caminho: "/cadastros-tipos" },
          { rotulo: registro?.nome ?? "Editar" },
        ]}
      />

      {carregando && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <EstadoCarregando />
        </div>
      )}

      {!carregando && erro && <MensagemErro mensagem={erro} />}

      {!carregando && registro && (
        <FormularioCadastroTipo
          registro={registro}
          salvando={salvando}
          erros={erros}
          erroGeral={erroGeral}
          aoEnviar={salvar}
          aoCancelar={() => navegar("/cadastros-tipos")}
        />
      )}
    </div>
  );
}
