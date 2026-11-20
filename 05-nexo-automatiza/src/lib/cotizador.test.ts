import { describe, expect, it } from 'vitest';
import { cotizar, enlaceWhatsApp, formatoSoles, mensajeWhatsApp, type EntradaCotizador } from './cotizador';

const base: EntradaCotizador = { tipo: 'retail', procesos: ['whatsapp'], volumen: 'bajo', integraciones: [], urgencia: 'normal' };
const todos = ['whatsapp', 'sheets', 'facturacion', 'inventario', 'reportes'];

describe('cotizar', () => {
  it('un proceso, volumen bajo, sin urgencia: usa el rango base', () => {
    expect(cotizar(base)).toMatchObject({ min: 600, max: 1400, descuento: 0 });
  });

  it('aplica los factores de tipo, volumen y urgencia y redondea a 50', () => {
    const c = cotizar({ ...base, tipo: 'salud', volumen: 'alto', urgencia: 'urgente' });
    // factor = 1.15 * 1.6 * 1.3 = 2.392 -> 600*2.392 = 1435.2 -> 1400 ; 1400*2.392 = 3348.8 -> 3350
    expect(c.min).toBe(1400);
    expect(c.max).toBe(3350);
  });

  it('suma integraciones', () => {
    const c = cotizar({ ...base, integraciones: ['ose', 'agenda'] });
    expect(c.min).toBe(600 + 200 + 150);
    expect(c.max).toBe(1400 + 450 + 300);
  });

  it('descuento por paquete: 2 procesos no, 3 y 4 sí (8 %), 5 (12 %)', () => {
    expect(cotizar({ ...base, procesos: todos.slice(0, 2) }).descuento).toBe(0);
    expect(cotizar({ ...base, procesos: todos.slice(0, 3) }).descuento).toBe(0.08);
    expect(cotizar({ ...base, procesos: todos.slice(0, 4) }).descuento).toBe(0.08);
    expect(cotizar({ ...base, procesos: todos }).descuento).toBe(0.12);
  });

  it('máximo teórico: 5 procesos + 4 integraciones, alto, urgente, salud', () => {
    const c = cotizar({
      tipo: 'salud',
      procesos: todos,
      volumen: 'alto',
      integraciones: ['ose', 'pagos', 'crm', 'agenda'],
      urgencia: 'urgente',
    });
    // min base 3200+900=4100; max base 7500+1900=9400; * 2.392 * 0.88
    expect(c.min).toBe(8600);
    expect(c.max).toBe(19800);
    expect(c.min).toBeLessThanOrEqual(c.max);
  });

  it('el mínimo nunca supera al máximo y ambos son múltiplos de 50', () => {
    for (const tipo of ['retail', 'salud', 'restaurante', 'servicios', 'otro'])
      for (const volumen of ['bajo', 'medio', 'alto'])
        for (const urgencia of ['normal', 'prioritaria', 'urgente']) {
          const c = cotizar({ ...base, tipo, volumen, urgencia, procesos: ['sheets', 'reportes', 'inventario'] });
          expect(c.min).toBeLessThanOrEqual(c.max);
          expect(c.min % 50).toBe(0);
          expect(c.max % 50).toBe(0);
        }
  });

  it('ignora procesos duplicados', () => {
    expect(cotizar({ ...base, procesos: ['whatsapp', 'whatsapp'] })).toEqual(cotizar(base));
  });

  it('calcula el soporte mensual por proceso', () => {
    const c = cotizar({ ...base, procesos: ['whatsapp', 'sheets'] });
    expect(c.soporteMin).toBe(80);
    expect(c.soporteMax).toBe(180);
  });

  it('rechaza entradas vacías o desconocidas', () => {
    expect(() => cotizar({ ...base, procesos: [] })).toThrow(RangeError);
    expect(() => cotizar({ ...base, tipo: '' })).toThrow(RangeError);
    expect(() => cotizar({ ...base, volumen: 'enorme' })).toThrow(RangeError);
    expect(() => cotizar({ ...base, urgencia: 'ya' })).toThrow(RangeError);
    expect(() => cotizar({ ...base, procesos: ['magia'] })).toThrow(RangeError);
    expect(() => cotizar({ ...base, integraciones: ['x'] })).toThrow(RangeError);
  });

  it('es pura: no modifica la entrada', () => {
    const e = { ...base, procesos: ['whatsapp', 'sheets'] };
    const copia = JSON.parse(JSON.stringify(e));
    cotizar(e);
    expect(e).toEqual(copia);
  });
});

describe('formato y WhatsApp', () => {
  it('formatea en soles sin decimales', () => {
    expect(formatoSoles(1200)).toMatch(/^S\/\s?1,?200$/);
  });
  it('arma un enlace wa.me codificado con el resumen', () => {
    const c = cotizar(base);
    const url = enlaceWhatsApp(mensajeWhatsApp(base, c));
    expect(url.startsWith('https://wa.me/51935852637?text=')).toBe(true);
    const texto = decodeURIComponent(url.split('?text=')[1]);
    expect(texto).toContain('Tienda o comercio');
    expect(texto).toContain('Atención y avisos por WhatsApp');
    expect(texto).toContain('Rango referencial');
  });
});
