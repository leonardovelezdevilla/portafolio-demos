import { describe, expect, it } from 'vitest';
import { diaSemana, horasDelDia, horasDisponibles, partesLima, primerDiaDisponible, sumarDias, validarCita } from '../src/lib/fechas';
import { armarMensaje, celularValido, numeroCita, numeroHoja, urlWhatsApp, validarCitaForm, validarReclamo, type DatosCita } from '../src/lib/reserva';
import { edadParaReserva, edadTextoDesdeDias, generarGuia } from '../src/lib/vacunas';

// Viernes 20/11/2026, 10:00 en Lima (15:00 UTC).
const AHORA = new Date(Date.UTC(2026, 10, 20, 15, 0));

describe('horarios (Lima)', () => {
  it('convierte a hora de Lima sin depender de la zona del equipo', () => {
    expect(partesLima(AHORA)).toEqual({ ymd: '2026-11-20', hhmm: '10:00', dow: 5 });
    expect(partesLima(new Date(Date.UTC(2026, 10, 21, 3, 0))).ymd).toBe('2026-11-20');
  });
  it('lun-sáb 9:00-20:00 con última cita a las 19:30', () => {
    const h = horasDelDia('2026-11-21', 'consulta');
    expect(h[0]).toBe('09:00');
    expect(h.at(-1)).toBe('19:30');
    expect(h).toHaveLength(22);
  });
  it('domingo 9:00-13:00 con última cita a las 12:30', () => {
    expect(diaSemana('2026-11-22')).toBe(0);
    const h = horasDelDia('2026-11-22', 'vacuna');
    expect(h[0]).toBe('09:00');
    expect(h.at(-1)).toBe('12:30');
    expect(h).toHaveLength(8);
  });
  it('baño y peluquería tiene turnos propios y no atiende domingos', () => {
    expect(horasDelDia('2026-11-21', 'bano')).toEqual(['09:00', '11:30', '14:00', '16:30']);
    expect(horasDelDia('2026-11-22', 'bano')).toEqual([]);
    expect(validarCita('2026-11-22', '09:00', 'bano', AHORA).ok).toBe(false);
  });
  it('rechaza fechas pasadas y horas ya vencidas hoy', () => {
    const r = validarCita('2026-11-19', '10:00', 'consulta', AHORA);
    expect(r).toMatchObject({ ok: false, campo: 'fecha' });
    expect(validarCita('2026-11-20', '10:30', 'consulta', AHORA)).toMatchObject({ ok: false, campo: 'hora' });
    expect(validarCita('2026-11-20', '12:00', 'consulta', AHORA).ok).toBe(true);
  });
  it('rechaza horas fuera del horario', () => {
    expect(validarCita('2026-11-21', '08:30', 'consulta', AHORA)).toMatchObject({ ok: false, campo: 'hora' });
    expect(validarCita('2026-11-21', '20:00', 'consulta', AHORA)).toMatchObject({ ok: false, campo: 'hora' });
    expect(validarCita('2026-11-22', '13:00', 'consulta', AHORA)).toMatchObject({ ok: false, campo: 'hora' });
    expect(validarCita('2026-11-21', '10:15', 'consulta', AHORA)).toMatchObject({ ok: false, campo: 'hora' });
  });
  it('baño pide 24 horas de anticipación', () => {
    expect(validarCita('2026-11-21', '09:00', 'bano', AHORA)).toMatchObject({ ok: false, campo: 'hora' });
    expect(validarCita('2026-11-21', '11:30', 'bano', AHORA).ok).toBe(true);
    expect(horasDisponibles('2026-11-21', 'bano', AHORA)).toEqual(['11:30', '14:00', '16:30']);
    expect(validarCita('2026-11-23', '09:00', 'bano', AHORA).ok).toBe(true);
  });
  it('rechaza fechas inválidas, cierres y más de 60 días', () => {
    expect(validarCita('2026-02-31', '10:00', 'consulta', AHORA)).toMatchObject({ ok: false, campo: 'fecha' });
    expect(validarCita('', '10:00', 'consulta', AHORA)).toMatchObject({ ok: false, campo: 'fecha' });
    expect(validarCita('2026-12-25', '10:00', 'consulta', AHORA)).toMatchObject({ ok: false, campo: 'fecha' });
    expect(validarCita(sumarDias('2026-11-20', 61), '10:00', 'consulta', AHORA)).toMatchObject({ ok: false, campo: 'fecha' });
  });
  it('primer día disponible hoy si aún hay horas, mañana si ya cerró', () => {
    expect(primerDiaDisponible('consulta', AHORA)).toBe('2026-11-20');
    expect(primerDiaDisponible('consulta', new Date(Date.UTC(2026, 10, 21, 1, 30)))).toBe('2026-11-21');
  });
});

