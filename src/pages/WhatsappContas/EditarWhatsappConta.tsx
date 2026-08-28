import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioWhatsappConta from "../../components/whatsappContas/FormularioWhatsappConta";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useRegistro } from "../../hooks/useRegistro";
import { whatsappContasApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosWhatsappConta, WhatsappConta } from "../../types/modelos";

export default function EditarWhatsappConta() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { registro, carregando, erro } = useRegistro<WhatsappConta>(
    whatsappContasApi.mostrar,
    id,
  );

  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async (dados: DadosWhatsappConta) => {
    if (!id) return;

    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await whatsappContasApi.atualizar(id, dados);

      navegar("/whatsapp-contas", {
        state: { mensagem: "Conta atualizada com sucesso." },
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
        title="Editar conta de WhatsApp | WhatsApp Manager"
        description="Edição de conta de WhatsApp"
      />
      <CabecalhoPagina
        titulo="Editar conta"
        trilha={[
          { rotulo: "Contas de WhatsApp", caminho: "/whatsapp-contas" },
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
        <FormularioWhatsappConta
          registro={registro}
          salvando={salvando}
          erros={erros}
          erroGeral={erroGeral}
          aoEnviar={salvar}
          aoCancelar={() => navegar("/whatsapp-contas")}
        />
      )}
    </div>
  );
}
