// Agenda de visita: horarios de ejemplo de la sala de ventas (ficticia).
export const FRANJAS = [
  { id: 'manana', etiqueta: 'Mañana, 10:00 a 13:00', dias: [1, 2, 3, 4, 5, 6] },
  { id: 'tarde', etiqueta: 'Tarde, 15:00 a 18:00', dias: [1, 2, 3, 4, 5] },
] as const;
export const DIAS_ANTICIPACION_MIN = 1;
export const DIAS_ANTICIPACION_MAX = 45;
export const WHATSAPP = '51935852637';

export interface Visita { departamento: string; fecha: string; franja: string; nombre: string; telefono: string; consentimiento: boolean; }
export type ErroresVisita = Partial<Record<'fecha' | 'franja' | 'nombre' | 'telefono' | 'consentimiento', string>>;

/** 'YYYY-MM-DD' a Date local a mediodía (evita saltos de zona horaria). */
export function parseFecha(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
  return d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]) ? d : null;
}
export const aISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const sumarDias = (d: Date, n: number) => { const c = new Date(d); c.setDate(c.getDate() + n); return c; };
export const fechaMinima = (hoy: Date) => aISO(sumarDias(hoy, DIAS_ANTICIPACION_MIN));
export const fechaMaxima = (hoy: Date) => aISO(sumarDias(hoy, DIAS_ANTICIPACION_MAX));
export const franjasDelDia = (fecha: Date) => FRANJAS.filter((f) => (f.dias as readonly number[]).includes(fecha.getDay()));

export function validarVisita(v: Visita, hoy: Date): ErroresVisita {
  const e: ErroresVisita = {};
  const f = parseFecha(v.fecha);
  if (!f) e.fecha = 'Elige un día para la visita.';
  else if (v.fecha < fechaMinima(hoy)) e.fecha = 'Elige un día desde mañana: no agendamos visitas el mismo día ni en fechas pasadas.';
  else if (v.fecha > fechaMaxima(hoy)) e.fecha = `Elige una fecha dentro de los próximos ${DIAS_ANTICIPACION_MAX} días.`;
  else if (f.getDay() === 0) e.fecha = 'La sala de ventas no atiende los domingos. Elige de lunes a sábado.';
  if (!v.franja) e.franja = 'Elige una franja horaria.';
  else if (f && !franjasDelDia(f).some((x) => x.id === v.franja)) e.franja = 'Esa franja no está disponible ese día (los sábados solo hay mañana).';
  const nombre = v.nombre.trim();
  if (nombre.length < 3 || !/\s/.test(nombre)) e.nombre = 'Escribe tu nombre y apellido.';
  if (!/^9\d{8}$/.test(v.telefono.replace(/[\s-]/g, ''))) e.telefono = 'Escribe un celular peruano de 9 dígitos que empiece con 9.';
  if (!v.consentimiento) e.consentimiento = 'Marca la casilla para que usemos tus datos solo para coordinar la visita.';
  return e;
}

export function mensajeWhatsApp(v: Visita, tituloDepto: string): string {
  const f = parseFecha(v.fecha);
  const franja = FRANJAS.find((x) => x.id === v.franja)?.etiqueta ?? v.franja;
  const dia = f ? new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }).format(f) : v.fecha;
  return `Hola, quisiera agendar una visita (demo). Departamento: ${tituloDepto}. Día: ${dia}. Franja: ${franja}. Nombre: ${v.nombre.trim()}. Celular: ${v.telefono.replace(/[\s-]/g, '')}.`;
}
export const urlWhatsApp = (msg: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
