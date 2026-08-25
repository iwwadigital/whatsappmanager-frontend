import Carregador from "../campos/Carregador";

/** Linha de carregamento usada dentro das tabelas. */
export function EstadoCarregando({ mensagem = "Carregando..." }: { mensagem?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 px-5 py-12 text-sm text-gray-500 dark:text-gray-400">
      <Carregador />
      {mensagem}
    </div>
  );
}

/** Estado vazio — resposta "aviso" da API (nenhum registro encontrado). */
export function EstadoVazio({ mensagem }: { mensagem: string }) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400">{mensagem}</p>
    </div>
  );
}

/** Mensagem de erro da API. */
export function MensagemErro({ mensagem }: { mensagem: string }) {
  return (
    <div className="rounded-xl border border-error-500 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-500">
      {mensagem}
    </div>
  );
}

/** Mensagem de sucesso da API. */
export function MensagemSucesso({ mensagem }: { mensagem: string }) {
  return (
    <div className="rounded-xl border border-success-500 bg-success-50 px-4 py-3 text-sm text-success-600 dark:border-success-500/30 dark:bg-success-500/15 dark:text-success-500">
      {mensagem}
    </div>
  );
}
