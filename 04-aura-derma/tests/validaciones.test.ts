import { describe, expect, it } from 'vitest';
import {
  construirMensajeWhatsApp,
  construirUrlWhatsApp,
  numeroHoja,
  validarCelular,
  validarConsentimiento,
  validarCorreo,
  validarDni,
  validarDocumento,
  validarMonto,
  validarMotivo,
  validarNombre,
  validarPaciente,
} from '../src/lib/validaciones';

describe('nombre', () => {
  it('exige nombre y apellido con solo letras', () => {
    expect(validarNombre('')).not.toBe('');
    expect(validarNombre('Ana')).not.toBe('');
    expect(validarNombre('Ana')).not.toBe('');
    expect(validarNombre('Ana 123 Pérez')).toMatch(/letras/);
    expect(validarNombre('Ana Pérez')).toBe('');
    expect(validarNombre("María del Pilar O'Brien-Núñez")).toBe('');
  });
});

describe('celular', () => {
  it('acepta 9 dígitos que empiecen con 9, con espacios', () => {
    expect(validarCelular('987 654 321')).toBe('');
    expect(validarCelular('987-654-321')).toBe('');
  });
  it('rechaza largo, letras y prefijo incorrecto', () => {
    expect(validarCelular('')).not.toBe('');
    expect(validarCelular('98765432')).toMatch(/9 dígitos/);
    expect(validarCelular('9876543210')).toMatch(/9 dígitos/);
    expect(validarCelular('98765432a')).toMatch(/números/);
    expect(validarCelular('187654321')).toMatch(/empieza con 9/);
  });
});

describe('DNI opcional', () => {
  it('vacío es válido, 8 dígitos también', () => {
    expect(validarDni('')).toBe('');
    expect(validarDni('   ')).toBe('');
    expect(validarDni('12345678')).toBe('');
  });
  it('rechaza otros largos y letras', () => {
    expect(validarDni('1234567')).not.toBe('');
    expect(validarDni('123456789')).not.toBe('');
    expect(validarDni('1234567a')).not.toBe('');
  });
});

describe('motivo y consentimiento', () => {
  it('motivo entre 5 y 200 caracteres', () => {
    expect(validarMotivo('hola')).not.toBe('');
    expect(validarMotivo('Revisión de lunares')).toBe('');
    expect(validarMotivo('x'.repeat(201))).not.toBe('');
  });
  it('consentimiento obligatorio', () => {
    expect(validarConsentimiento(false)).toMatch(/datos personales y de salud/);
    expect(validarConsentimiento(true)).toBe('');
  });
});

describe('validarPaciente', () => {
  it('reporta todos los errores a la vez', () => {
    const e = validarPaciente({ nombre: '', celular: '1', dni: '12', motivo: '', consentimiento: false });
    expect(Object.keys(e).sort()).toEqual(['celular', 'consentimiento', 'dni', 'motivo', 'nombre']);
  });
  it('sin errores con datos correctos', () => {
    expect(
      validarPaciente({ nombre: 'Lucía Torres', celular: '900 111 222', dni: '', motivo: 'Control de acné', consentimiento: true }),
    ).toEqual({});
  });
});

describe('WhatsApp', () => {
  const r = {
    nombre: ' Lucía Torres ',
    celular: '900 111 222',
    dni: '12345678',
    motivo: 'Control de acné & dudas',
    consentimiento: true,
    especialista: 'Dra. Camila Rojas Ferreyra',
    fecha: '2026-11-24',
    hora: '10:30',
  };
  it('arma el mensaje con los datos, sin DNI, y añade el tratamiento si existe', () => {
    const m = construirMensajeWhatsApp(r);
    expect(m).toContain('Lucía Torres');
    expect(m).toContain('martes, 24 de noviembre de 2026');
    expect(m).toContain('10:30');
    expect(m).not.toContain('DNI');
    expect(m).not.toContain('12345678');
    expect(m).not.toContain('Tratamiento');
    expect(construirMensajeWhatsApp({ ...r, tratamiento: 'Control de acné' })).toContain('Tratamiento de interés: Control de acné');
  });
  it('genera una URL wa.me con el texto codificado', () => {
    const u = construirUrlWhatsApp(r);
    expect(u.startsWith('https://wa.me/51935852637?text=')).toBe(true);
    expect(u).not.toContain(' ');
    expect(decodeURIComponent(u.split('text=')[1])).toBe(construirMensajeWhatsApp(r));
  });
});

describe('libro de reclamaciones', () => {
  it('valida documento según tipo', () => {
    expect(validarDocumento('DNI', '12345678')).toBe('');
    expect(validarDocumento('DNI', '1234')).not.toBe('');
    expect(validarDocumento('CE', '001234567')).toBe('');
    expect(validarDocumento('PASAPORTE', 'AB12')).not.toBe('');
    expect(validarDocumento('', '123')).not.toBe('');
  });
  it('valida correo y monto', () => {
    expect(validarCorreo('a@b.com')).toBe('');
    expect(validarCorreo('a@b')).not.toBe('');
    expect(validarMonto('')).toBe('');
    expect(validarMonto('180,50')).toBe('');
    expect(validarMonto('-5')).not.toBe('');
  });
  it('genera el número de hoja con año y correlativo de 6 dígitos', () => {
    expect(numeroHoja(new Date('2026-11-20T15:00:00Z'), 123)).toBe('LR-DEMO-2026-000123');
  });
});
