import { describe, expect, it } from 'vitest';
import { bandaKm, cotizar, formatoRango, parsearKm, rangoServicio, servicioDisponible, soles } from './cotizador';
import {
  celularValido,
  cuposOcupados,
  diaLaborable,
  diasReservables,
  diaSemana,
  esFeriado,
  estadoTurno,
  estadoApertura,
  formatearPlaca,
  sumarDiasHabiles,
  partesLima,
  placaValida,
  sumarDias,
  turnoReservable,
  turnosDelDia,
} from './reserva';
import { buscarSeguimiento, normalizarCodigo, ocultarPlaca } from './seguimiento';
import { SEGUIMIENTOS, ETAPAS } from '../data/seguimiento';

describe('cotizador: kilometraje', () => {
  it('interpreta kilometrajes con separadores', () => {
    expect(parsearKm('45 000')).toBe(45000);
    expect(parsearKm('45.000')).toBe(45000);
    expect(parsearKm('0')).toBe(0);
  });
  it('rechaza valores inválidos o fuera de rango', () => {
    expect(parsearKm('')).toBeNull();
    expect(parsearKm('-5')).toBeNull();
    expect(parsearKm('abc')).toBeNull();
    expect(parsearKm('500001')).toBeNull();
  });
  it('ubica la banda correcta en los bordes', () => {
    expect(bandaKm(19999).factorTope).toBe(1);
    expect(bandaKm(20000).factorTope).toBe(1.03);
    expect(bandaKm(99999).factorTope).toBe(1.07);
    expect(bandaKm(100000).factorTope).toBe(1.12);
  });
});

describe('cotizador: rangos', () => {
  it('con poco kilometraje usa la tarifa base', () => {
    expect(rangoServicio('aceite', 'auto', 5000)).toEqual([140, 200]);
  });
  it('sube solo el tope con el kilometraje y redondea a múltiplos de 5', () => {
    const r = rangoServicio('frenos', 'auto', 120000)!;
    expect(r[0]).toBe(220);
    expect(r[1]).toBe(385);
    expect(r[1] % 5).toBe(0);
  });
  it('las motos no tienen alineamiento ni pre-ITV', () => {
    expect(servicioDisponible('alineamiento', 'moto')).toBe(false);
    expect(rangoServicio('preitv', 'moto', 1000)).toBeNull();
  });
  it('suma varios servicios y reporta los no disponibles', () => {
    const c = cotizar('moto', 10000, ['aceite', 'alineamiento', 'diagnostico']);
    expect(c.lineas.map((l) => l.servicio)).toEqual(['aceite', 'diagnostico']);
    expect(c.min).toBe(140);
    expect(c.max).toBe(200);
    expect(c.noDisponibles).toEqual(['alineamiento']);
  });
  it('sin servicios el total es cero', () => {
    const c = cotizar('auto', 1000, []);
    expect(c.min).toBe(0);
    expect(c.max).toBe(0);
  });
  it('ningún rango individual supera 2 veces su mínimo', () => {
    for (const v of ['auto', 'suv', 'camioneta', 'moto'] as const)
      for (const id of ['aceite', 'frenos', 'afinamiento', 'alineamiento', 'diagnostico', 'preitv'] as const) {
        const r = rangoServicio(id, v, 150000);
        if (r) expect(r[1] / r[0]).toBeLessThanOrEqual(2);
      }
  });
  it('el mínimo nunca supera el máximo', () => {
    for (const v of ['auto', 'suv', 'camioneta', 'moto'] as const) {
      const c = cotizar(v, 80000, ['aceite', 'frenos', 'afinamiento', 'alineamiento', 'diagnostico', 'preitv']);
      expect(c.min).toBeLessThanOrEqual(c.max);
    }
  });
  it('formatea en soles', () => {
    expect(soles(120).replace(/\s/g, ' ')).toContain('S/');
    expect(formatoRango(140, 200)).toContain('140');
  });
});

describe('placa peruana', () => {
  it.each(['ABC-123', 'abc123', 'A1B-234', ' b2c 345 ', '1234-AB', '1234ab'])('acepta %s', (p) => {
    expect(placaValida(p)).toBe(true);
  });
  it.each(['', '123-456', 'AB-123', 'ABCD-123', 'ABC-12', '12345-AB', 'ÑÑÑ-123', '12-3456'])('rechaza "%s"', (p) => {
    expect(placaValida(p)).toBe(false);
  });
  it('da formato con guion', () => {
    expect(formatearPlaca('abc123')).toBe('ABC-123');
    expect(formatearPlaca('1234ab')).toBe('1234-AB');
  });
  it('valida el celular peruano', () => {
    expect(celularValido('900 000 000')).toBe(true);
    expect(celularValido('800000000')).toBe(false);
    expect(celularValido('90000000')).toBe(false);
  });
});

describe('fechas en America/Lima', () => {
  it('convierte UTC a la fecha de Lima (UTC-5)', () => {
    // 21 nov 03:00 UTC = 20 nov 22:00 en Lima
    expect(partesLima(new Date('2026-11-21T03:00:00Z'))).toEqual({ fecha: '2026-11-20', hora: 22, minuto: 0 });
    expect(partesLima(new Date('2026-11-20T05:00:00Z')).fecha).toBe('2026-11-20');
  });
  it('suma días cruzando fin de mes y año', () => {
    expect(sumarDias('2026-11-30', 1)).toBe('2026-12-01');
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01');
  });
  it('calcula el día de la semana', () => {
    expect(diaSemana('2026-11-20')).toBe(5); // viernes
    expect(diaSemana('2026-11-22')).toBe(0); // domingo
  });
  it('el taller atiende lunes a sábado y no en feriados fijos', () => {
    expect(diaLaborable('2026-11-21')).toBe(true); // sábado
    expect(diaLaborable('2026-11-22')).toBe(false); // domingo
    expect(esFeriado('2026-12-25')).toBe(true);
    expect(diaLaborable('2026-12-25')).toBe(false);
  });
});

