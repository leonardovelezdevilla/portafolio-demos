import { describe, expect, it } from 'vitest';
import { CLASES } from '../data/clases';
import {
  ahoraLima, buscarOcurrencia, cuposDe, cuposOcupados, cuposTotales, diaSemana, esFechaValida, estadoCupos, fechaCorta,
  mensajeReserva, minutosHasta, ocurrenciasReservables, precioReserva, proximaOcurrencia, reservaCerrada, sumarDias, urlWhatsApp,
  validarReserva, type DatosReserva,
} from './horario';
import { PAQUETES, PLANES_MENSUALES, PRECIO_PRUEBA, PRECIO_SUELTA } from '../data/planes';
import { ahorroFrenteASuelta, baseSinIGV, montoIGV, precioPorClase, soles } from './precios';

// Miércoles 25 nov 2026, 10:00 en Lima = 15:00 UTC.
const AHORA = new Date('2026-11-25T15:00:00Z');

describe('fechas en America/Lima', () => {
  it('usa la fecha de Lima y no la UTC', () => {
    expect(ahoraLima(new Date('2026-11-26T02:00:00Z'))).toEqual({ fecha: '2026-11-25', minutos: 21 * 60 });
    expect(ahoraLima(AHORA)).toEqual({ fecha: '2026-11-25', minutos: 600 });
  });
  it('valida fechas reales', () => {
    expect(esFechaValida('2026-02-29')).toBe(false);
    expect(esFechaValida('2026-11-31')).toBe(false);
    expect(esFechaValida('2026-12-31')).toBe(true);
    expect(esFechaValida('25/11/2026')).toBe(false);
  });
  it('calcula día de semana y suma de días', () => {
    expect(diaSemana('2026-11-25')).toBe(3);
    expect(sumarDias('2026-12-30', 3)).toBe('2027-01-02');
    expect(fechaCorta('2026-11-25')).toBe('mié 25 nov');
  });
  it('minutos hasta una hora de Lima', () => {
    expect(minutosHasta('2026-11-25', '11:00', AHORA)).toBe(60);
    expect(minutosHasta('2026-11-26', '06:30', AHORA)).toBe(1440 - 600 + 390);
    expect(minutosHasta('2026-11-25', '06:30', AHORA)).toBeLessThan(0);
  });
});

describe('cupos', () => {
  it('es determinista', () => {
    const c = CLASES[0];
    expect(cuposOcupados(c, '2026-11-25')).toBe(cuposOcupados(c, '2026-11-25'));
    expect(cuposDe(c, '2026-11-25')).toEqual(cuposDe(c, '2026-11-25'));
  });
  it('nunca pasa del total ni baja de 0', () => {
    for (const c of CLASES) for (let i = 0; i < 60; i++) {
      const o = cuposOcupados(c, sumarDias('2026-11-25', i));
      expect(o).toBeGreaterThanOrEqual(0);
      expect(o).toBeLessThanOrEqual(cuposTotales(c));
    }
  });
  it('reformer tiene 8 camas y funcional 12 puestos', () => {
    expect(cuposTotales(CLASES.find((c) => c.programa === 'base')!)).toBe(8);
    expect(cuposTotales(CLASES.find((c) => c.programa === 'fullbody')!)).toBe(12);
  });
  it('da estados con texto', () => {
    expect(estadoCupos(8, 8)).toMatchObject({ estado: 'llena', texto: 'Llena', libres: 0 });
    expect(estadoCupos(8, 7)).toMatchObject({ estado: 'ultimos', texto: 'Último cupo' });
    expect(estadoCupos(8, 6)).toMatchObject({ estado: 'ultimos', texto: 'Últimos 2 cupos' });
    expect(estadoCupos(8, 5)).toMatchObject({ estado: 'ultimos', texto: 'Últimos 3 cupos' });
    expect(estadoCupos(8, 4)).toMatchObject({ estado: 'disponible', texto: '4 cupos libres' });
    expect(estadoCupos(8, 99).estado).toBe('llena');
  });
  it('en 4 semanas aparecen clases llenas, con últimos cupos y con lugar', () => {
    const estados = new Set<string>();
    for (const c of CLASES) for (let i = 0; i < 28; i++) estados.add(cuposDe(c, sumarDias('2026-11-25', i)).estado);
    expect([...estados].sort()).toEqual(['disponible', 'llena', 'ultimos']);
  });
});

