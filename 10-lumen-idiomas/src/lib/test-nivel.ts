/** Test de nivel referencial: 12 preguntas propias de gramática y vocabulario, de A1 a C1. */
export type Nivel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export const NIVELES: readonly Nivel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

/** Puntos por acierto según la dificultad de la pregunta. */
export const PESO: Record<Nivel, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };

export interface Pregunta {
  id: number;
  nivel: Nivel;
  tipo: 'Gramática' | 'Vocabulario';
  enunciado: string;
  opciones: readonly [string, string, string, string];
  correcta: 0 | 1 | 2 | 3;
}

export const PREGUNTAS: readonly Pregunta[] = [
  { id: 1, nivel: 'A1', tipo: 'Gramática', enunciado: 'My sister ___ a teacher in a school near our house.', opciones: ['am', 'are', 'is', 'be'], correcta: 2 },
  { id: 2, nivel: 'A1', tipo: 'Vocabulario', enunciado: 'I usually ___ a shower before breakfast.', opciones: ['make', 'do', 'play', 'take'], correcta: 3 },
  { id: 3, nivel: 'A2', tipo: 'Gramática', enunciado: 'Yesterday we ___ to the market with my grandmother.', opciones: ['go', 'goes', 'gone', 'went'], correcta: 3 },
  { id: 4, nivel: 'A2', tipo: 'Gramática', enunciado: 'My brother is ___ than me, but I am faster.', opciones: ['taller', 'more tall', 'tallest', 'tall'], correcta: 0 },
  { id: 5, nivel: 'B1', tipo: 'Gramática', enunciado: 'If it rains tomorrow, we ___ at home and watch a film.', opciones: ['staying', 'stayed', 'would stay', 'will stay'], correcta: 3 },
  { id: 6, nivel: 'B1', tipo: 'Gramática', enunciado: 'They have lived in Lima ___ 2015.', opciones: ['for', 'since', 'from', 'during'], correcta: 1 },
  { id: 7, nivel: 'B1', tipo: 'Vocabulario', enunciado: 'The meeting was ___ until next week because the manager was ill.', opciones: ['prepared', 'promised', 'postponed', 'produced'], correcta: 2 },
  { id: 8, nivel: 'B2', tipo: 'Gramática', enunciado: 'If I ___ more free time, I would learn another language.', opciones: ['had', 'have', 'would have', 'having'], correcta: 0 },
  { id: 9, nivel: 'B2', tipo: 'Gramática', enunciado: 'She suggested ___ a taxi because it was already very late.', opciones: ['to take', 'take', 'took', 'taking'], correcta: 3 },
  { id: 10, nivel: 'B2', tipo: 'Vocabulario', enunciado: 'He decided to ___ the job offer because the salary was too low.', opciones: ['turn up', 'turn down', 'turn on', 'turn over'], correcta: 1 },
  { id: 11, nivel: 'C1', tipo: 'Gramática', enunciado: 'Had I known about the strike, I ___ the day before.', opciones: ['would leave', 'left', 'would have left', 'had left'], correcta: 2 },
  { id: 12, nivel: 'C1', tipo: 'Vocabulario', enunciado: 'Smartphones have become so ___ that it is hard to find someone without one.', opciones: ['unique', 'ubiquitous', 'uniform', 'unanimous'], correcta: 1 },
];

export const PUNTOS_MAXIMOS = PREGUNTAS.reduce((s, p) => s + PESO[p.nivel], 0);

/** Cada nivel se alcanza desde este puntaje mínimo (sobre PUNTOS_MAXIMOS = 37). */
export const UMBRALES: ReadonlyArray<{ nivel: Nivel; desde: number }> = [
  { nivel: 'C1', desde: 32 },
  { nivel: 'B2', desde: 23 },
  { nivel: 'B1', desde: 13 },
  { nivel: 'A2', desde: 6 },
  { nivel: 'A1', desde: 0 },
];

export interface ResultadoTest {
  puntos: number;
  maximo: number;
  aciertos: number;
  total: number;
  nivel: Nivel;
  porNivel: Record<Nivel, { aciertos: number; total: number }>;
  /** true si los aciertos son muy desparejos entre niveles (p. ej. aciertos en C1 pero ninguno en B2): puede haber sido azar. */
  irregular: boolean;
}

/** Hay irregularidad si un nivel superior tiene, en proporción, 50 puntos porcentuales o más de aciertos que uno inferior. */
export function esIrregular(porNivel: ResultadoTest['porNivel']): boolean {
  const r = NIVELES.map((n) => porNivel[n].aciertos / porNivel[n].total);
  for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) if (r[j] - r[i] >= 0.5) return true;
  return false;
}

export function nivelDesdePuntos(puntos: number): Nivel {
  return (UMBRALES.find((u) => puntos >= u.desde) ?? UMBRALES[UMBRALES.length - 1]).nivel;
}

/**
 * `respuestas[i]` es el índice elegido (0-3) para PREGUNTAS[i], o null si quedó sin responder.
 * Una pregunta sin responder o con un índice inválido cuenta como fallo.
 */
export function calcularResultado(respuestas: ReadonlyArray<number | null>): ResultadoTest {
  const porNivel = Object.fromEntries(NIVELES.map((n) => [n, { aciertos: 0, total: 0 }])) as ResultadoTest['porNivel'];
  let puntos = 0;
  let aciertos = 0;
  PREGUNTAS.forEach((p, i) => {
    porNivel[p.nivel].total++;
    if (respuestas[i] === p.correcta) {
      puntos += PESO[p.nivel];
      aciertos++;
      porNivel[p.nivel].aciertos++;
    }
  });
  return { puntos, maximo: PUNTOS_MAXIMOS, aciertos, total: PREGUNTAS.length, nivel: nivelDesdePuntos(puntos), porNivel, irregular: esIrregular(porNivel) };
}

export function todasRespondidas(respuestas: ReadonlyArray<number | null>): boolean {
  return PREGUNTAS.every((_, i) => typeof respuestas[i] === 'number');
}

/** Qué suele describir cada nivel (orientativo; no mide expresión oral). */
export const DESCRIPCION_NIVEL: Record<Nivel, string> = {
  A1: 'Suele corresponder a quien empieza: frases muy básicas para presentarse y hablar del día a día.',
  A2: 'Suele corresponder a un nivel básico: situaciones cotidianas, pasado y planes sencillos.',
  B1: 'Suele corresponder a un nivel intermedio: experiencias, opiniones y situaciones de viaje o trabajo.',
  B2: 'Suele corresponder a un nivel intermedio alto: textos y conversaciones más largos, con argumentos.',
  C1: 'Suele corresponder a un nivel avanzado: uso preciso del idioma en temas complejos.',
};