const base: DatosCita = {
  servicio: 'consulta', especie: 'perro', tamano: '', mascota: 'Canela', edadValor: '3', edadUnidad: 'anios', dueno: 'María Quispe',
  celular: '987654321', fecha: '2026-11-21', hora: '10:00', sintomas: '', acepta: 'si',
};

describe('validación de la reserva', () => {
  it('acepta una cita completa', () => expect(validarCitaForm(base, AHORA)).toEqual({}));
  it('celular peruano', () => {
    expect(celularValido('987 654 321')).toBe(true);
    expect(celularValido('+51 987654321')).toBe(true);
    expect(celularValido('187654321')).toBe(false);
    expect(celularValido('98765432')).toBe(false);
    expect(validarCitaForm({ ...base, celular: '12345' }, AHORA).celular).toBeTruthy();
  });
  it('nombres y edad de la mascota', () => {
    expect(validarCitaForm({ ...base, mascota: '' }, AHORA).mascota).toBeTruthy();
    expect(validarCitaForm({ ...base, mascota: '<b>' }, AHORA).mascota).toBeTruthy();
    expect(validarCitaForm({ ...base, edadValor: '0' }, AHORA).edadValor).toBeTruthy();
    expect(validarCitaForm({ ...base, edadValor: '31' }, AHORA).edadValor).toBeTruthy();
    expect(validarCitaForm({ ...base, edadValor: '8', edadUnidad: 'semanas' }, AHORA).edadValor).toBeUndefined();
    expect(validarCitaForm({ ...base, edadValor: '2,5' }, AHORA).edadValor).toBeTruthy();
  });
  it('baño exige tamaño; consulta no', () => {
    const bano = { ...base, servicio: 'bano', fecha: '2026-11-23', hora: '09:00' };
    expect(validarCitaForm(bano, AHORA).tamano).toBeTruthy();
    expect(validarCitaForm({ ...bano, tamano: 'mediano' }, AHORA)).toEqual({});
  });
  it('consentimiento obligatorio y síntomas con tope', () => {
    expect(validarCitaForm({ ...base, acepta: '' }, AHORA).acepta).toBeTruthy();
    expect(validarCitaForm({ ...base, sintomas: 'x'.repeat(201) }, AHORA).sintomas).toBeTruthy();
    expect(validarCitaForm({ ...base, sintomas: 'Cojea desde ayer' }, AHORA).sintomas).toBeUndefined();
  });
  it('especie y servicio válidos', () => {
    expect(validarCitaForm({ ...base, especie: 'loro' }, AHORA).especie).toBeTruthy();
    expect(validarCitaForm({ ...base, servicio: 'cirugia' }, AHORA).servicio).toBeTruthy();
  });
  it('el mensaje de WhatsApp no lleva síntomas ni celular ni apellido', () => {
    const d = { ...base, sintomas: 'vomita sangre', celular: '987654321' };
    const m = armarMensaje(d, numeroCita(AHORA, () => 0.1234));
    expect(m).not.toContain('vomita');
    expect(m).not.toContain('987654321');
    expect(m).not.toContain('Quispe');
    expect(m).toContain('Canela');
    expect(m).toContain('CP-2026-1234');
    const u = urlWhatsApp(m);
    expect(u.startsWith('https://wa.me/51935852637?text=')).toBe(true);
    expect(decodeURIComponent(u.split('text=')[1])).toBe(m);
  });
});

describe('libro de reclamaciones', () => {
  const ok = {
    nombre: 'Ana Rojas Díaz', dni: '12345678', email: 'ana@ejemplo.invalid', telefono: '912345678', domicilio: 'Av. Ejemplo 123, Lima',
    menor: 'no', apoderado: '', bien: 'servicio', descripcionBien: 'Baño de perro mediano', monto: '70', tipo: 'reclamo',
    detalle: 'El servicio no se hizo en la hora acordada.', pedido: 'Devolución del pago.',
  };
  it('acepta una hoja completa y numera la hoja', () => {
    expect(validarReclamo(ok)).toEqual({});
    expect(numeroHoja(AHORA, () => 0.5)).toBe('LR-2026-500000');
  });
  it('exige apoderado si es menor y valida campos', () => {
    expect(validarReclamo({ ...ok, menor: 'si' }).apoderado).toBeTruthy();
    expect(validarReclamo({ ...ok, dni: '123' }).dni).toBeTruthy();
    expect(validarReclamo({ ...ok, tipo: '' }).tipo).toBeTruthy();
    expect(validarReclamo({ ...ok, detalle: 'corto' }).detalle).toBeTruthy();
  });
});

