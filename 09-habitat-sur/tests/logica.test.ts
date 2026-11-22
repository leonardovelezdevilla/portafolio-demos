import { describe, expect, it } from 'vitest';
import { cuotaFrancesa, cuotaInicialMinima, simular, tasaMensual, validarSimulador } from '../src/lib/hipoteca';
import { CRITERIOS_VACIOS, aParametros, desdeParametros, filtrar, hayFiltros } from '../src/lib/filtros';
import { aISO, fechaMinima, franjasDelDia, mensajeWhatsApp, parseFecha, urlWhatsApp, validarVisita, type Visita } from '../src/lib/visita';
import { departamentos } from '../src/data/departamentos';
import { aDolares, soles } from '../src/lib/formato';

describe('cuota por método francés', () => {
  it('caso conocido: S/ 100 000, 1 % mensual, 30 años = 1 028,61', () => {
    const tea = (Math.pow(1.01, 12) - 1) * 100; // 12,6825 % anual
    expect(cuotaFrancesa(100000, tea, 30)).toBeCloseTo(1028.61, 2);
  });
  it('caso conocido: 0,5 % mensual, 20 años, S/ 200 000 = 1 432,86', () => {
    const tea = (Math.pow(1.005, 12) - 1) * 100;
    expect(cuotaFrancesa(200000, tea, 20)).toBeCloseTo(1432.86, 2);
  });
  it('con tasa 0 reparte en partes iguales', () => {
    expect(cuotaFrancesa(120000, 0, 10)).toBeCloseTo(1000, 6);
  });
  it('convierte TEA a tasa mensual efectiva', () => {
    expect(tasaMensual(12.682503013196977)).toBeCloseTo(0.01, 9);
  });
  it('monto o plazo inválidos devuelven 0', () => {
    expect(cuotaFrancesa(0, 10, 20)).toBe(0);
    expect(cuotaFrancesa(100000, 10, 0)).toBe(0);
  });
  it('la suma de cuotas supera el monto cuando hay interés', () => {
    const r = simular({ precio: 400000, inicial: 40000, plazoAnios: 20, teaPct: 10 });
    expect(r.financiado).toBe(360000);
    expect(r.meses).toBe(240);
    expect(r.totalPagado).toBeGreaterThan(360000);
    expect(r.interesesTotales).toBeCloseTo(r.totalPagado - 360000, 6);
  });
});

describe('validación del simulador', () => {
  const ok = { precio: 400000, inicial: 40000, plazoAnios: 20, teaPct: 10 };
  it('acepta una entrada válida', () => expect(validarSimulador(ok)).toEqual({}));
  it('la cuota inicial mínima es el 10 %', () => {
    expect(cuotaInicialMinima(372000)).toBe(37200);
    expect(validarSimulador({ ...ok, inicial: 39999 }).inicial).toMatch(/10 %/);
  });
  it('rechaza inicial igual o mayor al precio', () => expect(validarSimulador({ ...ok, inicial: 400000 }).inicial).toBeDefined());
  it('rechaza plazo fuera de rango o decimal', () => {
    expect(validarSimulador({ ...ok, plazoAnios: 4 }).plazo).toBeDefined();
    expect(validarSimulador({ ...ok, plazoAnios: 31 }).plazo).toBeDefined();
    expect(validarSimulador({ ...ok, plazoAnios: 12.5 }).plazo).toBeDefined();
  });
  it('rechaza TEA fuera de rango o NaN', () => {
    expect(validarSimulador({ ...ok, teaPct: 0 }).tea).toBeDefined();
    expect(validarSimulador({ ...ok, teaPct: NaN }).tea).toBeDefined();
  });
  it('rechaza precio sobre el tope de ejemplo y lo marca en el precio, no en la inicial', () => {
    const e = validarSimulador({ ...ok, precio: 99_999_999_999, inicial: 40000 });
    expect(e.precio).toMatch(/5 000 000/);
    expect(e.inicial).toBeUndefined();
    expect(validarSimulador({ ...ok, precio: 5_000_000, inicial: 1_000_000 })).toEqual({});
  });
  it('rechaza precio vacío', () => expect(validarSimulador({ ...ok, precio: NaN }).precio).toBeDefined());
});

