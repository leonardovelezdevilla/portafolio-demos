/**
 * Fechas de entrega en America/Lima (UTC-5 todo el año, sin horario de verano).
 * Todo se calcula con aritmética UTC desplazada, sin depender de la zona del navegador.
 */
export const LIMA_UTC = -5;
export const HORAS_MIN = 48;
export const HORAS_MIN_2_PISOS = 72;
export const DIAS_MAX = 90;

/** Feriados nacionales con cierre (referencia de demo para 2026 y 2027; confirmar cada año con El Peruano). */
export const FERIADOS: Record<string, string> = {
  '2026-04-02': 'Jueves Santo', '2026-04-03': 'Viernes Santo', '2026-05-01': 'Día del Trabajo',
  '2026-06-07': 'Batalla de Arica y Día de la Bandera', '2026-06-29': 'San Pedro y San Pablo',
  '2026-07-23': 'Día de la Fuerza Aérea', '2026-07-28': 'Fiestas Patrias', '2026-07-29': 'Fiestas Patrias',
  '2026-08-06': 'Batalla de Junín', '2026-08-30': 'Santa Rosa de Lima', '2026-10-08': 'Combate de Angamos',
  '2026-11-01': 'Todos los Santos', '2026-12-08': 'Inmaculada Concepción', '2026-12-09': 'Batalla de Ayacucho',
  '2026-12-25': 'Navidad', '2027-01-01': 'Año Nuevo', '2027-03-25': 'Jueves Santo', '2027-03-26': 'Viernes Santo',
  '2027-05-01': 'Día del Trabajo', '2027-06-07': 'Batalla de Arica y Día de la Bandera', '2027-06-29': 'San Pedro y San Pablo',
  '2027-07-23': 'Día de la Fuerza Aérea', '2027-07-28': 'Fiestas Patrias', '2027-07-29': 'Fiestas Patrias',
  '2027-08-06': 'Batalla de Junín', '2027-08-30': 'Santa Rosa de Lima', '2027-10-08': 'Combate de Angamos',
  '2027-11-01': 'Todos los Santos', '2027-12-08': 'Inmaculada Concepción', '2027-12-09': 'Batalla de Ayacucho',
  '2027-12-25': 'Navidad',
};

export const NOMBRES_DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** Horario de recojo y entrega por día de la semana (0 = domingo). null = cerrado. */
export const HORARIO: Record<number, { abre: string; cierra: string } | null> = {
  0: { abre: '09:00', cierra: '14:00' },
  1: null,
  2: { abre: '09:00', cierra: '19:00' },
  3: { abre: '09:00', cierra: '19:00' },
  4: { abre: '09:00', cierra: '19:00' },
  5: { abre: '09:00', cierra: '19:00' },
  6: { abre: '09:00', cierra: '19:00' },
};

const dos = (n: number) => String(n).padStart(2, '0');
const aMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

export interface PartesLima { ymd: string; hhmm: string; dow: number }

/** Fecha y hora de un instante, vistas en Lima. */
export function partesLima(instante: Date): PartesLima {
  const d = new Date(instante.getTime() + LIMA_UTC * 3_600_000);
  return {
    ymd: `${d.getUTCFullYear()}-${dos(d.getUTCMonth() + 1)}-${dos(d.getUTCDate())}`,
    hhmm: `${dos(d.getUTCHours())}:${dos(d.getUTCMinutes())}`,
    dow: d.getUTCDay(),
  };
}

const ymdValido = (ymd: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(ymd) && !Number.isNaN(Date.parse(`${ymd}T00:00:00Z`)) && new Date(`${ymd}T00:00:00Z`).toISOString().startsWith(ymd);

export function diaSemana(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Instante UTC de una fecha y hora de Lima. */
export function instanteLima(ymd: string, hhmm: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  const [h, mi] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, h - LIMA_UTC, mi));
}

export const sumarDias = (ymd: string, n: number) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return partesLima(new Date(Date.UTC(y, m - 1, d + n, 12 - LIMA_UTC))).ymd;
};

export const feriado = (ymd: string) => FERIADOS[ymd] ?? null;

/** Motivo de cierre del día, o null si abre. */
export function motivoCierre(ymd: string): string | null {
  const f = feriado(ymd);
  if (f) return `Cerramos por feriado (${f}).`;
  if (!HORARIO[diaSemana(ymd)]) return 'Los lunes no atendemos.';
  return null;
}

/** Horas de recojo/entrega del día: cada 30 min, desde la apertura hasta 30 min antes del cierre. */
export function horasDelDia(ymd: string): string[] {
  if (motivoCierre(ymd)) return [];
  const h = HORARIO[diaSemana(ymd)]!;
  const out: string[] = [];
  for (let t = aMin(h.abre); t <= aMin(h.cierra) - 30; t += 30) out.push(`${dos(Math.floor(t / 60))}:${dos(t % 60)}`);
  return out;
}

