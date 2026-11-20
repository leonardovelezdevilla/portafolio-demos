import { describe, expect, it } from 'vitest';
import {
  NIVELES,
  PESO,
  PREGUNTAS,
  PUNTOS_MAXIMOS,
  calcularResultado,
  nivelDesdePuntos,
  todasRespondidas,
  esIrregular,
} from '../src/lib/test-nivel';

const todasCorrectas = PREGUNTAS.map((p) => p.correcta as number);

describe('banco de preguntas', () => {
  it('tiene 12 preguntas, 4 opciones y una correcta válida cada una', () => {
    expect(PREGUNTAS).toHaveLength(12);
    for (const p of PREGUNTAS) {
      expect(p.opciones).toHaveLength(4);
      expect(new Set(p.opciones).size).toBe(4);
      expect([0, 1, 2, 3]).toContain(p.correcta);
    }
  });
  it('cubre los cinco niveles y suma 37 puntos', () => {
    expect(new Set(PREGUNTAS.map((p) => p.nivel))).toEqual(new Set(NIVELES));
    expect(PUNTOS_MAXIMOS).toBe(37);
  });
  it('mezcla gramática y vocabulario y reparte la respuesta correcta', () => {
    expect(new Set(PREGUNTAS.map((p) => p.tipo)).size).toBe(2);
    expect(new Set(PREGUNTAS.map((p) => p.correcta)).size).toBe(4);
  });
});

describe('puntaje y nivel', () => {
  it('todo correcto da el máximo y C1', () => {
    const r = calcularResultado(todasCorrectas);
    expect(r.puntos).toBe(37);
    expect(r.aciertos).toBe(12);
    expect(r.nivel).toBe('C1');
  });
  it('todo en blanco o todo mal da 0 puntos y A1', () => {
    expect(calcularResultado(Array(12).fill(null))).toMatchObject({ puntos: 0, nivel: 'A1' });
    const mal = PREGUNTAS.map((p) => (p.correcta + 1) % 4);
    expect(calcularResultado(mal)).toMatchObject({ puntos: 0, aciertos: 0, nivel: 'A1' });
  });
  it('un índice inválido cuenta como fallo', () => {
    const r = calcularResultado(PREGUNTAS.map(() => 9));
    expect(r.puntos).toBe(0);
  });
  it('los fronteras de nivel son exactas', () => {
    const casos: Array<[number, string]> = [
      [0, 'A1'], [5, 'A1'], [6, 'A2'], [12, 'A2'], [13, 'B1'], [22, 'B1'], [23, 'B2'], [31, 'B2'], [32, 'C1'], [37, 'C1'],
    ];
    for (const [p, n] of casos) expect(nivelDesdePuntos(p)).toBe(n);
  });
  it('acertar solo A1 y A2 da A2 y solo A1 da A1', () => {
    const soloBasicas = PREGUNTAS.map((p) => (PESO[p.nivel] <= 2 ? p.correcta : null));
    expect(calcularResultado(soloBasicas)).toMatchObject({ puntos: 6, nivel: 'A2' });
    const soloA1 = PREGUNTAS.map((p) => (p.nivel === 'A1' ? p.correcta : null));
    expect(calcularResultado(soloA1)).toMatchObject({ puntos: 2, nivel: 'A1' });
  });
  it('un C1 perfecto con fallos en B1 y B2 no alcanza C1', () => {
    const r = calcularResultado(PREGUNTAS.map((p) => (p.nivel === 'B1' || p.nivel === 'B2' ? null : p.correcta)));
    expect(r.puntos).toBe(1 + 1 + 2 + 2 + 5 + 5 - 0);
    expect(r.nivel).toBe('B1');
  });
  it('desglosa por nivel', () => {
    const r = calcularResultado(todasCorrectas);
    expect(r.porNivel.B1).toEqual({ aciertos: 3, total: 3 });
    expect(r.porNivel.C1).toEqual({ aciertos: 2, total: 2 });
  });
  it('el nivel nunca baja al acertar una pregunta más', () => {
    const orden = NIVELES;
    for (let i = 0; i < 12; i++) {
      const base = todasCorrectas.map((c, j) => (j < i ? c : null));
      const mas = todasCorrectas.map((c, j) => (j <= i ? c : null));
      expect(orden.indexOf(calcularResultado(mas).nivel)).toBeGreaterThanOrEqual(orden.indexOf(calcularResultado(base).nivel));
    }
  });
});

describe('calidad de las preguntas', () => {
  it('«No lo sé» (-1) cuenta como fallo y no rompe el puntaje', () => {
    expect(calcularResultado(PREGUNTAS.map(() => -1))).toMatchObject({ puntos: 0, nivel: 'A1' });
  });
  it('las preguntas 2 y 5 tienen una sola respuesta natural', () => {
    expect(PREGUNTAS[1].opciones.join(',')).not.toMatch(/have/);
    expect(PREGUNTAS[4].opciones[PREGUNTAS[4].correcta]).toBe('will stay');
    expect(PREGUNTAS[4].opciones).not.toContain('stay');
  });
});

describe('resultado irregular', () => {
  it('aciertos solo en C1 con fallos en B2 es irregular', () => {
    const r = calcularResultado(PREGUNTAS.map((p) => (p.nivel === 'C1' || p.nivel === 'A1' ? p.correcta : null)));
    expect(r.irregular).toBe(true);
  });
  it('un resultado parejo no lo es', () => {
    expect(calcularResultado(todasCorrectas).irregular).toBe(false);
    expect(calcularResultado(Array(12).fill(null)).irregular).toBe(false);
    expect(esIrregular(calcularResultado(todasCorrectas).porNivel)).toBe(false);
  });
});

describe('todasRespondidas', () => {
  it('exige las 12 respuestas', () => {
    expect(todasRespondidas(todasCorrectas)).toBe(true);
    expect(todasRespondidas(todasCorrectas.map((c, i) => (i === 7 ? null : c)))).toBe(false);
    expect(todasRespondidas([0, 1])).toBe(false);
  });
});