describe('guía de vacunación referencial', () => {
  it('rechaza datos inválidos', () => {
    expect(generarGuia({ especie: 'loro', edadValor: 2, edadUnidad: 'meses' }, AHORA)).toMatchObject({ ok: false, campo: 'especie' });
    expect(generarGuia({ especie: 'perro', nacimiento: '2027-01-01' }, AHORA)).toMatchObject({ ok: false, campo: 'edad' });
    expect(generarGuia({ especie: 'perro', nacimiento: '2026-02-30' }, AHORA)).toMatchObject({ ok: false, campo: 'edad' });
    expect(generarGuia({ especie: 'perro' }, AHORA)).toMatchObject({ ok: false, campo: 'edad' });
    expect(generarGuia({ especie: 'perro', edadValor: 0, edadUnidad: 'meses' }, AHORA)).toMatchObject({ ok: false });
    expect(generarGuia({ especie: 'perro', edadValor: 40, edadUnidad: 'anios' }, AHORA)).toMatchObject({ ok: false });
  });
  it('cachorro de 7 semanas: primera múltiple ahora y antirrábica próxima', () => {
    const r = generarGuia({ especie: 'perro', edadValor: 7, edadUnidad: 'semanas' }, AHORA);
    if (!r.ok) throw new Error('debía ser válida');
    expect(r.etapa).toBe('muy-pequeno');
    expect(r.aproximada).toBe(true);
    expect(r.hitos.find((h) => h.id === 'mul-1')?.estado).toBe('ahora');
    expect(r.hitos.find((h) => h.id === 'rabia')?.estado).toBe('proximo');
    expect(r.hitos.find((h) => h.id === 'des-1')?.estado).toBe('anterior');
  });
  it('con fecha de nacimiento calcula fechas orientativas exactas', () => {
    const r = generarGuia({ especie: 'gato', nacimiento: '2026-09-25' }, AHORA);
    if (!r.ok) throw new Error('debía ser válida');
    expect(r.aproximada).toBe(false);
    expect(r.edadSemanas).toBe(8);
    const t1 = r.hitos.find((h) => h.id === 'tri-1')!;
    expect(t1.estado).toBe('ahora');
    expect(t1.desde).toBe('2026-11-20');
    expect(r.hitos.find((h) => h.id === 'rabia')?.desde).toBe('2026-12-18');
  });
  it('gato y perro tienen esquemas distintos', () => {
    const p = generarGuia({ especie: 'perro', edadValor: 3, edadUnidad: 'meses' }, AHORA);
    const g = generarGuia({ especie: 'gato', edadValor: 3, edadUnidad: 'meses' }, AHORA);
    if (!p.ok || !g.ok) throw new Error('válidas');
    expect(p.hitos.some((h) => h.id.startsWith('mul'))).toBe(true);
    expect(g.hitos.some((h) => h.id.startsWith('tri'))).toBe(true);
    expect(g.hitos.some((h) => h.id.startsWith('mul'))).toBe(false);
    expect(p.hitos.find((h) => h.id === 'rabia')?.estado).toBe('ahora');
  });
  it('adulto: todo lo de la serie quedó atrás y aparecen los controles periódicos', () => {
    const r = generarGuia({ especie: 'perro', edadValor: 4, edadUnidad: 'anios' }, AHORA);
    if (!r.ok) throw new Error('válida');
    expect(r.etapa).toBe('adulto');
    expect(r.hitos.every((h) => h.estado === 'anterior')).toBe(true);
    expect(r.periodicos.length).toBeGreaterThan(2);
    expect(r.avisos.join(' ')).toMatch(/carnet/);
  });
  it('menor de 2 semanas no recibe vacunas y se deriva a consulta', () => {
    const r = generarGuia({ especie: 'gato', edadValor: 1, edadUnidad: 'semanas' }, AHORA);
    if (!r.ok) throw new Error('válida');
    expect(r.avisos.join(' ')).toMatch(/consulta/);
  });
  it('edad para precompletar la reserva respeta los límites del formulario', () => {
    expect(edadParaReserva(8)).toEqual({ valor: 8, unidad: 'semanas' });
    expect(edadParaReserva(26)).toEqual({ valor: 6, unidad: 'meses' });
    expect(edadParaReserva(52 * 4)).toEqual({ valor: 4, unidad: 'anios' });
    expect(validarCitaForm({ ...base, edadValor: String(edadParaReserva(200).valor), edadUnidad: edadParaReserva(200).unidad }, AHORA).edadValor).toBeUndefined();
  });
  it('texto de edad', () => {
    expect(edadTextoDesdeDias(5)).toBe('5 días');
    expect(edadTextoDesdeDias(56)).toBe('8 semanas');
    expect(edadTextoDesdeDias(100)).toBe('3 meses');
    expect(edadTextoDesdeDias(800)).toBe('2 años y 2 meses');
  });
});
