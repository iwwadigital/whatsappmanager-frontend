import { useCallback, useEffect, useState } from "react";
import CampoSelecaoMultipla from "../campos/CampoSelecaoMultipla";
import ModalCadastroRapido from "./ModalCadastroRapido";
import { PlusIcon } from "../../icons";
import { MensagemErro } from "../crud/EstadosLista";
import { buscarTipoPeloSlug, listarCadastrosDoTipo } from "../../services/api";
import { mensagemDoErro } from "../../services/http";
import {
  TIPO_LINK_UTIL,
  TIPO_PONTO_ATENCAO,
  TIPO_RODAPE_GRATIS,
} from "../../utils/alertas";
import type { ErrosValidacao } from "../../types/api";
import type { Cadastro, CadastroTipo } from "../../types/modelos";

interface AbaObservacoesProps {
  pontos: number[];
  links: number[];
  rodapes: number[];
  aoAlterarPontos: (ids: number[]) => void;
  aoAlterarLinks: (ids: number[]) => void;
  aoAlterarRodapes: (ids: number[]) => void;
  erros: ErrosValidacao;
  desabilitado: boolean;
}

/**
 * A aba "Observações e links úteis".
 *
 * Os três campos são o mesmo tipo de coisa — uma relação com cadastros, como o
 * campo de relação do ACF —, e mudam só no slug do tipo que oferecem. Por isso
 * são o mesmo componente três vezes, e não três componentes.
 *
 * Cada um tem abaixo um botão que abre o cadastro rápido daquele tipo: quem
 * está montando um alerta e percebe que falta um ponto de atenção não deveria
 * ter de abandonar o formulário (e perder o que digitou) para criá-lo.
 */
export default function AbaObservacoes({
  pontos,
  links,
  rodapes,
  aoAlterarPontos,
  aoAlterarLinks,
  aoAlterarRodapes,
  erros,
  desabilitado,
}: AbaObservacoesProps) {
  return (
    <div className="space-y-6">
      <CampoDeRelacao
        id="pontos_atencao"
        label="Vale observar"
        slug={TIPO_PONTO_ATENCAO}
        selecionados={pontos}
        aoAlterar={aoAlterarPontos}
        erro={erros.cadastros?.[0]}
        desabilitado={desabilitado}
      />

      <CampoDeRelacao
        id="links_uteis"
        label="Insira link(s) útil(eis)"
        slug={TIPO_LINK_UTIL}
        selecionados={links}
        aoAlterar={aoAlterarLinks}
        desabilitado={desabilitado}
      />

      <CampoDeRelacao
        id="rodapes_gratis"
        label="Mensagem de rodapé para Mundo Grátis"
        slug={TIPO_RODAPE_GRATIS}
        selecionados={rodapes}
        aoAlterar={aoAlterarRodapes}
        desabilitado={desabilitado}
      />
    </div>
  );
}

interface CampoDeRelacaoProps {
  id: string;
  label: string;
  /** O slug do tipo de cadastro que este campo oferece. */
  slug: string;
  selecionados: number[];
  aoAlterar: (ids: number[]) => void;
  erro?: string;
  desabilitado: boolean;
}

/**
 * Uma relação com os cadastros de um tipo, mais o botão de criar um novo.
 *
 * A lista vem **inteira**, e não paginada: a busca do `CampoSelecaoMultipla` é
 * local, então o que não vier não aparece — e, na edição, um registro já
 * vinculado que ficasse de fora sumiria da tela e seria perdido no salvar,
 * porque o formulário manda o conjunto final.
 *
 * Um cadastro criado no modal entra na lista **já marcado** — foi para isso
 * que ele foi criado.
 */
function CampoDeRelacao({
  id,
  label,
  slug,
  selecionados,
  aoAlterar,
  erro,
  desabilitado,
}: CampoDeRelacaoProps) {
  const [itens, setItens] = useState<Cadastro[]>([]);
  const [tipo, setTipo] = useState<CadastroTipo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);

    try {
      const [encontrados, tipoDoCampo] = await Promise.all([
        listarCadastrosDoTipo(slug),
        buscarTipoPeloSlug(slug),
      ]);

      setItens(encontrados);
      setTipo(tipoDoCampo);
      setErroCarga(null);
    } catch (falha) {
      setErroCarga(mensagemDoErro(falha));
    } finally {
      setCarregando(false);
    }
  }, [slug]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <div>
      <CampoSelecaoMultipla
        id={id}
        label={label}
        itens={itens.map((item) => ({ valor: item.id, rotulo: item.nome }))}
        valores={selecionados}
        aoAlterar={aoAlterar}
        carregando={carregando}
        mensagemVazia={
          tipo
            ? "Nenhum registro cadastrado neste tipo."
            : "O tipo de cadastro deste campo ainda não existe nesta empresa."
        }
        erro={erro}
        desabilitado={desabilitado}
      />

      {erroCarga && (
        <div className="mt-2">
          <MensagemErro mensagem={erroCarga} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setModalAberto(true)}
        disabled={desabilitado || !tipo}
        className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
      >
        <PlusIcon className="size-5 fill-current" />
        Adicionar novo
      </button>

      <ModalCadastroRapido
        aberto={modalAberto}
        tipo={tipo}
        aoFechar={() => setModalAberto(false)}
        aoCriar={(criado) => {
          setItens((atuais) => [...atuais, criado]);
          aoAlterar([...selecionados, criado.id]);
        }}
      />
    </div>
  );
}
