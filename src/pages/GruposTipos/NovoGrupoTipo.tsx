import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioGrupoTipo from "../../components/gruposTipos/FormularioGrupoTipo";
import { gruposTiposApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosGrupoTipo, GrupoTipo } from "../../types/modelos";

export default function NovoGrupoTipo() {
  const navegar = useNavigate();
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [imagem, setImagem] = useState<File | null>(null);

  /**
   * A imagem só pode ser enviada depois que o tipo existe (o caminho no disco
   * usa o id). Se o upload falhar, o registro já está criado: guardamos ele
   * para a próxima tentativa virar uma edição, e não um segundo cadastro.
   */
  const [criado, setCriado] = useState<GrupoTipo | null>(null);

  const salvar = async (dados: DadosGrupoTipo) => {
    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      const tipo = criado
        ? await gruposTiposApi.atualizar(criado.id, dados)
        : await gruposTiposApi.criar(dados);

      setCriado(tipo);

      if (imagem) {
        await gruposTiposApi.enviarImagem(tipo.id, imagem);
      }

      navegar("/grupos-tipos", {
        state: { mensagem: "Tipo de grupo cadastrado com sucesso." },
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
        title="Novo tipo de grupo | WhatsApp Manager"
        description="Cadastro de tipo de grupo"
      />
      <CabecalhoPagina
        titulo="Novo tipo de grupo"
        trilha={[
          { rotulo: "Tipos de grupo", caminho: "/grupos-tipos" },
          { rotulo: "Novo" },
        ]}
      />

      <FormularioGrupoTipo
        registro={criado}
        salvando={salvando}
        erros={erros}
        erroGeral={
          criado && erroGeral
            ? `O tipo de grupo foi cadastrado, mas houve uma falha: ${erroGeral}`
            : erroGeral
        }
        imagem={imagem}
        aoSelecionarImagem={setImagem}
        aoEnviar={salvar}
        aoCancelar={() => navegar("/grupos-tipos")}
      />
    </div>
  );
}
