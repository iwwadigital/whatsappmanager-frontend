import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import CampoSenha from "../campos/CampoSenha";
import CampoTexto from "../campos/CampoTexto";
import Carregador from "../campos/Carregador";
import Button from "../ui/button/Button";
import { MensagemErro } from "../crud/EstadosLista";
import { useAutenticacao } from "../../context/AutenticacaoContext";
import { ErroApi } from "../../services/http";
import type { ErrosValidacao } from "../../types/api";

interface EstadoNavegacao {
  de?: string;
}

export default function FormularioLogin() {
  const { entrar, entrando } = useAutenticacao();
  const navegar = useNavigate();
  const local = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [exigeEmpresa, setExigeEmpresa] = useState(false);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErros({});
    setErroGeral(null);
    setAviso(null);

    try {
      await entrar({
        email,
        senha,
        empresa_id: empresaId ? Number(empresaId) : null,
      });

      const destino = (local.state as EstadoNavegacao | null)?.de ?? "/";

      navegar(destino, { replace: true });
    } catch (falha) {
      if (!(falha instanceof ErroApi)) {
        setErroGeral("Não foi possível concluir o login.");

        return;
      }

      // 409: o e-mail existe em mais de uma empresa.
      if (falha.tipo === "alerta") {
        setExigeEmpresa(true);
        setAviso(falha.message);

        return;
      }

      setErros(falha.erros);

      if (!falha.ehValidacao) {
        setErroGeral(falha.message);
      }
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-5">
      {erroGeral && <MensagemErro mensagem={erroGeral} />}

      {aviso && (
        <div className="rounded-xl border border-warning-500 bg-warning-50 px-4 py-3 text-sm text-warning-600 dark:border-warning-500/30 dark:bg-warning-500/15 dark:text-orange-400">
          {aviso}
        </div>
      )}

      <CampoTexto
        id="email"
        label="E-mail"
        tipo="email"
        obrigatorio
        valor={email}
        aoAlterar={setEmail}
        placeholder="voce@empresa.com.br"
        erro={erros.email?.[0]}
      />

      <CampoSenha
        id="senha"
        label="Senha"
        obrigatorio
        valor={senha}
        aoAlterar={setSenha}
        erro={erros.senha?.[0]}
      />

      {exigeEmpresa && (
        <CampoTexto
          id="empresa_id"
          label="Código da empresa"
          tipo="number"
          obrigatorio
          valor={empresaId}
          aoAlterar={setEmpresaId}
          placeholder="Informe o código da empresa"
          dica="Este e-mail está vinculado a mais de uma empresa."
          erro={erros.empresa_id?.[0]}
        />
      )}

      <Button
        className="w-full"
        disabled={entrando}
        startIcon={entrando ? <Carregador tamanho="size-4" /> : undefined}
      >
        Entrar
      </Button>
    </form>
  );
}
