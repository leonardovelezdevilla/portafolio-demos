import { describe, expect, it } from 'vitest';
import {
  fechaMinima, minutosHasta,
  ahoraLima, diaSemana, fechaMaxima, horasDisponibles, hoyLima, mensajeWhatsApp, urlWhatsApp,
  validarFecha, validarHora, validarPersonas, validarReserva,
} from './reserva';
import { limpiarCelular, validarCelular } from './validar';

// 2026-11-20 es viernes. 15:30 en Lima (UTC-5) = 20:30 UTC.
const viernes1530 = new Date('2026-11-20T20:30:00Z');

describe('zona horaria America/Lima', () => {
  it('a las 02:00 UTC todavía es el día anterior en Lima', () => {
    expect(hoyLima(new Date('2026-11-21T02:00:00Z'))).toBe('2026-11-20');
  });
  it('a las 05:00 UTC ya es el día nuevo en Lima', () => {
    expect(hoyLima(new Date('2026-11-21T05:00:00Z'))).toBe('2026-11-21');
  });
  it('calcula la hora local de Lima', () => {
    expect(ahoraLima(viernes1530)).toEqual({ fecha: '2026-11-20', minutos: 15 * 60 + 30 });
  });
  it('medianoche en Lima es 00:00 y no 24:00', () => {
    expect(ahoraLima(new Date('2026-11-21T05:00:00Z')).minutos).toBe(0);
  });
});

describe('fechas', () => {
  it('rechaza fechas pasadas y acepta hoy', () => {
    expect(validarFecha('2026-11-19', viernes1530)).toMatch(/ya pasó/);
    expect(validarFecha('2026-11-20', viernes1530)).toBeNull();
  });
  it('usa la fecha de Lima y no la UTC como mínima', () => {
    const casiMedianocheUTC = new Date('2026-11-21T03:00:00Z'); // 22:00 del 20 en Lima
    expect(validarFecha('2026-11-20', casiMedianocheUTC)).toBeNull();
  });
  it('rechaza lunes', () => {
    expect(diaSemana('2026-11-23')).toBe(1);
    expect(validarFecha('2026-11-23', viernes1530)).toMatch(/lunes/);
  });
  it('rechaza fechas imposibles y vacías', () => {
    expect(validarFecha('2026-02-30', viernes1530)).toMatch(/no es válida/);
    expect(validarFecha('', viernes1530)).toMatch(/Elige/);
  });
  it('limita la anticipación a 90 días', () => {
    expect(fechaMaxima(viernes1530)).toBe('2027-02-18');
    expect(validarFecha('2027-02-19', viernes1530)).toMatch(/90 días/);
  });
});

describe('horario y última reserva', () => {
  it('martes a sábado: almuerzo y cena, última reserva 1 h antes del cierre', () => {
    const h = horasDisponibles('2026-11-24'); // martes
    expect(h[0]).toBe('12:30');
    expect(h).toContain('15:00');
    expect(h).not.toContain('15:30');
    expect(h).not.toContain('16:00');
    expect(h).toContain('19:00');
    expect(h[h.length - 1]).toBe('22:00');
    expect(h).not.toContain('22:30');
  });
  it('domingo: la última reserva es a las 16:00', () => {
    const h = horasDisponibles('2026-11-22');
    expect(h[0]).toBe('12:30');
    expect(h[h.length - 1]).toBe('16:00');
    expect(h).not.toContain('19:00');
  });
  it('lunes sin horas', () => {
    expect(horasDisponibles('2026-11-23')).toEqual([]);
  });
  it('rechaza horas fuera de horario', () => {
    expect(validarHora('2026-11-24', '12:00', viernes1530)).toMatch(/no tomamos/);
    expect(validarHora('2026-11-24', '17:30', viernes1530)).toMatch(/no tomamos/);
    expect(validarHora('2026-11-24', '22:30', viernes1530)).toMatch(/no tomamos/);
    expect(validarHora('2026-11-22', '17:00', viernes1530)).toMatch(/no tomamos/);
  });
  it('acepta horas dentro de horario', () => {
    expect(validarHora('2026-11-24', '13:00', viernes1530)).toBeNull();
    expect(validarHora('2026-11-24', '22:00', viernes1530)).toBeNull();
  });
  it('hoy: no permite horas que ya pasaron en Lima', () => {
    // Son las 15:30 en Lima: 15:00 ya pasó, 19:00 sí.
    expect(horasDisponibles('2026-11-20', viernes1530)).not.toContain('15:00');
    expect(validarHora('2026-11-20', '15:00', viernes1530)).toMatch(/ya pasó/);
    expect(validarHora('2026-11-20', '19:00', viernes1530)).toBeNull();
  });
});

describe('personas', () => {
  it('acepta de 1 a 8', () => {
    for (const n of [1, 4, 8]) expect(validarPersonas(n)).toBeNull();
  });
  it('rechaza 0, vacío y no enteros', () => {
    expect(validarPersonas(0)).toMatch(/al menos 1/);
    expect(validarPersonas('')).toMatch(/Indica/);
    expect(validarPersonas('2.5')).toMatch(/entero/);
  });
  it('más de 8 deriva a grupos', () => {
    expect(validarPersonas(9)).toMatch(/grupos/);
  });
});