describe('ocurrencias y cierre de reservas', () => {
  it('cierra 1 hora antes del inicio', () => {
    const c = CLASES.find((x) => x.dia === 3 && x.hora === '18:30')!;
    expect(reservaCerrada(c, '2026-11-25', new Date('2026-11-25T22:29:00Z'))).toBe(false);
    expect(reservaCerrada(c, '2026-11-25', new Date('2026-11-25T22:30:00Z'))).toBe(false);
    expect(reservaCerrada(c, '2026-11-25', new Date('2026-11-25T22:31:00Z'))).toBe(true);
  });
  it('lista solo clases futuras dentro de 7 días, en orden', () => {
    const l = ocurrenciasReservables(AHORA);
    expect(l.length).toBeGreaterThan(10);
    expect(l.every((o) => minutosHasta(o.fecha, o.clase.hora, AHORA) >= 60)).toBe(true);
    expect(l.every((o) => o.fecha <= '2026-12-02')).toBe(true);
    expect(l.some((o) => o.fecha === '2026-11-25' && o.clase.hora === '09:00')).toBe(false);
    for (let i = 1; i < l.length; i++) expect(l[i - 1].fecha + l[i - 1].clase.hora <= l[i].fecha + l[i].clase.hora).toBe(true);
  });
  it('la próxima ocurrencia salta a la semana siguiente si ya pasó', () => {
    const c = CLASES.find((x) => x.dia === 3 && x.hora === '06:30')!;
    expect(proximaOcurrencia(c, AHORA)!.fecha).toBe('2026-12-02');
  });
  it('rechaza ids inventados o con día incorrecto', () => {
    expect(buscarOcurrencia('nada@2026-11-25')).toBeNull();
    const c = CLASES.find((x) => x.dia === 3)!;
    expect(buscarOcurrencia(`${c.id}@2026-11-26`)).toBeNull();
    expect(buscarOcurrencia(`${c.id}@2026-11-25`)).not.toBeNull();
  });
});

