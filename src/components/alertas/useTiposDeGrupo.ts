import { useEffect, useState } from "react";
import { gruposTiposApi } from "../../services/api";
import { carregarTodos } from "../../services/carregarTodos";
import { mensagemDoErro } from "../../services/http";
import type { GrupoTipo } from "../../types/modelos";

/**
 * Os tipos de grupo ativos da empresa, carregados de uma vez.
 *
 * A lista de seleção do alerta busca localmente (`CampoSelecaoMultipla`), e
 * são poucos registros — por isso vêm inteiros, e não por autocomplete. A flag
 * `e_gratis` vem junto: é ela que liga a coluna "Esconder" da aba de
 * disponibilidade.
 */
export function useTiposDeGrupo(empresaId: number) {
  const [tipos, setTipos] = useState<GrupoTipo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);

    carregarTodos<GrupoTipo>(gruposTiposApi.listar, { status: 1 })
      .then((lista) => {
        if (ativo) setTipos(lista);
      })
      .catch((falha) => {
        if (ativo) setErro(mensagemDoErro(falha));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [empresaId]);

  return { tipos, carregando, erro };
}
