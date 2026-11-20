import { describe, it, expect } from 'vitest';
import { calcular, UIT_2026 } from '../src/lib/impuestos';

describe('calcular (4.ª categoría, referencial)', () => {
  it('UIT 2026 es 5 500', () => expect(UIT_2026).toBe(5500));

  it('ingreso 0 → todo en cero', () => {
    const r = calcular({ ingresoMensual: 0, recibosPorMes: 1 });
    expect(r.impuestoAnual).toBe(0);
    expect(r.saldo).toBe(0);
    expect(r.seRetiene).toBe(false);
  });

  it('no retiene si el recibo es exactamente S/ 1 500 (debe superarlo)', () => {
    expect(calcular({ ingresoMensual: 1500, recibosPorMes: 1 }).seRetiene).toBe(false);
    expect(calcular({ ingresoMensual: 1500.01, recibosPorMes: 1 }).seRetiene).toBe(true);
  });

  it('el umbral se evalúa por recibo, no por total mensual', () => {
    const r = calcular({ ingresoMensual: 4000, recibosPorMes: 4 }); // 1 000 c/u
    expect(r.seRetiene).toBe(false);
    expect(r.retencionAnual).toBe(0);
  });

  it('ingreso bajo (S/ 3 000/mes): bajo 7 UIT + 20 % no hay impuesto', () => {
    const r = calcular({ ingresoMensual: 3000, recibosPorMes: 1 });
    // 36 000 - 7 200 - 38 500 < 0
    expect(r.rentaNeta).toBe(0);
    expect(r.impuestoAnual).toBe(0);
    expect(r.retencionAnual).toBe(2880);
    expect(r.saldo).toBe(-2880); // a favor
  });

  it('caso S/ 10 000/mes: renta neta 57 500, impuesto 6 400', () => {
    const r = calcular({ ingresoMensual: 10000, recibosPorMes: 1 });
    expect(r.deduccion20).toBe(24000);
    expect(r.rentaNeta).toBe(57500);
    expect(r.tramos).toHaveLength(2);
    expect(r.impuestoAnual).toBe(2200 + 4200);
    expect(r.retencionAnual).toBe(9600);
    expect(r.saldo).toBe(-3200);
  });

  it('aplica el tope de 24 UIT a la deducción del 20 %', () => {
    const r = calcular({ ingresoMensual: 80000, recibosPorMes: 2 }); // 960 000 anual
    expect(r.deduccion20).toBe(24 * UIT_2026);
    expect(r.rentaNeta).toBe(960000 - 132000 - 38500);
    expect(r.tramos.at(-1)?.tasa).toBe(0.3);
  });

  it('recorre los cinco tramos con una UIT alternativa', () => {
    const r = calcular({ ingresoMensual: 100000, recibosPorMes: 1, uit: 5000 });
    expect(r.tramos.map((t) => t.tasa)).toEqual([0.08, 0.14, 0.17, 0.2, 0.3]);
    const suma = r.tramos.reduce((a, t) => a + t.impuesto, 0);
    expect(Math.abs(suma - r.impuestoAnual)).toBeLessThan(0.05);
  });

  it('entradas inválidas se tratan como 0 / 1 recibo', () => {
    const r = calcular({ ingresoMensual: NaN, recibosPorMes: 0 });
    expect(r.ingresoAnual).toBe(0);
  });
});
