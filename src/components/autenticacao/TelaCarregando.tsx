import Carregador from "../campos/Carregador";

/** Tela cheia exibida enquanto a sessão é validada. */
export default function TelaCarregando() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <Carregador tamanho="size-6" />
        Carregando...
      </div>
    </div>
  );
}
