import { limpiarCelular, normalizarTexto, validarCelular, validarNombre } from './validar';

export const ZONA = 'America/Lima';
export const WHATSAPP = '51900000000';
export const MAX_PERSONAS = 8;
export const MAX_DIAS_ADELANTE = 90;
/** La última reserva se toma 1 hora antes del cierre del turno. */
export const MINUTOS_ANTES_CIERRE = 60;
export const PASO_MINUTOS = 30;

export type TipoReserva = 'mesa' | 'omakase';
/** Omakase: barra de 8 asientos, martes a sábado, dos turnos, con 48 h de anticipación. */
export const OMAKASE_HORAS = ['19:00', '21:30'];
export const OMAKASE_DIAS = [2, 3, 4, 5, 6];
export const OMAKASE_ANTICIPACION_HORAS = 48;
export const OMAKASE_ASIENTOS = 8;

export type Turno = { abre: string; cierra: string };

const ALMUERZO_Y_CENA: Turno[] = [
  { abre: '12:30', cierra: '16:00' },
  { abre: '19:00', cierra: '23:00' },
];

/** Horario de atención por día de la semana (0 = domingo). Lunes cerrado. */
export const HORARIO: Record<number, Turno[]> = {
  0: [{ abre: '12:30', cierra: '17:00' }],
  1: [],
  2: ALMUERZO_Y_CENA,
  3: ALMUERZO_Y_CENA,
  4: ALMUERZO_Y_CENA,
  5: ALMUERZO_Y_CENA,
  6: ALMUERZO_Y_CENA,
};

export const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

