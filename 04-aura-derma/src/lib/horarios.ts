/**
 * Generación de horarios de la agenda (zona America/Lima, UTC-5 todo el año, sin horario de verano).
 *
 * Horario de la clínica: lunes a viernes 9:00-13:00 y 15:00-19:00, sábados 9:00-13:00,
 * domingos cerrado. Citas cada 30 minutos.
 *
 * HORARIOS OCUPADOS SIMULADOS: no hay backend. Para cada (fecha, especialista) se siembra un
 * generador pseudoaleatorio (mulberry32) con un hash FNV-1a de `aura-derma|AAAA-MM-DD|id`, y se
 * recorren los bloques en orden. Así el mismo día siempre muestra los mismos ocupados, sin
 * almacenar nada. Se garantiza un mínimo de bloques libres por día.
 */

export const OFFSET_LIMA_MIN = -300;
export const PASO_MIN = 30;
export const DIAS_AGENDA = 14;
export const ANTICIPACION_MIN = 60;
export const PROB_OCUPADO = 0.38;
export const MIN_LIBRES = 3;

export type Estado = 'libre' | 'ocupado' | 'pasado';

export interface Bloque {
  hora: string;
  estado: Estado;
}

export interface DiaAgenda {
  fecha: string;
  diaSemana: number;
  abierto: boolean;
}

const RE_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

export function esFechaValida(fecha: string): boolean {
  const m = RE_FECHA.exec(fecha);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

/** Fecha (AAAA-MM-DD) y minutos desde medianoche en Lima para un instante dado. */
export function ahoraLima(ahora: Date): { fecha: string; minutos: number } {
  const t = new Date(ahora.getTime() + OFFSET_LIMA_MIN * 60000);
  return { fecha: t.toISOString().slice(0, 10), minutos: t.getUTCHours() * 60 + t.getUTCMinutes() };
}

export function diaSemana(fecha: string): number {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function sumarDias(fecha: string, n: number): string {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function aMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export function deMinutos(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

/** Horas de inicio de cita que ofrece la clínica ese día de la semana (sin considerar ocupados). */
export function horasDelDia(dia: number): string[] {
  if (dia === 0) return [];
  const tramos: Array<[number, number]> = dia === 6 ? [[540, 780]] : [[540, 780], [900, 1140]];
  const horas: string[] = [];
  for (const [ini, fin] of tramos) {
    for (let m = ini; m < fin; m += PASO_MIN) horas.push(deMinutos(m));
  }
  return horas;
}

export function proximosDias(ahora: Date, cantidad = DIAS_AGENDA): DiaAgenda[] {
  const hoy = ahoraLima(ahora).fecha;
  return Array.from({ length: cantidad }, (_, i) => {
    const fecha = sumarDias(hoy, i);
    const ds = diaSemana(fecha);
    return { fecha, diaSemana: ds, abierto: ds !== 0 };
  });
}

export function hash32(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry32(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Conjunto de horas ocupadas (simuladas) de un especialista en una fecha. Determinista. */
export function horasOcupadas(fecha: string, especialistaId: string): Set<string> {
  const horas = horasDelDia(diaSemana(fecha));
  const rnd = mulberry32(hash32(`aura-derma|${fecha}|${especialistaId}`));
  const ocupadas = new Set<string>();
  for (const h of horas) if (rnd() < PROB_OCUPADO) ocupadas.add(h);
  // Garantiza un mínimo de bloques libres liberando desde el final de la mañana hacia atrás.
  const minimo = Math.min(MIN_LIBRES, horas.length);
  for (let i = horas.length - 1; i >= 0 && horas.length - ocupadas.size < minimo; i--) {
    ocupadas.delete(horas[i]);
  }
  return ocupadas;
}

/** Bloques de un día para un especialista. `diasAtencion` (1-6) limita los días que atiende. */
export function bloquesDelDia(
  fecha: string,
  especialistaId: string,
  ahora: Date,
  diasAtencion?: number[],
): Bloque[] {
  if (!esFechaValida(fecha)) return [];
  const ds = diaSemana(fecha);
  if (diasAtencion && !diasAtencion.includes(ds)) return [];
  const { fecha: hoy, minutos } = ahoraLima(ahora);
  const ocupadas = horasOcupadas(fecha, especialistaId);
  return horasDelDia(ds).map((hora) => {
    let estado: Estado = ocupadas.has(hora) ? 'ocupado' : 'libre';
    if (fecha < hoy || (fecha === hoy && aMinutos(hora) < minutos + ANTICIPACION_MIN)) estado = 'pasado';
    return { hora, estado };
  });
}

/** Devuelve un mensaje de error en español o null si fecha y hora son reservables. */
export function validarFechaHora(
  fecha: string,
  hora: string,
  especialistaId: string,
  ahora: Date,
  diasAtencion?: number[],
): string | null {
  if (!fecha) return 'Elige una fecha para tu cita.';
  if (!esFechaValida(fecha)) return 'La fecha no es válida.';
  const { fecha: hoy } = ahoraLima(ahora);
  if (fecha < hoy) return 'No se puede reservar en una fecha pasada.';
  if (fecha > sumarDias(hoy, DIAS_AGENDA - 1)) return `Solo se reserva dentro de los próximos ${DIAS_AGENDA} días.`;
  const ds = diaSemana(fecha);
  if (ds === 0) return 'La clínica está cerrada los domingos.';
  if (diasAtencion && !diasAtencion.includes(ds)) return 'El especialista no atiende ese día.';
  if (!hora) return 'Elige un horario.';
  const bloque = bloquesDelDia(fecha, especialistaId, ahora, diasAtencion).find((b) => b.hora === hora);
  if (!bloque) return 'Ese horario no existe en la agenda.';
  if (bloque.estado === 'pasado') return 'Ese horario ya pasó o es demasiado pronto; elige uno posterior.';
  if (bloque.estado === 'ocupado') return 'Ese horario ya está ocupado; elige otro.';
  return null;
}

export function formatearFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
