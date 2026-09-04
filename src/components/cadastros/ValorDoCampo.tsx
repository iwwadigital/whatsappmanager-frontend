import Badge from "../ui/badge/Badge";
import BotaoBaixarArquivo from "./BotaoBaixarArquivo";
import { tipoDoCampo } from "../../utils/camposPersonalizados";
import { formatarData, ouTraco } from "../../utils/formato";
import type {
  CampoPersonalizado,
  TipoCampoCatalogo,
  ValorArquivo,
  ValorTaxonomia,
} from "../../types/modelos";

interface ValorDoCampoProps {
  campo: CampoPersonalizado;
  catalogo: TipoCampoCatalogo[];
  valor: unknown;
}

/**
 * Mostra o valor de um campo personalizado na tela de visualização.
 *
 * Segue a mesma regra do formulário: o que a tela não sabe desenhar vira
 * texto, e nada é escondido do usuário por causa de um tipo desconhecido.
 */
export default function ValorDoCampo({
  campo,
  catalogo,
  valor,
}: ValorDoCampoProps) {
  if (valor === null || valor === undefined || valor === "") {
    return <>{ouTraco(null)}</>;
  }

  if (campo.type === "date" && typeof valor === "string") {
    return <>{formatarData(valor)}</>;
  }

  if (campo.type === "select" && typeof valor === "string") {
    const opcao = (campo.values ?? []).find((item) => item.key === valor);

    // Opção que saiu da configuração: mostra a chave gravada, marcada.
    return opcao ? (
      <>{opcao.label}</>
    ) : (
      <span className="flex flex-wrap items-center gap-2">
        {valor}
        <Badge size="sm" color="warning">
          Opção removida
        </Badge>
      </span>
    );
  }

  if (campo.type === "taxonomy") {
    const vinculo = valor as ValorTaxonomia;

    return vinculo.nome ? (
      <>{vinculo.nome}</>
    ) : (
      <span className="flex flex-wrap items-center gap-2">
        {`#${vinculo.id}`}
        <Badge size="sm" color="warning">
          Cadastro excluído
        </Badge>
      </span>
    );
  }

  if (tipoDoCampo(catalogo, campo)?.gravado_fora_do_formulario) {
    const arquivo = valor as ValorArquivo;

    return (
      <span className="flex flex-wrap items-center gap-3">
        <a
          href={arquivo.url}
          target="_blank"
          rel="noreferrer"
          className="text-brand-500 hover:underline"
        >
          {arquivo.nome}
        </a>
        <BotaoBaixarArquivo arquivo={arquivo} />
      </span>
    );
  }

  if (campo.type === "repeater" && Array.isArray(valor)) {
    const subcampos = campo.repeater ?? [];

    return (
      <div className="space-y-3">
        {valor.map((linha, indice) => (
          <div
            key={indice}
            className="rounded-lg border border-gray-200 p-3 dark:border-gray-800"
          >
            <dl className="space-y-1">
              {subcampos.map((subcampo) => (
                <div key={subcampo.key} className="flex flex-wrap gap-2">
                  <dt className="text-theme-xs text-gray-500 dark:text-gray-400">
                    {subcampo.label}:
                  </dt>
                  <dd className="text-theme-xs text-gray-800 dark:text-white/90">
                    <ValorDoCampo
                      campo={subcampo}
                      catalogo={catalogo}
                      valor={(linha as Record<string, unknown>)[subcampo.key]}
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    );
  }

  return <>{typeof valor === "string" ? valor : JSON.stringify(valor)}</>;
}
