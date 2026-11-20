import { CAPACIDAD, GRUPOS, turnoDe, type Grupo, type Modalidad, type Turno } from '../data/horarios';
import type { Nivel } from './test-nivel';

/** Semilla del ciclo: cambiarla redistribuye las vacantes simuladas, siempre igual para el mismo ciclo. */
export const SEMILLA_CICLO = 'lumen-verano-2027';
/** Con esta cantidad de vacantes o menos se muestra «Últimas N». */
export const UMBRAL_ULTIMAS = 3;

/** Hash FNV-1a de 32 bits → número en [0, 1). */
export function hashUnitario(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h / 0x100000000;
}

export type EstadoVacantes = 'disponible' | 'ultimas' | 'sin-vacantes';

export interface Vacantes {
  capacidad: number;
  ocupadas: number;
  libres: number;
  estado: EstadoVacantes;
  /** Texto visible (no depende solo del color). */
  texto: string;
}

export function estadoDe(libres: number): EstadoVacantes {
  if (libres <= 0) return 'sin-vacantes';
  return libres <= UMBRAL_ULTIMAS ? 'ultimas' : 'disponible';
}

export function textoVacantes(libres: number): string {
  if (libres <= 0) return 'Sin vacantes';
  if (libres <= UMBRAL_ULTIMAS) return libres === 1 ? 'Última vacante' : `Últimas ${libres} vacantes`;
  return `${libres} vacantes`;
}

/** Vacantes simuladas: ocupación entre 35 % y 100 % de la capacidad, determinista por grupo y ciclo. */
export function vacantesDe(g: Pick<Grupo, 'id' | 'modalidad'>, semilla = SEMILLA_CICLO): Vacantes {
  const capacidad = CAPACIDAD[g.modalidad];
  const fraccion = 0.35 + 0.65 * Math.pow(hashUnitario(`${semilla}:${g.id}`), 0.8);
  const ocupadas = Math.min(capacidad, Math.round(capacidad * fraccion));
  const libres = capacidad - ocupadas;
  return { capacidad, ocupadas, libres, estado: estadoDe(libres), texto: textoVacantes(libres) };
}

export interface Filtros {
  nivel?: Nivel | '';
  modalidad?: Modalidad | '';
  turno?: Turno | '';
  soloConVacantes?: boolean;
}

export function filtrarGrupos(grupos: readonly Grupo[], f: Filtros, semilla = SEMILLA_CICLO): Grupo[] {
  return grupos.filter((g) => {
    if (f.nivel && g.nivel !== f.nivel) return false;
    if (f.modalidad && g.modalidad !== f.modalidad) return false;
    if (f.turno && turnoDe(g.inicio) !== f.turno) return false;
    if (f.soloConVacantes && vacantesDe(g, semilla).libres <= 0) return false;
    return true;
  });
}

export const TODOS_LOS_GRUPOS = GRUPOS;