describe('celular peruano', () => {
  it('acepta 9 dígitos con 9 inicial y variantes +51', () => {
    expect(validarCelular('987 654 321')).toBeNull();
    expect(validarCelular('+51 987654321')).toBeNull();
    expect(limpiarCelular('+51 987-654-321')).toBe('987654321');
  });
  it('rechaza inválidos', () => {
    expect(validarCelular('')).toBeTruthy();
    expect(validarCelular('87654321')).toMatch(/9 dígitos/);
    expect(validarCelular('887654321')).toMatch(/empieza con 9/);
    expect(validarCelular('98765abcd')).toMatch(/números/);
  });
});

describe('reserva completa y WhatsApp', () => {
  const base = { fecha: '2026-11-24', hora: '20:00', personas: 4, nombre: 'Lucía Paredes', celular: '987654321', consentimiento: true };
  it('valida una reserva correcta', () => {
    expect(validarReserva(base, viernes1530)).toEqual({ ok: true, errores: {} });
  });
  it('reporta todos los errores a la vez', () => {
    const r = validarReserva({ fecha: '', hora: '', personas: '', nombre: '', celular: '' }, viernes1530);
    expect(r.ok).toBe(false);
    expect(Object.keys(r.errores).sort()).toEqual(['celular', 'consentimiento', 'fecha', 'hora', 'nombre', 'personas']);
  });
  it('arma wa.me codificado con los datos', () => {
    const url = urlWhatsApp(mensajeWhatsApp({ ...base, alergias: 'Alergia al maní' }));
    expect(url.startsWith('https://wa.me/51935852637?text=')).toBe(true);
    const texto = decodeURIComponent(url.split('?text=')[1]);
    expect(texto).toContain('Lucía Paredes');
    expect(texto).toContain('martes 24 de noviembre de 2026');
    expect(texto).toContain('Alergias: Alergia al maní');
  });
});

describe('consentimiento y grupos', () => {
  it('exige la casilla de consentimiento', () => {
    const r = validarReserva({ fecha: '2026-11-24', hora: '20:00', personas: 2, nombre: 'Ana Ruiz', celular: '912345678' }, viernes1530);
    expect(r.errores.consentimiento).toMatch(/casilla/);
  });
  it('más de 8 personas deriva a WhatsApp', () => {
    expect(validarPersonas(20)).toMatch(/WhatsApp/);
  });
});

describe('omakase (48 h, turnos 19:00 y 21:30, martes a sábado)', () => {
  // Viernes 2026-11-20 15:30 en Lima. Las 48 h se cumplen el domingo 22 a las 15:30.
  const om = { tipo: 'omakase' as const, personas: 2, nombre: 'Ana Ruiz', celular: '912345678', consentimiento: true };
  it('solo ofrece 19:00 y 21:30, de martes a sábado', () => {
    expect(horasDisponibles('2026-11-24', undefined, 'omakase')).toEqual(['19:00', '21:30']);
    expect(horasDisponibles('2026-11-22', undefined, 'omakase')).toEqual([]);
    expect(horasDisponibles('2026-11-23', undefined, 'omakase')).toEqual([]);
  });
  it('la fecha mínima es hoy + 2 días en Lima', () => {
    expect(fechaMinima('omakase', viernes1530)).toBe('2026-11-22');
    expect(fechaMinima('mesa', viernes1530)).toBe('2026-11-20');
  });
  it('calcula minutos hasta un turno en hora de Lima', () => {
    expect(minutosHasta('2026-11-24', '19:00', viernes1530)).toBe(4 * 1440 + 19 * 60 - (15 * 60 + 30));
  });
  it('rechaza menos de 48 horas', () => {
    expect(validarFecha('2026-11-21', viernes1530, 'omakase')).toMatch(/48 horas/);
    expect(validarReserva({ ...om, fecha: '2026-11-21', hora: '21:30' }, viernes1530).errores.fecha).toMatch(/48 horas/);
  });
  it('turnos de martes 24 sí cumplen 48 h; el de mañana sábado 21 no', () => {
    expect(validarReserva({ ...om, fecha: '2026-11-24', hora: '19:00' }, viernes1530).ok).toBe(true);
    expect(horasDisponibles('2026-11-21', viernes1530, 'omakase')).toEqual([]);
  });
  it('rechaza domingo y horas que no son turno', () => {
    expect(validarReserva({ ...om, fecha: '2026-11-22', hora: '19:00' }, viernes1530).errores.fecha).toMatch(/martes a sábado/);
    expect(validarHora('2026-11-24', '20:00', viernes1530, 'omakase')).toMatch(/no tomamos/);
    expect(validarHora('2026-11-24', '19:00', viernes1530, 'omakase')).toBeNull();
  });
  it('el mensaje de WhatsApp indica omakase', () => {
    expect(mensajeWhatsApp({ ...om, fecha: '2026-11-24', hora: '19:00' })).toMatch(/omakase/);
  });
});
