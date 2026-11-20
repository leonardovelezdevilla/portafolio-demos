import { describe, expect, it } from 'vitest';
import {
  ahoraLima,
  bloquesDelDia,
  diaSemana,
  horasDelDia,
  horasOcupadas,
  proximosDias,
  sumarDias,
  validarFechaHora,
  MIN_LIBRES,
} from '../src/lib/horarios';

// 2026-11-20 es viernes. 15:00 UTC = 10:00 en Lima.
const AHORA = new Date('2026-11-20T15:00:00Z');

describe('zona America/Lima', () => {
  it('usa UTC-5 y cambia de día según Lima, no según UTC', () => {
    expect(ahoraLima(new Date('2026-11-21T03:00:00Z'))).toEqual({ fecha: '2026-11-20', minutos: 22 * 60 });
    expect(ahoraLima(new Date('2026-11-21T05:00:00Z')).fecha).toBe('2026-11-21');
  });
});

describe('horasDelDia', () => {
  it('lunes a viernes: 9-13 y 15-19 cada 30 min', () => {
    const h = horasDelDia(1);
    expect(h[0]).toBe('09:00');
    expect(h).toContain('12:30');
    expect(h).not.toContain('13:00');
    expect(h).not.toContain('14:30');
    expect(h).toContain('15:00');
    expect(h[h.length - 1]).toBe('18:30');
    expect(h).toHaveLength(16);
  });
  it('sábado solo en la mañana y domingo cerrado', () => {
    expect(horasDelDia(6)).toHaveLength(8);
    expect(horasDelDia(0)).toEqual([]);
  });
});

describe('proximosDias', () => {
  const dias = proximosDias(AHORA);
  it('genera 14 días consecutivos desde hoy', () => {
    expect(dias).toHaveLength(14);
    expect(dias[0].fecha).toBe('2026-11-20');
    expect(dias[13].fecha).toBe('2026-12-03');
  });
  it('marca los domingos como cerrados', () => {
    const domingos = dias.filter((d) => d.diaSemana === 0);
    expect(domingos.length).toBe(2);
    expect(domingos.every((d) => !d.abierto)).toBe(true);
    expect(dias.filter((d) => d.diaSemana !== 0).every((d) => d.abierto)).toBe(true);
  });
});

describe('ocupados simulados', () => {
  it('son deterministas para la misma fecha y especialista', () => {
    const a = [...horasOcupadas('2026-11-24', 'rojas')];
    const b = [...horasOcupadas('2026-11-24', 'rojas')];
    expect(a).toEqual(b);
  });
  it('cambian entre especialistas o fechas', () => {
    const combos = ['rojas', 'quispe', 'tello', 'salazar'].map((id) => [...horasOcupadas('2026-11-24', id)].join());
    expect(new Set(combos).size).toBeGreaterThan(1);
  });
  it('hay algunos ocupados y siempre un mínimo de libres', () => {
    let totalOcupados = 0;
    for (let i = 0; i < 14; i++) {
      const fecha = sumarDias('2026-11-23', i);
      if (diaSemana(fecha) === 0) continue;
      const horas = horasDelDia(diaSemana(fecha));
      const oc = horasOcupadas(fecha, 'quispe');
      totalOcupados += oc.size;
      expect(horas.length - oc.size).toBeGreaterThanOrEqual(MIN_LIBRES);
    }
    expect(totalOcupados).toBeGreaterThan(5);
  });
});

describe('bloquesDelDia', () => {
  it('no ofrece nada los domingos ni los días que el especialista no atiende', () => {
    expect(bloquesDelDia('2026-11-22', 'rojas', AHORA)).toEqual([]);
    // 2026-11-21 es sábado; la Dra. Rojas no atiende sábados.
    expect(bloquesDelDia('2026-11-21', 'rojas', AHORA, [1, 2, 3, 4, 5])).toEqual([]);
  });
  it('marca como pasado lo anterior a ahora + 60 min el mismo día', () => {
    const b = bloquesDelDia('2026-11-20', 'rojas', AHORA);
    expect(b.find((x) => x.hora === '10:30')?.estado).toBe('pasado');
    expect(b.find((x) => x.hora === '09:00')?.estado).toBe('pasado');
    expect(b.find((x) => x.hora === '11:00')?.estado).not.toBe('pasado');
  });
  it('fechas pasadas quedan todas como pasado', () => {
    expect(bloquesDelDia('2026-11-19', 'rojas', AHORA).every((b) => b.estado === 'pasado')).toBe(true);
  });
});

describe('validarFechaHora', () => {
  const libre = (fecha: string, id: string) => bloquesDelDia(fecha, id, AHORA).find((b) => b.estado === 'libre')!.hora;
  const ocupada = (fecha: string, id: string) => bloquesDelDia(fecha, id, AHORA).find((b) => b.estado === 'ocupado')?.hora;

  it('acepta un horario libre', () => {
    expect(validarFechaHora('2026-11-24', libre('2026-11-24', 'rojas'), 'rojas', AHORA)).toBeNull();
  });
  it('rechaza vacío, formato inválido, pasado, domingo y fuera de rango', () => {
    expect(validarFechaHora('', '10:00', 'rojas', AHORA)).toMatch(/fecha/i);
    expect(validarFechaHora('2026-02-30', '10:00', 'rojas', AHORA)).toMatch(/no es válida/);
    expect(validarFechaHora('2026-11-19', '10:00', 'rojas', AHORA)).toMatch(/pasada/);
    expect(validarFechaHora('2026-11-22', '10:00', 'rojas', AHORA)).toMatch(/domingos/);
    expect(validarFechaHora('2026-12-04', '10:00', 'rojas', AHORA)).toMatch(/próximos 14 días/);
  });
  it('rechaza hora vacía, inexistente, pasada y ocupada', () => {
    expect(validarFechaHora('2026-11-24', '', 'rojas', AHORA)).toMatch(/horario/);
    expect(validarFechaHora('2026-11-24', '13:30', 'rojas', AHORA)).toMatch(/no existe/);
    expect(validarFechaHora('2026-11-20', '09:00', 'rojas', AHORA)).toMatch(/ya pasó/);
    for (const f of ['2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27']) {
      const o = ocupada(f, 'rojas');
      if (o) {
        expect(validarFechaHora(f, o, 'rojas', AHORA)).toMatch(/ocupado/);
        return;
      }
    }
    throw new Error('Se esperaba al menos un horario ocupado en los días de prueba');
  });
  it('rechaza días en que el especialista no atiende', () => {
    expect(validarFechaHora('2026-11-21', '10:00', 'rojas', AHORA, [1, 2, 3, 4, 5])).toMatch(/no atiende/);
  });
});
