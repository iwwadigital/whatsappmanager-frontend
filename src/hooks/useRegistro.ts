import { useCallback, useEffect, useRef, useState } from "react";
import { mensagemDoErro } from "../services/http";

/** Carrega um único registro (páginas de visualização e edição). */
export function useRegistro<T>(
  mostrar: (id: number | string) => Promise<T>,
  id?: string,
) {
  const mostrarRef = useRef(mostrar);
  const [registro, setRegistro] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    mostrarRef.current = mostrar;
  });

  const carregar = useCallback(async () => {
    if (!id) {
      setErro("Registro não informado.");
      setCarregando(false);

      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      setRegistro(await mostrarRef.current(id));
    } catch (falha) {
      setRegistro(null);
      setErro(mensagemDoErro(falha));
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return { registro, carregando, erro, recarregar: carregar };
}
