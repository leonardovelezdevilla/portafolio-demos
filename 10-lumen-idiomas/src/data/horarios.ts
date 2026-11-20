import type { Nivel } from '../lib/test-nivel';

export type Modalidad = 'Presencial' | 'Virtual';
export type Publico = 'Jóvenes (12 a 17)' | 'Adultos (18 o más)';
export type Dia = 'Lun' | 'Mar' | 'Mié' | 'Jue' | 'Vie' | 'Sáb';

export interface Grupo {
  id: string;
  nivel: Nivel;
  dias: readonly Dia[];
  inicio: string; // HH:MM, hora de Lima
  fin: string;
  modalidad: Modalidad;
  publico: Publico;
  docente: string; // id en data/docentes
}

/** Capacidad máxima por grupo según modalidad. */
export const CAPACIDAD: Record<Modalidad, number> = { Presencial: 12, Virtual: 18 };

export const CICLO = {
  nombre: 'Ciclo de verano 2027',
  duracion: '8 semanas (24 horas de clase)',
  inicioTexto: 'semana del 14 de diciembre de 2026',
} as const;

const LMV: readonly Dia[] = ['Lun', 'Mié', 'Vie'];
const MJ: readonly Dia[] = ['Mar', 'Jue'];
const S: readonly Dia[] = ['Sáb'];
const J: Publico = 'Jóvenes (12 a 17)';
const A: Publico = 'Adultos (18 o más)';

export const GRUPOS: readonly Grupo[] = [
  { id: 'a1-man', nivel: 'A1', dias: LMV, inicio: '07:00', fin: '08:00', modalidad: 'Presencial', publico: A, docente: 'salas' },
  { id: 'a1-noc', nivel: 'A1', dias: MJ, inicio: '19:00', fin: '20:30', modalidad: 'Virtual', publico: A, docente: 'quiroz' },
  { id: 'a1-sab', nivel: 'A1', dias: S, inicio: '09:00', fin: '12:00', modalidad: 'Presencial', publico: J, docente: 'ibanez' },
  { id: 'a1-tar', nivel: 'A1', dias: LMV, inicio: '16:00', fin: '17:00', modalidad: 'Virtual', publico: J, docente: 'ibanez' },
  { id: 'a2-noc', nivel: 'A2', dias: MJ, inicio: '19:00', fin: '20:30', modalidad: 'Presencial', publico: A, docente: 'salas' },
  { id: 'a2-sab', nivel: 'A2', dias: S, inicio: '14:00', fin: '17:00', modalidad: 'Virtual', publico: A, docente: 'quiroz' },
  { id: 'a2-tar', nivel: 'A2', dias: LMV, inicio: '17:00', fin: '18:00', modalidad: 'Presencial', publico: J, docente: 'ibanez' },
  { id: 'b1-man', nivel: 'B1', dias: LMV, inicio: '08:00', fin: '09:00', modalidad: 'Virtual', publico: A, docente: 'cardenas' },
  { id: 'b1-tar', nivel: 'B1', dias: MJ, inicio: '18:00', fin: '19:30', modalidad: 'Presencial', publico: A, docente: 'cardenas' },
  { id: 'b1-sab', nivel: 'B1', dias: S, inicio: '10:00', fin: '13:00', modalidad: 'Presencial', publico: J, docente: 'salas' },
  { id: 'b2-noc', nivel: 'B2', dias: LMV, inicio: '19:00', fin: '20:00', modalidad: 'Presencial', publico: A, docente: 'cardenas' },
  { id: 'b2-man', nivel: 'B2', dias: MJ, inicio: '07:00', fin: '08:30', modalidad: 'Virtual', publico: A, docente: 'montoya' },
  { id: 'b2-jov', nivel: 'B2', dias: MJ, inicio: '16:30', fin: '18:00', modalidad: 'Virtual', publico: J, docente: 'ibanez' },
  { id: 'c1-jov', nivel: 'C1', dias: MJ, inicio: '17:00', fin: '18:30', modalidad: 'Virtual', publico: J, docente: 'montoya' },
  { id: 'c1-noc', nivel: 'C1', dias: MJ, inicio: '19:30', fin: '21:00', modalidad: 'Presencial', publico: A, docente: 'montoya' },
  { id: 'c1-sab', nivel: 'C1', dias: S, inicio: '09:00', fin: '12:00', modalidad: 'Virtual', publico: A, docente: 'montoya' },
];

export type Turno = 'Mañana' | 'Tarde' | 'Noche';

/** Mañana: antes de 12:00; tarde: de 12:00 a 17:59; noche: desde las 18:00. */
export function turnoDe(inicio: string): Turno {
  const h = Number(inicio.slice(0, 2));
  return h < 12 ? 'Mañana' : h < 18 ? 'Tarde' : 'Noche';
}

export function textoDias(dias: readonly Dia[]): string {
  const largos: Record<Dia, string> = { Lun: 'lunes', Mar: 'martes', Mié: 'miércoles', Jue: 'jueves', Vie: 'viernes', Sáb: 'sábados' };
  const t = dias.map((d) => largos[d]);
  return dias.length === 1 ? t[0] : `${t.slice(0, -1).join(', ')} y ${t[t.length - 1]}`;
}

/** Minutos desde medianoche de «HH:MM». */
export const aMinutos = (hhmm: string): number => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** ¿Dos grupos comparten día y sus horas se pisan? */
export function seSuperponen(a: Pick<Grupo, 'dias' | 'inicio' | 'fin'>, b: Pick<Grupo, 'dias' | 'inicio' | 'fin'>): boolean {
  if (!a.dias.some((d) => b.dias.includes(d))) return false;
  return aMinutos(a.inicio) < aMinutos(b.fin) && aMinutos(b.inicio) < aMinutos(a.fin);
}

export const etiquetaGrupo = (g: Grupo): string =>
  `${g.nivel} · ${textoDias(g.dias)} ${g.inicio} a ${g.fin} · ${g.modalidad}`;
