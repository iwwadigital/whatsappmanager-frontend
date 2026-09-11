import CampoAlternador from "../campos/CampoAlternador";
import CampoAutocomplete from "../campos/CampoAutocomplete";
import CampoSelect from "../campos/CampoSelect";
import CampoSelecaoMultipla from "../campos/CampoSelecaoMultipla";
import CampoTexto from "../campos/CampoTexto";
import CampoTextarea from "../campos/CampoTextarea";
import { buscarCadastrosDoTipo } from "../../services/api";
import {
  TIPO_ROTA_AEREA,
  TIPO_SELO_DESTAQUE,
  opcoesItinerario,
} from "../../utils/alertas";
import type { ErrosValidacao } from "../../types/api";
import type { Cadastro, GrupoTipo } from "../../types/modelos";
import type { DadosFormularioAlerta } from "./formulario";

interface AbaAlertaProps {
  dados: DadosFormularioAlerta;
  definir: <C extends keyof DadosFormularioAlerta>(
    campo: C,
    valor: DadosFormularioAlerta[C],
  ) => void;
  /**
   * Trocar o itinerário tem efeito nas outras abas (refaz a
   * disponibilidade), então quem decide é o formulário, não este campo.
   */
  aoTrocarItinerario: (valor: number) => void;
  erros: ErrosValidacao;
  desabilitado: boolean;
  /** Os tipos de grupo da empresa, para a lista de seleção e a flag gratuito. */
  tipos: GrupoTipo[];
  carregandoTipos: boolean;
}

/**
 * A aba "Adicionar novo alerta": o conteúdo da oferta e para onde ela vai.
 *
 * O itinerário escolhido aqui **muda as outras abas** — é ele que decide se
 * existe custo de volta e se a disponibilidade é por mês ou por par de datas.
 */
export default function AbaAlerta({
  dados,
  definir,
  aoTrocarItinerario,
  erros,
  desabilitado,
  tipos,
  carregandoTipos,
}: AbaAlertaProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <CampoAutocomplete<Cadastro>
        id="selo_destaque_id"
        label="Selo de destaque"
        valor={dados.selo_destaque_id}
        rotuloSelecionado={dados.selo_destaque_nome}
        aoSelecionar={(item) => {
          definir("selo_destaque_id", item?.id ?? null);
          definir("selo_destaque_nome", item?.nome ?? "");
        }}
        buscar={(termo) => buscarCadastrosDoTipo(TIPO_SELO_DESTAQUE, termo)}
        obterValor={(item) => item.id}
        obterRotulo={(item) => item.nome}
        erro={erros.selo_destaque_id?.[0]}
        desabilitado={desabilitado}
      />

      <CampoTexto
        id="nome"
        label="Nome"
        obrigatorio
        valor={dados.nome}
        aoAlterar={(valor) => definir("nome", valor)}
        placeholder="Passagens para Miami a partir de 20 mil milhas"
        erro={erros.nome?.[0]}
        desabilitado={desabilitado}
      />

      <CampoTexto
        id="chamada"
        label="Crie uma chamada para esse alerta"
        obrigatorio
        valor={dados.chamada}
        aoAlterar={(valor) => definir("chamada", valor)}
        placeholder="Corre que é por tempo limitado!"
        erro={erros.chamada?.[0]}
        desabilitado={desabilitado}
      />

      <CampoSelect
        id="itinerario"
        label="Selecione o itinerário"
        obrigatorio
        ocultarPlaceholder
        valor={String(dados.itinerario)}
        aoAlterar={(valor) => aoTrocarItinerario(Number(valor))}
        opcoes={opcoesItinerario()}
        dica="Define os campos de volta e o formato da disponibilidade."
        erro={erros.itinerario?.[0]}
        desabilitado={desabilitado}
      />

      <div className="sm:col-span-2">
        <CampoTextarea
          id="frase_editorial"
          label="Frase editorial"
          linhas={2}
          valor={dados.frase_editorial}
          aoAlterar={(valor) => definir("frase_editorial", valor)}
          dica="Até 200 caracteres."
          erro={erros.frase_editorial?.[0]}
          desabilitado={desabilitado}
        />
      </div>

      <CampoAutocomplete<Cadastro>
        id="rota_aerea_id"
        label="Rota aérea"
        valor={dados.rota_aerea_id}
        rotuloSelecionado={dados.rota_aerea_nome}
        aoSelecionar={(item) => {
          definir("rota_aerea_id", item?.id ?? null);
          definir("rota_aerea_nome", item?.nome ?? "");
        }}
        buscar={(termo) => buscarCadastrosDoTipo(TIPO_ROTA_AEREA, termo)}
        obterValor={(item) => item.id}
        obterRotulo={(item) => item.nome}
        erro={erros.rota_aerea_id?.[0]}
        desabilitado={desabilitado}
      />

      <CampoAlternador
        id="voo_direto"
        label="Voo direto"
        descricao={dados.voo_direto ? "Sim" : "Não"}
        valor={dados.voo_direto}
        aoAlterar={(valor) => definir("voo_direto", valor)}
        erro={erros.voo_direto?.[0]}
        desabilitado={desabilitado}
      />

      <div className="sm:col-span-2">
        <CampoSelecaoMultipla
          id="grupos_tipos"
          label="Tipos de grupos"
          itens={tipos.map((tipo) => ({
            valor: tipo.id,
            rotulo: tipo.nome,
            descricao: tipo.e_gratis ? "Grupo gratuito" : undefined,
          }))}
          valores={dados.grupos_tipos}
          aoAlterar={(valores) => definir("grupos_tipos", valores)}
          carregando={carregandoTipos}
          dica="O alerta será disparado nos grupos de cada tipo selecionado."
          mensagemVazia="Nenhum tipo de grupo cadastrado nesta empresa."
          erro={erros.grupos_tipos?.[0]}
          desabilitado={desabilitado}
        />
      </div>
    </div>
  );
}
