import { useMemo } from "react";
import CampoSelect from "../campos/CampoSelect";
import { useEmpresaAtiva } from "../../context/EmpresaAtivaContext";

/**
 * Seletor de empresa do header: define o recorte de conteúdo da sessão.
 *
 * Só aparece para quem não tem empresa própria — quem tem sempre enxerga
 * a empresa do seu cadastro e não escolhe nada.
 */
export default function SeletorEmpresa({
  id = "empresa-ativa",
  className = "",
}: {
  /** O header renderiza duas instâncias (mobile/desktop): ids distintos. */
  id?: string;
  className?: string;
}) {
  const { empresa, empresas, exibirSeletor, carregando, selecionar } =
    useEmpresaAtiva();

  const opcoes = useMemo(
    () =>
      empresas.map((item) => ({ valor: String(item.id), rotulo: item.nome })),
    [empresas],
  );

  if (!exibirSeletor) {
    return null;
  }

  const trocar = (valor: string) => {
    const escolhida = empresas.find((item) => String(item.id) === valor);

    if (escolhida) {
      selecionar(escolhida);
    }
  };

  return (
    <CampoSelect
      id={id}
      valor={empresa ? String(empresa.id) : ""}
      aoAlterar={trocar}
      opcoes={opcoes}
      placeholder={carregando ? "Carregando empresas..." : "Selecione a empresa"}
      ocultarPlaceholder={Boolean(empresa)}
      desabilitado={carregando}
      className={className}
    />
  );
}