/** Primer instante en que se puede entregar: ahora + 48 h (72 h con 2 pisos). */
export function minimoEntrega(ahora: Date, dosPisos: boolean): Date {
  return new Date(ahora.getTime() + (dosPisos ? HORAS_MIN_2_PISOS : HORAS_MIN) * 3_600_000);
}

/** Horas del día que ya cumplen la anticipación mínima. */
export function horasDisponibles(ymd: string, ahora: Date, dosPisos: boolean): string[] {
  const min = minimoEntrega(ahora, dosPisos).getTime();
  return horasDelDia(ymd).filter((h) => instanteLima(ymd, h).getTime() >= min);
}

/** Primer día con al menos una hora disponible (abre y cumple la anticipación). */
export function primerDiaDisponible(ahora: Date, dosPisos: boolean): string {
  let ymd = partesLima(minimoEntrega(ahora, dosPisos)).ymd;
  for (let i = 0; i < 40; i++, ymd = sumarDias(ymd, 1)) {
    if (horasDisponibles(ymd, ahora, dosPisos).length) return ymd;
  }
  return ymd;
}

/** Primer día abierto con horas libres a partir de `desde` (inclusive). */
export function proximoDiaDisponible(desde: string, ahora: Date, dosPisos: boolean): string {
  const primero = primerDiaDisponible(ahora, dosPisos);
  let ymd = desde < primero ? primero : desde;
  for (let i = 0; i < 40; i++, ymd = sumarDias(ymd, 1)) {
    if (horasDisponibles(ymd, ahora, dosPisos).length) return ymd;
  }
  return ymd;
}

/** Las próximas `n` fechas con horas libres. */
export function proximasFechas(ahora: Date, dosPisos: boolean, n = 3): string[] {
  const out: string[] = [];
  let d = primerDiaDisponible(ahora, dosPisos);
  while (out.length < n) {
    d = proximoDiaDisponible(d, ahora, dosPisos);
    out.push(d);
    d = sumarDias(d, 1);
  }
  return out;
}

export const ultimoDiaPermitido = (ahora: Date) => sumarDias(partesLima(ahora).ymd, DIAS_MAX);

export type ResultadoEntrega = { ok: true } | { ok: false; campo: 'fecha' | 'hora'; mensaje: string };

export const etiquetaMin = (dosPisos: boolean) => (dosPisos ? '72 horas (3 días)' : '48 horas (2 días)');

/** Etiqueta legible, p. ej. "domingo 22/11/2026". */
export function etiquetaFecha(ymd: string): string {
  const [y, m, d] = ymd.split('-');
  return `${NOMBRES_DIA[diaSemana(ymd)]} ${d}/${m}/${y}`;
}

/** Valida fecha y hora de entrega frente a la hora actual (inyectable para pruebas). */
export function validarEntrega(ymd: string, hhmm: string, ahora: Date, dosPisos: boolean): ResultadoEntrega {
  if (!ymd) return { ok: false, campo: 'fecha', mensaje: 'Elige la fecha de entrega.' };
  if (!ymdValido(ymd)) return { ok: false, campo: 'fecha', mensaje: 'Escribe una fecha válida (día, mes y año).' };
  if (ymd < partesLima(ahora).ymd) return { ok: false, campo: 'fecha', mensaje: `Esa fecha ya pasó. La primera fecha disponible es el ${etiquetaFecha(primerDiaDisponible(ahora, dosPisos))}.` };
  const cierre = motivoCierre(ymd);
  if (cierre) return { ok: false, campo: 'fecha', mensaje: `${cierre} Te sugerimos el ${etiquetaFecha(proximoDiaDisponible(ymd, ahora, dosPisos))}.` };
  const primero = primerDiaDisponible(ahora, dosPisos);
  if (ymd < primero) {
    return {
      ok: false, campo: 'fecha',
      mensaje: `Necesitamos al menos ${etiquetaMin(dosPisos)} de anticipación${dosPisos ? ' para tortas de 2 pisos' : ''}. La primera fecha disponible es el ${etiquetaFecha(primero)}.`,
    };
  }
  if (ymd > ultimoDiaPermitido(ahora)) return { ok: false, campo: 'fecha', mensaje: `Aceptamos pedidos hasta ${DIAS_MAX} días adelante.` };
  if (!hhmm) return { ok: false, campo: 'hora', mensaje: 'Elige la hora de recojo o entrega.' };
  const horas = horasDelDia(ymd);
  if (!horas.includes(hhmm)) {
    const h = HORARIO[diaSemana(ymd)]!;
    return { ok: false, campo: 'hora', mensaje: `Ese día atendemos de ${h.abre} a ${h.cierra}. Elige una hora dentro de ese horario.` };
  }
  if (instanteLima(ymd, hhmm).getTime() < minimoEntrega(ahora, dosPisos).getTime()) {
    const libres = horasDisponibles(ymd, ahora, dosPisos);
    return { ok: false, campo: 'hora', mensaje: `A esa hora aún no cumple las ${etiquetaMin(dosPisos)} de anticipación. ${libres.length ? `Ese día puedes elegir desde las ${libres[0]}.` : 'Elige otra fecha.'}` };
  }
  return { ok: true };
}
