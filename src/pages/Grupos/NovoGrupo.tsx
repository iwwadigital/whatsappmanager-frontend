import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioGrupo from "../../components/grupos/FormularioGrupo";
import { gruposApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { DadosGrupo, Grupo } from "../../types/modelos";

export default function NovoGrupo() {
  const navegar = useNavigate();
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [imagem, setImagem] = useState<File | null>(null);

  /**
   * A imagem só pode ser enviada depois que o grupo existe (o caminho no
   * disco usa o id). Se o upload falhar, o grupo já está criado: guardamos
   * o registro para a próxima tentativa virar uma edição, e não um segundo
   * cadastro com o mesmo nome.
   */
  const [criado, setCriado] = useState<Grupo | null>(null);

  const salvar = async (dados: DadosGrupo) => {
    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      const grupo = criado
        ? await gruposApi.atualizar(criado.id, dados)
        : await gruposApi.criar(dados);

      setCriado(grupo);

      if (imagem) {
        await gruposApi.enviarImagem(grupo.id, imagem);
      }

      navegar("/grupos", {
        state: { mensagem: "Grupo cadastrado com sucesso." },
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
        title="Novo grupo | WhatsApp Manager"
        description="Cadastro de grupo"
      />
      <CabecalhoPagina
        titulo="Novo grupo"
        trilha={[{ rotulo: "Grupos", caminho: "/grupos" }, { rotulo: "Novo" }]}
      />

      <FormularioGrupo
        registro={criado}
        salvando={salvando}
        erros={erros}
        erroGeral={
          criado && erroGeral
            ? `O grupo foi cadastrado, mas houve uma falha: ${erroGeral}`
            : erroGeral
        }
        imagem={imagem}
        aoSelecionarImagem={setImagem}
        aoEnviar={salvar}
        aoCancelar={() => navegar("/grupos")}
      />
    </div>
  );
}
