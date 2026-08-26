import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioGrupo from "../../components/grupos/FormularioGrupo";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useRegistro } from "../../hooks/useRegistro";
import { gruposApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosGrupo, Grupo } from "../../types/modelos";

export default function EditarGrupo() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { registro, carregando, erro, recarregar } = useRegistro<Grupo>(
    gruposApi.mostrar,
    id,
  );

  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [imagem, setImagem] = useState<File | null>(null);
  const [removendoImagem, setRemovendoImagem] = useState(false);

  const salvar = async (dados: DadosGrupo) => {
    if (!id) return;

    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await gruposApi.atualizar(id, dados);

      if (imagem) {
        await gruposApi.enviarImagem(id, imagem);
      }

      navegar("/grupos", {
        state: { mensagem: "Grupo atualizado com sucesso." },
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
      await gruposApi.removerImagem(id);
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
        title="Editar grupo | WhatsApp Manager"
        description="Edição de grupo"
      />
      <CabecalhoPagina
        titulo="Editar grupo"
        trilha={[
          { rotulo: "Grupos", caminho: "/grupos" },
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
        <FormularioGrupo
          registro={registro}
          salvando={salvando}
          erros={erros}
          erroGeral={erroGeral}
          imagem={imagem}
          aoSelecionarImagem={setImagem}
          aoRemoverImagem={removerImagem}
          removendoImagem={removendoImagem}
          aoEnviar={salvar}
          aoCancelar={() => navegar("/grupos")}
        />
      )}
    </div>
  );
}
