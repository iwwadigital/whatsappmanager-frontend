import ModalGrupoMembro from "./ModalGrupoMembro";
import { gruposTiposMembrosApi } from "../../services/api";
import type { GrupoTipo } from "../../types/modelos";

interface ModalAlocarMembroProps {
  /** Tipo de grupo em que o membro será alocado; `null` mantém fechado. */
  grupoTipo: GrupoTipo | null;
  aoFechar: () => void;
  /** Recebe a mensagem da API, que diz em qual grupo o membro entrou. */
  aoAlocar: (mensagem: string) => void;
}

/**
 * "Adicionar membro" a partir de um **tipo de grupo**.
 *
 * Reaproveita o modal dos membros do grupo — os campos são os mesmos. O que
 * muda é o destino: quem escolhe o grupo é a API, que coloca o membro no
 * grupo do tipo com menos participantes que ainda tenha vaga e, se nenhum
 * tiver, cria um grupo novo.
 */
export default function ModalAlocarMembro({
  grupoTipo,
  aoFechar,
  aoAlocar,
}: ModalAlocarMembroProps) {
  return (
    <ModalGrupoMembro
      aberto={grupoTipo !== null}
      titulo="Adicionar membro"
      descricao={
        grupoTipo
          ? `O membro entra no grupo de "${grupoTipo.nome}" com menos participantes que ainda tenha vaga. Sem nenhum grupo disponível, um novo é criado.`
          : ""
      }
      salvar={async (dados) => {
        const { mensagem } = await gruposTiposMembrosApi.alocar(
          grupoTipo!.id,
          dados,
        );

        return mensagem;
      }}
      aoFechar={aoFechar}
      aoSalvar={aoAlocar}
    />
  );
}
