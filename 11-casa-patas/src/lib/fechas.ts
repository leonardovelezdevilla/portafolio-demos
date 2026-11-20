/** Fechas y horarios en America/Lima (UTC-5 todo el año). Aritmética UTC desplazada, sin depender de la zona del navegador. */
import type { ServicioId } from './config';

export const LIMA_UTC = -5;
export const DIAS_MAX = 60;
export const HORAS_ANTICIPACION: Record<ServicioId, number> = { consulta: 2, vacuna: 2, bano: 24 };
export const NOMBRES_DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** Días en que la clínica cierra todo el día (referencia de demo). */
export const CIERRES: Record<string, string> = {
  '2026-12-25': 'Navidad', '2027-01-01': 'Año Nuevo', '2027-12-25': 'Navidad', '2028-01-01': 'Año Nuevo',
};

/** Horario de atención por día (0 = domingo). */
export const HORARIO: Record<number, { abre: string; cierra: string }> = {
  0: { abre: '09:00', cierra: '13:00' },
  1: { abre: '09:00', cierra: '20:00' },
  2: { abre: '09:00', cierra: '20:00' },
  3: { abre: '09:00', cierra: '20:00' },
  4: { abre: '09:00', cierra: '20:00' },
  5: { abre: '09:00', cierra: '20:00' },
  6: { abre: '09:00', cierra: '20:00' },
};

/** Turnos de baño y peluquería (la groomer no trabaja domingos). Cada turno dura hasta 2 h 30 min. */
export const TURNOS_BANO = ['09:00', '11:30', '14:00', '16:30'];

const dos = (n: number) => String(n).padStart(2, '0');
const aMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

export interface PartesLima { ymd: string; hhmm: string; dow: number }
export function partesLima(instante: Date): PartesLima {
  const d = new Date(instante.getTime() + LIMA_UTC * 3_600_000);
  return {
    ymd: `${d.getUTCFullYear()}-${dos(d.getUTCMonth() + 1)}-${dos(d.getUTCDate())}`,
    hhmm: `${dos(d.getUTCHours())}:${dos(d.getUTCMinutes())}`,
    dow: d.getUTCDay(),
  };
}

export const ymdValido = (ymd: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(ymd) && !Number.isNaN(Date.parse(`${ymd}T00:00:00Z`)) && new Date(`${ymd}T00:00:00Z`).toISOString().startsWith(ymd);

export function diaSemana(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
export function instanteLima(ymd: string, hhmm: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  const [h, mi] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, h - LIMA_UTC, mi));
}
export const sumarDias = (ymd: string, n: number) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return partesLima(new Date(Date.UTC(y, m - 1, d + n, 12 - LIMA_UTC))).ymd;
};
export function etiquetaFecha(ymd: string): string {
  const [y, m, d] = ymd.split('-');
  return `${NOMBRES_DIA[diaSemana(ymd)]} ${d}/${m}/${y}`;
}

/** Motivo por el que el servicio no se atiende ese día, o null. */
export function motivoCierre(ymd: string, servicio: ServicioId): string | null {
  if (CIERRES[ymd]) return `Cerramos por feriado (${CIERRES[ymd]}).`;
  if (servicio === 'bano' && diaSemana(ymd) === 0) return 'La peluquería no atiende los domingos.';
  return null;
}

/** Horas posibles del día: cada 30 min hasta 30 min antes del cierre; baño con turnos propios. */
export function horasDelDia(ymd: string, servicio: ServicioId): string[] {
  if (motivoCierre(ymd, servicio)) return [];
  if (servicio === 'bano') return [...TURNOS_BANO];
  const h = HORARIO[diaSemana(ymd)];
  const out: string[] = [];
  for (let t = aMin(h.abre); t <= aMin(h.cierra) - 30; t += 30) out.push(`${dos(Math.floor(t / 60))}:${dos(t % 60)}`);
  return out;
}

export const minimoInstante = (ahora: Date, s: ServicioId) => new Date(ahora.getTime() + HORAS_ANTICIPACION[s] * 3_600_000);

export function horasDisponibles(ymd: string, s: ServicioId, ahora: Date): string[] {
  const min = minimoInstante(ahora, s).getTime();
  return horasDelDia(ymd, s).filter((h) => instanteLima(ymd, h).getTime() >= min);
}

/** Primer día (desde hoy en Lima, o desde `desde`) con al menos una hora libre. */
export function primerDiaDisponible(s: ServicioId, ahora: Date, desde?: string): string {
  const hoy = partesLima(ahora).ymd;
  let ymd = desde && desde > hoy ? desde : hoy;
  for (let i = 0; i < 40; i++, ymd = sumarDias(ymd, 1)) if (horasDisponibles(ymd, s, ahora).length) return ymd;
  return ymd;
}

export const ultimoDiaPermitido = (ahora: Date) => sumarDias(partesLima(ahora).ymd, DIAS_MAX);

export type ResultadoCita = { ok: true } | { ok: false; campo: 'fecha' | 'hora'; mensaje: string };

export function validarCita(ymd: string, hhmm: string, s: ServicioId, ahora: Date): ResultadoCita {
  if (!ymd) return { ok: false, campo: 'fecha', mensaje: 'Elige la fecha de la cita.' };
  if (!ymdValido(ymd)) return { ok: false, campo: 'fecha', mensaje: 'Escribe una fecha válida (día, mes y año).' };
  const hoy = partesLima(ahora).ymd;
  if (ymd < hoy) return { ok: false, campo: 'fecha', mensaje: 'Esa fecha ya pasó. Elige hoy o un día posterior.' };
  const cierre = motivoCierre(ymd, s);
  if (cierre) return { ok: false, campo: 'fecha', mensaje: `${cierre} Te sugerimos el ${etiquetaFecha(primerDiaDisponible(s, ahora, sumarDias(ymd, 1)))}.` };
  if (ymd > ultimoDiaPermitido(ahora)) return { ok: false, campo: 'fecha', mensaje: `Agendamos hasta ${DIAS_MAX} días adelante.` };
  if (!hhmm) return { ok: false, campo: 'hora', mensaje: s === 'bano' ? 'Elige el turno de baño y peluquería.' : 'Elige la hora de la cita.' };
  if (!horasDelDia(ymd, s).includes(hhmm)) {
    const h = HORARIO[diaSemana(ymd)];
    return { ok: false, campo: 'hora', mensaje: s === 'bano' ? `Ese turno no existe. Los turnos son: ${TURNOS_BANO.join(', ')}.` : `Ese día atendemos de ${h.abre} a ${h.cierra}. Elige una hora dentro del horario.` };
  }
  if (instanteLima(ymd, hhmm).getTime() < minimoInstante(ahora, s).getTime()) {
    const libres = horasDisponibles(ymd, s, ahora);
    const ant = HORAS_ANTICIPACION[s];
    return { ok: false, campo: 'hora', mensaje: `Esa hora ya no está disponible: pedimos ${ant} horas de anticipación. ${libres.length ? `Ese día puedes elegir desde las ${libres[0]}.` : 'Elige otro día.'}` };
  }
  return { ok: true };
}