describe('filtros del listado', () => {
  it('sin criterios devuelve todo', () => expect(filtrar(departamentos, CRITERIOS_VACIOS)).toHaveLength(departamentos.length));
  it('filtra por distrito', () => {
    const r = filtrar(departamentos, { ...CRITERIOS_VACIOS, distrito: 'Chorrillos' });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((d) => d.distrito === 'Chorrillos')).toBe(true);
  });
  it('dormitorios significa n o más', () => {
    const r = filtrar(departamentos, { ...CRITERIOS_VACIOS, dormitorios: 3 });
    expect(r.every((d) => d.dormitorios >= 3)).toBe(true);
  });
  it('precio máximo, área mínima y etapa se combinan', () => {
    const r = filtrar(departamentos, { ...CRITERIOS_VACIOS, precioMax: 450000, areaMin: 60, etapa: 'en construcción' });
    expect(r.every((d) => d.precio <= 450000 && d.area >= 60 && d.etapa === 'en construcción')).toBe(true);
  });
  it('ordena por precio sin mutar la lista original', () => {
    const antes = departamentos.map((d) => d.slug).join();
    const r = filtrar(departamentos, { ...CRITERIOS_VACIOS, orden: 'precio-asc' });
    expect(r.map((d) => d.precio)).toEqual([...r.map((d) => d.precio)].sort((a, b) => a - b));
    expect(departamentos.map((d) => d.slug).join()).toBe(antes);
  });
  it('una combinación imposible devuelve vacío', () => {
    expect(filtrar(departamentos, { ...CRITERIOS_VACIOS, precioMax: 100000 })).toEqual([]);
  });
  it('URL compartible: ida y vuelta', () => {
    const c = { ...CRITERIOS_VACIOS, distrito: 'Chorrillos', dormitorios: 2, precioMax: 700000, orden: 'precio-desc' as const };
    const p = aParametros(c);
    expect(p.toString()).toBe('distrito=Chorrillos&dormitorios=2&precioMax=700000&orden=precio-desc');
    expect(desdeParametros(new URLSearchParams(p.toString()))).toEqual(c);
  });
  it('ignora parámetros inválidos o maliciosos', () => {
    const c = desdeParametros(new URLSearchParams('distrito=<script>&dormitorios=-1&precioMax=abc&areaMin=1e9&etapa=x&orden=zzz'));
    expect(c).toEqual(CRITERIOS_VACIOS);
    expect(hayFiltros(c)).toBe(false);
  });
});

describe('agenda de visita', () => {
  const hoy = new Date(2026, 10, 20, 9); // viernes 20-nov-2026
  const base: Visita = { departamento: 'Morro Solar 502', fecha: '2026-11-23', franja: 'manana', nombre: 'Ana Quispe', consentimiento: true };
  it('acepta una visita válida', () => expect(validarVisita(base, hoy)).toEqual({}));
  it('fecha mínima es mañana', () => expect(fechaMinima(hoy)).toBe('2026-11-21'));
  it('rechaza el mismo día y fechas pasadas', () => {
    expect(validarVisita({ ...base, fecha: '2026-11-20' }, hoy).fecha).toBeDefined();
    expect(validarVisita({ ...base, fecha: '2026-11-01' }, hoy).fecha).toBeDefined();
  });
  it('rechaza domingos y fechas muy lejanas', () => {
    expect(validarVisita({ ...base, fecha: '2026-11-22' }, hoy).fecha).toMatch(/domingo/);
    expect(validarVisita({ ...base, fecha: '2027-03-01' }, hoy).fecha).toBeDefined();
  });
  it('los sábados solo hay mañana', () => {
    expect(franjasDelDia(parseFecha('2026-11-21')!).map((f) => f.id)).toEqual(['manana']);
    expect(validarVisita({ ...base, fecha: '2026-11-21', franja: 'tarde' }, hoy).franja).toBeDefined();
  });
  it('exige nombre y apellido y consentimiento (ya no pide celular)', () => {
    const e = validarVisita({ ...base, nombre: 'Ana', consentimiento: false }, hoy);
    expect(Object.keys(e).sort()).toEqual(['consentimiento', 'nombre']);
  });
  it('fechas inexistentes no pasan', () => expect(parseFecha('2026-02-30')).toBeNull());
  it('arma el enlace wa.me codificado', () => {
    const u = urlWhatsApp(mensajeWhatsApp(base, 'Morro Solar 502'));
    expect(u.startsWith('https://wa.me/51935852637?text=')).toBe(true);
    expect(decodeURIComponent(u.split('text=')[1])).toContain('Morro Solar 502');
    expect(u).not.toContain(' ');
  });
  it('el mensaje de WhatsApp no repite el celular del cliente', () => {
    const t = mensajeWhatsApp(base, 'Morro Solar 502');
    expect(t).not.toMatch(/celular/i);
    expect(Object.keys(base)).not.toContain('telefono');
    expect(t).toContain(base.nombre.trim());
  });
  it('aISO usa fecha local', () => expect(aISO(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05'));
});

describe('datos y formato', () => {
  it('slugs únicos y precios coherentes', () => {
    expect(new Set(departamentos.map((d) => d.slug)).size).toBe(departamentos.length);
    expect(departamentos.length).toBeGreaterThanOrEqual(10);
  });
  it('convierte a dólares con tipo de cambio fijo', () => expect(aDolares(375000)).toBe(100000));
  it('formatea soles en es-PE', () => expect(soles(372000)).toMatch(/S\/\s?372,000/));
});
