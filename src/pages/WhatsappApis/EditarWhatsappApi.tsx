import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioWhatsappApi from "../../components/whatsappApis/FormularioWhatsappApi";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useRegistro } from "../../hooks/useRegistro";
import { whatsappApisApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosWhatsappApi, WhatsappApi } from "../../types/modelos";

export default function EditarWhatsappApi() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { registro, carregando, erro } = useRegistro<WhatsappApi>(
    whatsappApisApi.mostrar,
    id,
  );

  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async (dados: DadosWhatsappApi) => {
    if (!id) return;

    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await whatsappApisApi.atualizar(id, dados);

      navegar("/whatsapp-apis", {
        state: { mensagem: "API atualizada com sucesso." },
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
        title="Editar API de WhatsApp | WhatsApp Manager"
        description="Edição de API de WhatsApp"
      />
      <CabecalhoPagina
        titulo="Editar API"
        trilha={[
          { rotulo: "APIs de WhatsApp", caminho: "/whatsapp-apis" },
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
        <FormularioWhatsappApi
          registro={registro}
          salvando={salvando}
          erros={erros}
          erroGeral={erroGeral}
          aoEnviar={salvar}
          aoCancelar={() => navegar("/whatsapp-apis")}
        />
      )}
    </div>
  );
}
