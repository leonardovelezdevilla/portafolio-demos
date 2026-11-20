// Lógica pura de la reserva: placa peruana, fechas en America/Lima, turnos y cupos simulados.
export const ZONA = 'America/Lima';

// Placas: auto/camioneta ABC-123 o A1B-234 (3 caracteres con al menos una letra + 3 dígitos); moto 1234-AB.
export function normalizarPlaca(texto: string): string {
  return texto.toUpperCase().replace(/[\s-]/g, '');
}

export function placaValida(texto: string): boolean {
  const p = normalizarPlaca(texto);
  if (/^[A-Z0-9]{3}\d{3}$/.test(p)) return /[A-Z]/.test(p.slice(0, 3));
  return /^\d{4}[A-Z]{2}$/.test(p);
}

export function formatearPlaca(texto: string): string {
  const p = normalizarPlaca(texto);
  if (/^\d{4}[A-Z]{2}$/.test(p)) return `${p.slice(0, 4)}-${p.slice(4)}`;
  return `${p.slice(0, 3)}-${p.slice(3)}`;
}

export function celularValido(texto: string): boolean {
  return /^9\d{8}$/.test(texto.replace(/[\s-]/g, ''));
}

// Fecha y hora actuales en Lima a partir de un instante.
export function partesLima(instante: Date) {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const o: Record<string, string> = {};
  for (const p of f.formatToParts(instante)) o[p.type] = p.value;
  return { fecha: `${o.year}-${o.month}-${o.day}`, hora: Number(o.hour), minuto: Number(o.minute) };
}

export function sumarDias(fecha: string, dias: number): string {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

// 0 = domingo ... 6 = sábado
export function diaSemana(fecha: string): number {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}

// Feriados nacionales de fecha fija (los móviles, como Semana Santa, no se incluyen en la demo).
const FERIADOS_FIJOS = ['01-01', '05-01', '06-29', '07-23', '07-28', '07-29', '08-06', '08-30', '10-08', '11-01', '12-08', '12-09', '12-25'];
export function esFeriado(fecha: string): boolean {
  return FERIADOS_FIJOS.includes(fecha.slice(5));
}

export type TurnoId = 'manana' | 'tarde';
export interface TurnoDef {
  id: TurnoId;
  nombre: string;
  horario: string;
  // Hora (Lima) desde la cual ya no se reserva este turno para el mismo día.
  cierraReservaHoy: number;
}

export function turnosDelDia(fecha: string): TurnoDef[] {
  const sabado = diaSemana(fecha) === 6;
  return [
    { id: 'manana', nombre: 'Mañana', horario: 'Ingreso de 8:00 a 12:00', cierraReservaHoy: 7 },
    { id: 'tarde', nombre: 'Tarde', horario: sabado ? 'Ingreso de 14:00 a 16:00' : 'Ingreso de 14:00 a 17:30', cierraReservaHoy: 12 },
  ];
}

export function diaLaborable(fecha: string): boolean {
  return diaSemana(fecha) !== 0 && !esFeriado(fecha);
}

export const CUPOS_POR_TURNO = 6;
export const DIAS_ADELANTE = 21;

// Cupos ocupados simulados: deterministas por fecha y turno (la demo no tiene servidor).
export function cuposOcupados(fecha: string, turno: TurnoId): number {
  let h = 2166136261;
  for (const c of `${fecha}|${turno}`) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % (CUPOS_POR_TURNO + 1);
}

export type EstadoTurno = 'disponible' | 'ultimos' | 'agotado' | 'cerrado';
export interface TurnoEstado extends TurnoDef {
  libres: number;
  estado: EstadoTurno;
}

export function estadoTurno(fecha: string, turno: TurnoDef, ahora: Date): TurnoEstado {
  const hoy = partesLima(ahora);
  const libres = CUPOS_POR_TURNO - cuposOcupados(fecha, turno.id);
  let estado: EstadoTurno = libres === 0 ? 'agotado' : libres <= 2 ? 'ultimos' : 'disponible';
  if (fecha < hoy.fecha || !diaLaborable(fecha)) estado = 'cerrado';
  else if (fecha === hoy.fecha && hoy.hora >= turno.cierraReservaHoy) estado = 'cerrado';
  return { ...turno, libres: estado === 'cerrado' ? 0 : libres, estado };
}

// Próximos días laborables con al menos un turno que aún no cerró (puede estar agotado).
export function diasReservables(ahora: Date, cantidad = DIAS_ADELANTE): string[] {
  const { fecha: hoy } = partesLima(ahora);
  const dias: string[] = [];
  for (let i = 0; i <= cantidad; i++) {
    const f = sumarDias(hoy, i);
    if (!diaLaborable(f)) continue;
    if (turnosDelDia(f).some((t) => estadoTurno(f, t, ahora).estado !== 'cerrado')) dias.push(f);
  }
  return dias;
}

export function fechaLegible(fecha: string): string {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Intl.DateTimeFormat('es-PE', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(Date.UTC(a, m - 1, d)));
}

export function turnoReservable(fecha: string, turno: TurnoId, ahora: Date): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || fecha > sumarDias(partesLima(ahora).fecha, DIAS_ADELANTE)) return false;
  const def = turnosDelDia(fecha).find((t) => t.id === turno);
  if (!def) return false;
  const e = estadoTurno(fecha, def, ahora).estado;
  return e === 'disponible' || e === 'ultimos';
}

// Suma días hábiles (lunes a viernes, sin feriados fijos).
export function sumarDiasHabiles(fecha: string, dias: number): string {
  let f = fecha;
  let n = 0;
  while (n < dias) {
    f = sumarDias(f, 1);
    const d = diaSemana(f);
    if (d !== 0 && d !== 6 && !esFeriado(f)) n++;
  }
  return f;
}

// Bloques de atención del taller en horas decimales (hora de Lima).
function bloques(fecha: string): [number, number][] {
  return diaSemana(fecha) === 6 ? [[8, 13], [14, 16.5]] : [[8, 13], [14, 18]];
}
const hhmm = (h: number) => `${Math.floor(h)}:${h % 1 ? '30' : '00'}`.replace(/^(\d):/, '$1:');

export function estadoApertura(ahora: Date): { abierto: boolean; texto: string } {
  const { fecha, hora, minuto } = partesLima(ahora);
  const t = hora + minuto / 60;
  if (diaLaborable(fecha)) {
    for (const [a, b] of bloques(fecha)) {
      if (t >= a && t < b) return { abierto: true, texto: `Abierto ahora, cierra a las ${hhmm(b)}` };
      if (t < a) return { abierto: false, texto: `Cerrado ahora, abre hoy a las ${hhmm(a)}` };
    }
  }
  let f = sumarDias(fecha, 1);
  while (!diaLaborable(f)) f = sumarDias(f, 1);
  const dia = new Intl.DateTimeFormat('es-PE', { timeZone: 'UTC', weekday: 'long' }).format(new Date(f + 'T00:00:00Z'));
  const manana = f === sumarDias(fecha, 1);
  return { abierto: false, texto: `Cerrado ahora, abre ${manana ? 'mañana' : 'el'} ${dia} a las 8:00` };
}