export function aMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function deMinutos(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

/** Fecha y hora actuales en Lima, sin depender de la zona del navegador. */
export function ahoraLima(now: Date = new Date()): { fecha: string; minutos: number } {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const g = (t: string) => partes.find((p) => p.type === t)!.value;
  return { fecha: `${g('year')}-${g('month')}-${g('day')}`, minutos: Number(g('hour')) * 60 + Number(g('minute')) };
}

export function hoyLima(now: Date = new Date()): string {
  return ahoraLima(now).fecha;
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

export function fechaMaxima(now: Date = new Date()): string {
  return sumarDias(hoyLima(now), MAX_DIAS_ADELANTE);
}

/** Fecha mínima del selector según el tipo de reserva (hoy en Lima; omakase: hoy + 2 días). */
export function fechaMinima(tipo: TipoReserva, now: Date = new Date()): string {
  return tipo === 'omakase' ? sumarDias(hoyLima(now), OMAKASE_ANTICIPACION_HORAS / 24) : hoyLima(now);
}

/** ¿Esa fecha y hora (de Lima) ya pasaron respecto de `now`? */
function pasoLaHora(fecha: string, hora: string, now: Date): boolean {
  const a = ahoraLima(now);
  return fecha < a.fecha || (fecha === a.fecha && aMinutos(hora) <= a.minutos);
}

/** Minutos que faltan, desde `now` y en hora de Lima, para una fecha y hora de Lima. */
export function minutosHasta(fecha: string, hora: string, now: Date): number {
  const a = ahoraLima(now);
  const dias = (Date.parse(`${fecha}T00:00:00Z`) - Date.parse(`${a.fecha}T00:00:00Z`)) / 86400000;
  return dias * 1440 + aMinutos(hora) - a.minutos;
}

/** Horas reservables de una fecha. Mesa: cada 30 min hasta 1 h antes del cierre de cada turno. */
export function horasDisponibles(fecha: string, now?: Date, tipo: TipoReserva = 'mesa'): string[] {
  if (!esFechaValida(fecha)) return [];
  let horas: string[] = [];
  if (tipo === 'omakase') {
    if (OMAKASE_DIAS.includes(diaSemana(fecha))) horas = [...OMAKASE_HORAS];
  } else {
    for (const t of HORARIO[diaSemana(fecha)] ?? []) {
      const ultima = aMinutos(t.cierra) - MINUTOS_ANTES_CIERRE;
      for (let m = aMinutos(t.abre); m <= ultima; m += PASO_MINUTOS) horas.push(deMinutos(m));
    }
  }
  if (now) horas = horas.filter((h) => !pasoLaHora(fecha, h, now));
  if (now && tipo === 'omakase') horas = horas.filter((h) => minutosHasta(fecha, h, now) >= OMAKASE_ANTICIPACION_HORAS * 60);
  return horas;
}

export function descripcionReservas(fecha: string, tipo: TipoReserva = 'mesa'): string {
  if (tipo === 'omakase') return OMAKASE_HORAS.join(' y ');
  const turnos = HORARIO[diaSemana(fecha)] ?? [];
  return turnos.map((t) => `${t.abre} a ${deMinutos(aMinutos(t.cierra) - MINUTOS_ANTES_CIERRE)}`).join(' y ');
}

export type DatosReserva = {
  fecha: string; hora: string; personas: string | number; nombre: string;
  celular: string; ocasion?: string; alergias?: string;
  tipo?: TipoReserva; consentimiento?: boolean;
};
export type Errores = Partial<Record<'fecha' | 'hora' | 'personas' | 'nombre' | 'celular' | 'ocasion' | 'alergias' | 'consentimiento', string>>;

export function validarFecha(fecha: string, now: Date = new Date(), tipo: TipoReserva = 'mesa'): string | null {
  if (!fecha) return 'Elige una fecha.';
  if (!esFechaValida(fecha)) return 'La fecha no es válida.';
  if (fecha < hoyLima(now)) return 'La fecha ya pasó. Elige hoy o un día posterior.';
  if (fecha > fechaMaxima(now)) return `Solo tomamos reservas con hasta ${MAX_DIAS_ADELANTE} días de anticipación.`;
  if (diaSemana(fecha) === 1) return 'Los lunes estamos cerrados. Elige de martes a domingo.';
  if (tipo === 'omakase') {
    if (!OMAKASE_DIAS.includes(diaSemana(fecha))) return 'El omakase se sirve de martes a sábado.';
    if (fecha < fechaMinima('omakase', now)) return `El omakase se reserva con ${OMAKASE_ANTICIPACION_HORAS} horas de anticipación.`;
  }
  return null;
}

export function validarHora(fecha: string, hora: string, now: Date = new Date(), tipo: TipoReserva = 'mesa'): string | null {
  if (!hora) return 'Elige una hora.';
  if (!/^\d{2}:\d{2}$/.test(hora)) return 'La hora no es válida.';
  if (validarFecha(fecha, now, tipo)) return 'Primero elige una fecha válida.';
  if (!horasDisponibles(fecha, undefined, tipo).includes(hora)) {
    return `A las ${hora} no tomamos reservas ese día. Reservas: ${descripcionReservas(fecha, tipo)}.`;
  }
  if (pasoLaHora(fecha, hora, now)) return 'Esa hora ya pasó. Elige una más tarde.';
  if (tipo === 'omakase' && minutosHasta(fecha, hora, now) < OMAKASE_ANTICIPACION_HORAS * 60) {
    return `El omakase se reserva con ${OMAKASE_ANTICIPACION_HORAS} horas de anticipación. Elige un turno más adelante.`;
  }
  return null;
}

export function validarPersonas(p: string | number): string | null {
  const t = String(p ?? '').trim();
  if (!t) return 'Indica cuántas personas serán.';
  if (!/^\d+$/.test(t)) return 'Escribe un número entero de personas.';
  const n = Number(t);
  if (n < 1) return 'Debe haber al menos 1 persona.';
  if (n > MAX_PERSONAS) return `Para grupos de más de ${MAX_PERSONAS} personas armamos la mesa a medida por WhatsApp.`;
  return null;
}

export function validarReserva(d: DatosReserva, now: Date = new Date()): { ok: boolean; errores: Errores } {
  const errores: Errores = {};
  const set = (k: keyof Errores, m: string | null) => { if (m) errores[k] = m; };
  const tipo = d.tipo ?? 'mesa';
  set('fecha', validarFecha(d.fecha, now, tipo));
  set('hora', validarHora(d.fecha, d.hora, now, tipo));
  set('personas', validarPersonas(d.personas));
  set('nombre', validarNombre(d.nombre));
  set('celular', validarCelular(d.celular));
  if (normalizarTexto(d.ocasion ?? '').length > 60) errores.ocasion = 'Máximo 60 caracteres.';
  if (normalizarTexto(d.alergias ?? '').length > 300) errores.alergias = 'Máximo 300 caracteres.';
  if (!d.consentimiento) errores.consentimiento = 'Marca la casilla para autorizar el uso de tus datos, incluidas las alergias.';
  return { ok: Object.keys(errores).length === 0, errores };
}

export function formatearFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number);
  return `${DIAS[diaSemana(fecha)]} ${d} de ${MESES[m - 1]} de ${y}`;
}

export function mensajeWhatsApp(d: DatosReserva): string {
  const lineas = [
    d.tipo === 'omakase' ? 'Hola Kuro, quisiera reservar el omakase en la barra (demo):' : 'Hola Kuro, quisiera reservar una mesa (demo):',
    `Nombre: ${normalizarTexto(d.nombre)}`,
    `Fecha: ${formatearFecha(d.fecha)}`,
    `Hora: ${d.hora}`,
    `Personas: ${d.personas}`,
    `Celular: ${limpiarCelular(d.celular)}`,
  ];
  if (normalizarTexto(d.ocasion ?? '')) lineas.push(`Ocasión: ${normalizarTexto(d.ocasion!)}`);
  if (normalizarTexto(d.alergias ?? '')) lineas.push(`Alergias: ${normalizarTexto(d.alergias!)}`);
  return lineas.join('\n');
}

export function urlWhatsApp(texto: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
}

export const MENSAJE_GRUPOS = 'Hola Kuro, quisiera cotizar una mesa para un grupo de más de 8 personas.';
