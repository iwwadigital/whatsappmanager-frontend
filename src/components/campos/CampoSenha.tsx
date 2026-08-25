import { useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { EyeCloseIcon, EyeIcon } from "../../icons";

interface CampoSenhaProps {
  id: string;
  label: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  placeholder?: string;
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  desabilitado?: boolean;
}

export default function CampoSenha({
  id,
  label,
  valor,
  aoAlterar,
  placeholder = "Digite a senha",
  erro,
  dica,
  obrigatorio = false,
  desabilitado = false,
}: CampoSenhaProps) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {obrigatorio && <span className="text-error-500">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={visivel ? "text" : "password"}
          value={valor}
          placeholder={placeholder}
          disabled={desabilitado}
          error={Boolean(erro)}
          hint={erro ?? dica}
          onChange={(evento) => aoAlterar(evento.target.value)}
        />
        <button
          type="button"
          onClick={() => setVisivel((atual) => !atual)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-[22px]"
        >
          {visivel ? (
            <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
          ) : (
            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
          )}
        </button>
      </div>
    </div>
  );
}
