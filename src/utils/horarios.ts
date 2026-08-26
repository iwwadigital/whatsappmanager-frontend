import type { OpcaoSelect } from "../components/campos/CampoSelect";

/**
 * Faixa dos alertas do dia — espelha as constantes do Model
 * App\Models\Empresa\Empresa (18:00 até 23:30, de 30 em 30 minutos).
 */
export const HORARIO_ALERTAS_INICIO = "18:00";
export const HORARIO_ALERTAS_FIM = "23:30";
export const HORARIO_ALERTAS_INTERVALO = 30;

/** "20:30" → 1230 minutos. */
function paraMinutos(horario: string): number {
  const [hora, minuto] = horario.split(":").map(Number);

  return hora * 60 + minuto;
}

/** 1230 minutos → "20:30". */
function paraHorario(minutos: number): string {
  const hora = Math.floor(minutos / 60);
  const minuto = minutos % 60;

  return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
}

/** Opções do select de horário dos alertas do dia. */
export function opcoesHorarioAlertas(): OpcaoSelect[] {
  const opcoes: OpcaoSelect[] = [];
  const fim = paraMinutos(HORARIO_ALERTAS_FIM);

  for (
    let minutos = paraMinutos(HORARIO_ALERTAS_INICIO);
    minutos <= fim;
    minutos += HORARIO_ALERTAS_INTERVALO
  ) {
    const horario = paraHorario(minutos);

    opcoes.push({ valor: horario, rotulo: horario });
  }

  return opcoes;
}

/** A API devolve "HH:MM", mas "HH:MM:SS" também é aceito no select. */
export function normalizarHorario(valor?: string | null): string {
  return valor ? valor.slice(0, 5) : "";
}
