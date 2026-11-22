import { CLASES, DIAS_NOMBRE, INSTRUCTORAS, NIVELES, PROGRAMAS, TIPOS, type Clase } from '../data/clases';
import { PRECIO_PRUEBA, PRECIO_SUELTA } from '../data/planes';
import { limpiarCelular, validarCelular, validarNombre } from './validar';
import { ocupados } from '../kit/sistema-demo';

export const ZONA = 'America/Lima';
export const WHATSAPP = '51935852637';
/** Se puede reservar hasta 60 minutos antes del inicio. */
export const MINUTOS_CIERRE_RESERVA = 60;
/** Ventana de reserva: hoy y los 7 días siguientes. */
export const DIAS_VENTANA = 7;
/** Hasta este número de cupos libres se avisa «Últimos N cupos». */
export const UMBRAL_ULTIMOS = 3;

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];

export function aMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Fecha y hora actuales en Lima, sin depender de la zona del navegador. */
export function ahoraLima(now: Date = new Date()): { fecha: string; minutos: number } {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const g = (t: string) => partes.find((p) => p.type === t)!.value;
  return { fecha: `${g('year')}-${g('month')}-${g('day')}`, minutos: Number(g('hour')) * 60 + Number(g('minute')) };
}

export function esFechaValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [y, m, d] = fecha.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function diaSemana(fecha: string): number {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function sumarDias(fecha: string, dias: number): string {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** «mié 25 nov» */
export function fechaCorta(fecha: string): string {
  const [, m, d] = fecha.split('-').map(Number);
  return `${DIAS_NOMBRE[diaSemana(fecha)].slice(0, 3).toLowerCase()} ${d} ${MESES_CORTOS[m - 1]}`;
}

/** Minutos desde `now` (hora de Lima) hasta una fecha y hora de Lima. Negativo si ya pasó. */
export function minutosHasta(fecha: string, hora: string, now: Date): number {
  const a = ahoraLima(now);
  const dias = (Date.parse(`${fecha}T00:00:00Z`) - Date.parse(`${a.fecha}T00:00:00Z`)) / 86400000;
  return dias * 1440 + aMinutos(hora) - a.minutos;
}

// ---------- Cupos simulados (deterministas) ----------

/** Hash FNV-1a de 32 bits; resultado en [0, 1). */
export function hashUnitario(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h / 4294967296;
}

export function programaDe(c: Clase) { return PROGRAMAS[c.programa]; }
export function cuposTotales(c: Clase): number { return TIPOS[programaDe(c).tipo].cupos; }

/** Las horas de más demanda (temprano y tras el trabajo) se llenan más. */
function demanda(hora: string): number {
  const m = aMinutos(hora);
  if (m < 8 * 60 || (m >= 18 * 60 && m < 21 * 60)) return 0.78;
  if (m >= 9 * 60 && m < 12 * 60) return 0.6;
  return 0.5;
}

/** Cupos ocupados simulados para una clase en una fecha: siempre el mismo valor para el mismo par. */
export function cuposOcupados(c: Clase, fecha: string): number {
  const total = cuposTotales(c);
  const r = hashUnitario(`${c.id}|${fecha}`);
  return Math.min(total, Math.floor((demanda(c.hora) * 0.55 + r * 0.6) * (total + 1)));
}

export type EstadoCupos = 'llena' | 'ultimos' | 'disponible';
export interface Cupos { total: number; ocupados: number; libres: number; estado: EstadoCupos; texto: string }

export function estadoCupos(total: number, ocupados: number): Cupos {
  const oc = Math.max(0, Math.min(total, Math.floor(ocupados)));
  const libres = total - oc;
  if (libres === 0) return { total, ocupados: oc, libres, estado: 'llena', texto: 'Llena' };
  if (libres <= UMBRAL_ULTIMOS) {
    return { total, ocupados: oc, libres, estado: 'ultimos', texto: libres === 1 ? 'Último cupo' : `Últimos ${libres} cupos` };
  }
  return { total, ocupados: oc, libres, estado: 'disponible', texto: `${libres} cupos libres` };
}

/** Título con el que se guarda una reserva de esta clase en el sistema de demo. */
export const tituloClase = (c: Clase) => `${programaDe(c).nombre} · ${c.hora}`;

export function cuposDe(c: Clase, fecha: string): Cupos {
  const total = cuposTotales(c);
  // Suma las reservas de prueba hechas en este navegador (sistema de demo).
  const demo = typeof localStorage === 'undefined' ? 0 : ocupados(fecha, tituloClase(c)).length;
  return estadoCupos(total, Math.min(total, cuposOcupados(c, fecha) + demo));
}

// ---------- Ocurrencias (clases concretas con fecha) ----------

export interface Ocurrencia {
  id: string; // «claseId@AAAA-MM-DD»
  clase: Clase;
  fecha: string;
  cupos: Cupos;
}

export const idOcurrencia = (c: Clase, fecha: string) => `${c.id}@${fecha}`;

/** ¿La reserva de esa clase ya cerró (empezó o faltan menos de 60 min)? */
export function reservaCerrada(c: Clase, fecha: string, now: Date): boolean {
  return minutosHasta(fecha, c.hora, now) < MINUTOS_CIERRE_RESERVA;
}

/** Próxima fecha en que se dicta la clase y todavía se puede reservar. */
export function proximaOcurrencia(c: Clase, now: Date = new Date()): Ocurrencia | null {
  const hoy = ahoraLima(now).fecha;
  for (let i = 0; i <= DIAS_VENTANA + 6; i++) {
    const f = sumarDias(hoy, i);
    if (diaSemana(f) === c.dia && !reservaCerrada(c, f, now)) return { id: idOcurrencia(c, f), clase: c, fecha: f, cupos: cuposDe(c, f) };
  }
  return null;
}

/** Todas las ocurrencias reservables en la ventana de reserva, ordenadas por fecha y hora. */
export function ocurrenciasReservables(now: Date = new Date(), clases: Clase[] = CLASES): Ocurrencia[] {
  const hoy = ahoraLima(now).fecha;
  const out: Ocurrencia[] = [];
  for (let i = 0; i <= DIAS_VENTANA; i++) {
    const f = sumarDias(hoy, i);
    for (const c of clases) {
      if (c.dia === diaSemana(f) && !reservaCerrada(c, f, now)) out.push({ id: idOcurrencia(c, f), clase: c, fecha: f, cupos: cuposDe(c, f) });
    }
  }
  return out.sort((a, b) => (a.fecha + a.clase.hora).localeCompare(b.fecha + b.clase.hora));
}

export function buscarOcurrencia(id: string): Ocurrencia | null {
  const [claseId, fecha] = id.split('@');
  const c = CLASES.find((x) => x.id === claseId);
  if (!c || !fecha || !esFechaValida(fecha) || diaSemana(fecha) !== c.dia) return null;
  return { id, clase: c, fecha, cupos: cuposDe(c, fecha) };
}

// ---------- Validación de la reserva ----------

export interface DatosReserva {
  ocurrencia: string;
  nombre: string;
  celular: string;
  primeraVez: '' | 'si' | 'no';
  lesion: '' | 'si' | 'no';
  consentimiento: boolean;
  /** Consentimiento expreso y separado para el dato de salud (solo si responde «sí» a lesiones). */
  consentimientoSalud?: boolean;
}

export function validarReserva(d: DatosReserva, now: Date = new Date()): Record<string, string> {
  const e: Record<string, string> = {};
  const oc = d.ocurrencia ? buscarOcurrencia(d.ocurrencia) : null;
  if (!d.ocurrencia) e.ocurrencia = 'Elige una clase del horario.';
  else if (!oc) e.ocurrencia = 'Esa clase no existe en el horario. Elige otra.';
  else {
    const hoy = ahoraLima(now).fecha;
    if (oc.fecha < hoy) e.ocurrencia = 'Esa fecha ya pasó. Elige otra clase.';
    else if (oc.fecha > sumarDias(hoy, DIAS_VENTANA)) e.ocurrencia = `Solo se reserva con hasta ${DIAS_VENTANA} días de anticipación.`;
    else if (reservaCerrada(oc.clase, oc.fecha, now)) e.ocurrencia = 'Esa clase ya cerró reservas (se cierran 1 hora antes). Elige otra.';
    else if (d.primeraVez === 'si' && programaDe(oc.clase).nivel !== 'inicial') e.ocurrencia = 'La clase de prueba es solo para nivel inicial: elige Reformer Base o Funcional Full Body.';
    else if (oc.cupos.estado === 'llena') e.ocurrencia = 'Esa clase está llena. Elige otra o pide lista de espera por WhatsApp.';
  }
  const n = validarNombre(d.nombre); if (n) e.nombre = n;
  const c = validarCelular(d.celular); if (c) e.celular = c;
  if (!d.primeraVez) e.primeraVez = 'Indica si es tu primera vez en Pulso Studio.';
  if (!d.lesion) e.lesion = 'Indica si tienes alguna lesión o restricción (solo sí o no).';
  if (!d.consentimiento) e.consentimiento = 'Marca la casilla de consentimiento para continuar.';
  if (d.lesion === 'si' && !d.consentimientoSalud) e.consentimientoSalud = 'Marca el consentimiento sobre tu respuesta de salud o cambia la respuesta a «No».';
  return e;
}

/** Precio de la clase: prueba si es primera vez; si no, clase suelta (se descuenta si tiene plan o paquete). */
export function precioReserva(primeraVez: boolean): number {
  return primeraVez ? PRECIO_PRUEBA : PRECIO_SUELTA;
}

export function descripcionOcurrencia(o: Ocurrencia): string {
  const p = programaDe(o.clase);
  return `${p.nombre} · ${fechaCorta(o.fecha)} · ${o.clase.hora} · ${INSTRUCTORAS[o.clase.instructora].nombre} · ${NIVELES[p.nivel]}`;
}

/** Mensaje de WhatsApp: no incluye ningún dato de salud (ni siquiera el sí/no); mismo texto para todas las personas. */
export function mensajeReserva(d: DatosReserva): string {
  const o = buscarOcurrencia(d.ocurrencia)!;
  const p = programaDe(o.clase);
  return [
    'Hola Pulso Studio, quiero reservar una clase (demo).',
    `Clase: ${p.nombre} (${NIVELES[p.nivel]})`,
    `Día y hora: ${fechaCorta(o.fecha)}, ${o.clase.hora}`,
    `Nombre: ${d.nombre.replace(/\s+/g, ' ').trim()}`,
    `Celular: ${limpiarCelular(d.celular)}`,
    d.primeraVez === 'si' ? 'Primera vez: sí, quiero la clase de prueba.' : 'Primera vez: no.',
    'Cualquier detalle de salud lo comento en persona con la instructora.',
  ].join('\n');
}

export function urlWhatsApp(texto: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
}