describe('validarReserva', () => {
  const libre = ocurrenciasReservables(AHORA).find((o) => o.cupos.libres > 3 && o.clase.programa === 'base')!;
  const llena = (() => {
    for (let i = 0; i < 80; i++) for (const c of CLASES) {
      const f = sumarDias('2026-12-01', i);
      if (diaSemana(f) === c.dia && cuposDe(c, f).estado === 'llena') return { c, f };
    }
    throw new Error('sin clase llena');
  })();
  const ok: DatosReserva = { ocurrencia: libre.id, nombre: 'Lucía Paredes', celular: '987 654 321', primeraVez: 'si', lesion: 'no', consentimiento: true };

  it('acepta datos correctos', () => { expect(validarReserva(ok, AHORA)).toEqual({}); });
  it('exige todos los campos', () => {
    const e = validarReserva({ ocurrencia: '', nombre: '', celular: '', primeraVez: '', lesion: '', consentimiento: false }, AHORA);
    expect(Object.keys(e).sort()).toEqual(['celular', 'consentimiento', 'lesion', 'nombre', 'ocurrencia', 'primeraVez']);
  });
  it('valida el celular peruano', () => {
    expect(validarReserva({ ...ok, celular: '812345678' }, AHORA).celular).toMatch(/empieza con 9/);
    expect(validarReserva({ ...ok, celular: '98765' }, AHORA).celular).toMatch(/9 dígitos/);
    expect(validarReserva({ ...ok, celular: '+51 987 654 321' }, AHORA)).toEqual({});
  });
  it('rechaza clases pasadas', () => {
    const c = CLASES.find((x) => x.dia === 3 && x.hora === '06:30')!;
    expect(validarReserva({ ...ok, ocurrencia: `${c.id}@2026-11-25` }, AHORA).ocurrencia).toMatch(/cerró/);
    expect(validarReserva({ ...ok, ocurrencia: `${c.id}@2026-11-18` }, AHORA).ocurrencia).toMatch(/pasó/);
  });
  it('rechaza fechas fuera de la ventana de 7 días', () => {
    const c = CLASES.find((x) => x.dia === 3)!;
    expect(validarReserva({ ...ok, ocurrencia: `${c.id}@2026-12-09` }, AHORA).ocurrencia).toMatch(/7 días/);
  });
  it('rechaza clases llenas', () => {
    const now = new Date(`${sumarDias(llena.f, -1)}T15:00:00Z`);
    expect(validarReserva({ ...ok, ocurrencia: `${llena.c.id}@${llena.f}`, primeraVez: 'no' }, now).ocurrencia).toMatch(/llena/);
  });
  it('la clase de prueba solo vale en nivel inicial', () => {
    const power = ocurrenciasReservables(AHORA).find((o) => o.clase.programa === 'power' && o.cupos.estado !== 'llena')!;
    expect(validarReserva({ ...ok, ocurrencia: power.id, primeraVez: 'si' }, AHORA).ocurrencia).toMatch(/solo para nivel inicial/);
    expect(validarReserva({ ...ok, ocurrencia: power.id, primeraVez: 'no' }, AHORA).ocurrencia).toBeUndefined();
  });
  it('si hay lesión se pide consentimiento de salud aparte', () => {
    expect(validarReserva({ ...ok, lesion: 'si' }, AHORA).consentimientoSalud).toMatch(/consentimiento/);
    expect(validarReserva({ ...ok, lesion: 'si', consentimientoSalud: true }, AHORA)).toEqual({});
  });
  it('el mensaje de WhatsApp no incluye datos de salud (ni el sí/no) y se codifica', () => {
    const si = mensajeReserva({ ...ok, lesion: 'si' });
    expect(si).toBe(mensajeReserva({ ...ok, lesion: 'no' }));
    expect(si).not.toMatch(/lesi[oó]n|restricci/i);
    const m = si;
    expect(m).toMatch(/en persona/);
    expect(m).toMatch(/Celular: 987654321/);
    const u = urlWhatsApp(m);
    expect(u.startsWith('https://wa.me/51935852637?text=')).toBe(true);
    expect(u).not.toMatch(/\s/);
  });
});

describe('precios', () => {
  it('formatea en soles', () => {
    expect(soles(220)).toMatch(/^S\/\s?220$/);
    expect(soles(43.33)).toMatch(/43[.,]33$/);
  });
  it('desglosa el IGV (18 %) de un precio final', () => {
    expect(baseSinIGV(118)).toBe(100);
    expect(montoIGV(118)).toBe(18);
    expect(baseSinIGV(400) + montoIGV(400)).toBeCloseTo(400, 2);
  });
  it('precio por clase y ahorro', () => {
    expect(precioPorClase(PLANES_MENSUALES[1])).toBe(50);
    expect(ahorroFrenteASuelta(PLANES_MENSUALES[1], PRECIO_SUELTA)).toBe(23);
    expect(ahorroFrenteASuelta({ precio: 100, clases: 1 }, 65)).toBe(0);
  });
  it('planes y paquetes cuestan menos por clase que la suelta', () => {
    for (const p of [...PLANES_MENSUALES, ...PAQUETES]) expect(precioPorClase(p)).toBeLessThan(PRECIO_SUELTA);
    expect(PRECIO_PRUEBA).toBeLessThan(PRECIO_SUELTA);
  });
  it('precio de la reserva según primera vez', () => {
    expect(precioReserva(true)).toBe(PRECIO_PRUEBA);
    expect(precioReserva(false)).toBe(PRECIO_SUELTA);
  });
});