describe('turnos y cupos', () => {
  const ahora = new Date('2026-11-20T15:00:00Z'); // viernes 10:00 en Lima
  it('hay turno de mañana y de tarde; el sábado la tarde es más corta', () => {
    expect(turnosDelDia('2026-11-20').map((t) => t.id)).toEqual(['manana', 'tarde']);
    expect(turnosDelDia('2026-11-21')[1].horario).toContain('16:00');
    expect(turnosDelDia('2026-11-20')[1].horario).toContain('17:30');
  });
  it('los cupos simulados son deterministas y están en rango', () => {
    expect(cuposOcupados('2026-11-23', 'manana')).toBe(cuposOcupados('2026-11-23', 'manana'));
    for (let i = 0; i < 30; i++) {
      const c = cuposOcupados(sumarDias('2026-11-23', i), 'tarde');
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(6);
    }
  });
  it('el mismo día: la mañana ya cerró a las 10:00 pero la tarde sigue abierta (si hay cupo)', () => {
    const [m, t] = turnosDelDia('2026-11-20');
    expect(estadoTurno('2026-11-20', m, ahora).estado).toBe('cerrado');
    expect(estadoTurno('2026-11-20', t, ahora).estado).not.toBe('cerrado');
  });
  it('pasada las 12:00 en Lima cierra también la tarde del mismo día', () => {
    const tarde = new Date('2026-11-20T18:00:00Z'); // 13:00 Lima
    expect(estadoTurno('2026-11-20', turnosDelDia('2026-11-20')[1], tarde).estado).toBe('cerrado');
  });
  it('fechas pasadas y domingos están cerrados', () => {
    expect(estadoTurno('2026-11-19', turnosDelDia('2026-11-19')[0], ahora).estado).toBe('cerrado');
    expect(estadoTurno('2026-11-22', turnosDelDia('2026-11-22')[0], ahora).estado).toBe('cerrado');
  });
  it('lista días reservables sin domingos ni pasados', () => {
    const dias = diasReservables(ahora);
    expect(dias.length).toBeGreaterThan(10);
    expect(dias.every((d) => d >= '2026-11-20' && diaSemana(d) !== 0)).toBe(true);
    expect(dias).not.toContain('2026-12-08');
  });
  it('un turno agotado no es reservable', () => {
    let fecha = '';
    for (let i = 1; i < 21 && !fecha; i++) {
      const f = sumarDias('2026-11-20', i);
      if (diaLaborable(f) && cuposOcupados(f, 'manana') === 6) fecha = f;
    }
    if (fecha) expect(turnoReservable(fecha, 'manana', ahora)).toBe(false);
    expect(turnoReservable('2027-06-01', 'manana', ahora)).toBe(false);
    expect(turnoReservable('no-fecha', 'manana', ahora)).toBe(false);
  });
});

describe('seguimiento de ejemplo', () => {
  it('encuentra códigos sin importar mayúsculas o espacios', () => {
    expect(normalizarCodigo(' tr-demo-1002 ')).toBe('TR-DEMO-1002');
    expect(buscarSeguimiento('tr-demo-1002')?.etapa).toBe(2);
  });
  it('devuelve null para códigos desconocidos', () => {
    expect(buscarSeguimiento('XX-1')).toBeNull();
  });
  it('cada etapa de los ejemplos existe', () => {
    for (const s of SEGUIMIENTOS) expect(ETAPAS[s.etapa]).toBeDefined();
  });
});

describe('placa oculta en el seguimiento', () => {
  it('enmascara los dígitos finales', () => {
    expect(ocultarPlaca('ABC-123')).toBe('ABC-***');
    expect(ocultarPlaca('1234-AB')).toBe('1234-**');
  });
  it('reconoce códigos de cita como aún sin seguimiento', () => {
    expect(buscarSeguimiento('CITA-DEMO-12345')).toBeNull();
  });
});

describe('apertura del taller y plazos', () => {
  it('lunes 10:00 en Lima está abierto', () => {
    expect(estadoApertura(new Date('2026-11-23T15:00:00Z')).abierto).toBe(true);
  });
  it('al mediodía y media del lunes abre por la tarde', () => {
    const e = estadoApertura(new Date('2026-11-23T18:30:00Z')); // 13:30 Lima
    expect(e.abierto).toBe(false);
    expect(e.texto).toContain('14:00');
  });
  it('domingo abre el lunes', () => {
    const e = estadoApertura(new Date('2026-11-22T17:00:00Z'));
    expect(e.abierto).toBe(false);
    expect(e.texto).toContain('lunes');
  });
  it('suma días hábiles saltando fines de semana y feriados', () => {
    expect(sumarDiasHabiles('2026-11-20', 1)).toBe('2026-11-23');
    expect(sumarDiasHabiles('2026-11-20', 15)).toBe('2026-12-15'); // salta 8 y 9 de diciembre (feriados)
  });
});
