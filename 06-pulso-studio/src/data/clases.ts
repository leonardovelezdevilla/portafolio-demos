/** Datos ficticios del horario semanal de Pulso Studio. */

export type TipoClase = 'reformer' | 'funcional';
export type Nivel = 'inicial' | 'intermedio' | 'avanzado';

export interface Programa {
  clave: string;
  nombre: string;
  tipo: TipoClase;
  nivel: Nivel;
  duracion: number; // minutos
  resumen: string;
}

export interface Instructora { clave: string; nombre: string; }

export interface Clase {
  id: string;
  /** 0 = domingo … 6 = sábado */
  dia: number;
  hora: string;
  programa: string;
  instructora: string;
}

export const TIPOS: Record<TipoClase, { nombre: string; cupos: number; sala: string }> = {
  reformer: { nombre: 'Pilates reformer', cupos: 8, sala: 'Sala Reformer (8 camas)' },
  funcional: { nombre: 'Funcional', cupos: 12, sala: 'Sala Funcional (12 puestos)' },
};

export const NIVELES: Record<Nivel, string> = { inicial: 'Inicial', intermedio: 'Intermedio', avanzado: 'Avanzado' };

export const PROGRAMAS: Record<string, Programa> = {
  base: { clave: 'base', nombre: 'Reformer Base', tipo: 'reformer', nivel: 'inicial', duracion: 50, resumen: 'Técnica, respiración y control del centro. Ideal si es tu primera vez.' },
  flow: { clave: 'flow', nombre: 'Reformer Flow', tipo: 'reformer', nivel: 'intermedio', duracion: 50, resumen: 'Secuencias continuas con resortes medios, con trabajo de fuerza y movilidad.' },
  power: { clave: 'power', nombre: 'Reformer Power', tipo: 'reformer', nivel: 'avanzado', duracion: 55, resumen: 'Más carga y transiciones rápidas. Se pide dominar la técnica base.' },
  fullbody: { clave: 'fullbody', nombre: 'Funcional Full Body', tipo: 'funcional', nivel: 'inicial', duracion: 45, resumen: 'Circuito de cuerpo completo con mancuernas, bandas y peso corporal.' },
  fuerza: { clave: 'fuerza', nombre: 'Funcional Fuerza', tipo: 'funcional', nivel: 'intermedio', duracion: 50, resumen: 'Patrones de empuje, jale y sentadilla con cargas moderadas.' },
  intervalos: { clave: 'intervalos', nombre: 'Funcional Intervalos', tipo: 'funcional', nivel: 'avanzado', duracion: 45, resumen: 'Bloques cortos e intensos con pausas medidas. Cardio y fuerza.' },
};

export const INSTRUCTORAS: Record<string, Instructora> = {
  camila: { clave: 'camila', nombre: 'Camila Rojas' },
  valeria: { clave: 'valeria', nombre: 'Valeria Quispe' },
  daniela: { clave: 'daniela', nombre: 'Daniela Montes' },
  renata: { clave: 'renata', nombre: 'Renata Salas' },
  andrea: { clave: 'andrea', nombre: 'Andrea Paredes' },
};

export const DIAS_NOMBRE = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
/** Orden de presentación: lunes a domingo. */
export const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0];

type Fila = [number[], string, string, string]; // días, hora, programa, instructora

const FILAS: Fila[] = [
  [[1, 3, 5], '06:30', 'flow', 'camila'],
  [[1, 3, 5], '07:30', 'base', 'valeria'],
  [[1, 3, 5], '09:00', 'fullbody', 'andrea'],
  [[1, 3, 5], '18:30', 'fuerza', 'renata'],
  [[1, 3], '19:30', 'power', 'camila'],
  [[5], '19:30', 'base', 'daniela'],
  [[2, 4], '06:30', 'fuerza', 'renata'],
  [[2, 4], '07:30', 'power', 'camila'],
  [[2, 4], '09:00', 'base', 'daniela'],
  [[2], '18:30', 'flow', 'valeria'],
  [[4], '18:30', 'intervalos', 'andrea'],
  [[2, 4], '19:30', 'fullbody', 'andrea'],
  [[6], '08:00', 'base', 'valeria'],
  [[6], '09:15', 'flow', 'camila'],
  [[6], '10:30', 'intervalos', 'renata'],
  [[0], '10:00', 'flow', 'daniela'],
  [[0], '11:15', 'fullbody', 'andrea'],
];

export const CLASES: Clase[] = FILAS.flatMap(([dias, hora, programa, instructora]) =>
  dias.map((dia) => ({ id: `${DIAS_NOMBRE[dia].slice(0, 3).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}-${hora.replace(':', '')}-${programa}`, dia, hora, programa, instructora })),
);
