import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioGrupoTipo from "../../components/gruposTipos/FormularioGrupoTipo";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useRegistro } from "../../hooks/useRegistro";
import { gruposTiposApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosGrupoTipo, GrupoTipo } from "../../types/modelos";

export default function EditarGrupoTipo() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { registro, carregando, erro, recarregar } = useRegistro<GrupoTipo>(
    gruposTiposApi.mostrar,
    id,
  );

  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [imagem, setImagem] = useState<File | null>(null);
  const [removendoImagem, setRemovendoImagem] = useState(false);

  const salvar = async (dados: DadosGrupoTipo) => {
    if (!id) return;

    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await gruposTiposApi.atualizar(id, dados);

      if (imagem) {
        await gruposTiposApi.enviarImagem(id, imagem);
      }

      navegar("/grupos-tipos", {
        state: { mensagem: "Tipo de grupo atualizado com sucesso." },
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

  /** Apaga a imagem atual para liberar o campo para uma nova. */
  const removerImagem = async () => {
    if (!id) return;

    setRemovendoImagem(true);
    setErroGeral(null);

    try {
      await gruposTiposApi.removerImagem(id);
      await recarregar();
    } catch (falha) {
      setErroGeral(mensagemDoErro(falha));
    } finally {
      setRemovendoImagem(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="Editar tipo de grupo | WhatsApp Manager"
        description="Edição de tipo de grupo"
      />
      <CabecalhoPagina
        titulo="Editar tipo de grupo"
        trilha={[
          { rotulo: "Tipos de grupo", caminho: "/grupos-tipos" },
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
        <FormularioGrupoTipo
          registro={registro}
          salvando={salvando}
          erros={erros}
          erroGeral={erroGeral}
          imagem={imagem}
          aoSelecionarImagem={setImagem}
          aoRemoverImagem={removerImagem}
          removendoImagem={removendoImagem}
          aoEnviar={salvar}
          aoCancelar={() => navegar("/grupos-tipos")}
        />
      )}
    </div>
  );
}
