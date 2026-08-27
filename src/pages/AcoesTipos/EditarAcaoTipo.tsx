import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import CabecalhoPagina from "../../components/crud/CabecalhoPagina";
import FormularioAcaoTipo from "../../components/acoesTipos/FormularioAcaoTipo";
import {
  EstadoCarregando,
  MensagemErro,
} from "../../components/crud/EstadosLista";
import { useRegistro } from "../../hooks/useRegistro";
import { acoesTiposApi } from "../../services/api";
import { ErroApi, mensagemDoErro } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";
import type { AcaoTipo, DadosAcaoTipo } from "../../types/modelos";

export default function EditarAcaoTipo() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { registro, carregando, erro } = useRegistro<AcaoTipo>(
    acoesTiposApi.mostrar,
    id,
  );

  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvar = async (dados: DadosAcaoTipo) => {
    if (!id) return;

    setSalvando(true);
    setErros({});
    setErroGeral(null);

    try {
      await acoesTiposApi.atualizar(id, dados);

      navegar("/acoes-tipos", {
        state: { mensagem: "Tipo de ação atualizado com sucesso." },
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
        title="Editar tipo de ação | WhatsApp Manager"
        description="Edição de tipo de ação"
      />
      <CabecalhoPagina
        titulo="Editar tipo de ação"
        trilha={[
          { rotulo: "Tipos de ação", caminho: "/acoes-tipos" },
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
        <FormularioAcaoTipo
          registro={registro}
          salvando={salvando}
          erros={erros}
          erroGeral={erroGeral}
          aoEnviar={salvar}
          aoCancelar={() => navegar("/acoes-tipos")}
        />
      )}
    </div>
  );
}
