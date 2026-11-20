import { describe, expect, it } from 'vitest';
import { edadEn, fechaValida, hoyLima } from '../src/lib/fechas';
import {
  construirMensajeWhatsApp,
  construirUrlWhatsApp,
  esMenorDeEdad,
  grupoCompatible,
  validarCelular,
  validarDocumento,
  validarHorario,
  validarMatricula,
  validarNacimiento,
  validarNombre,
  abreviarNombre,
  type DatosMatricula,
} from '../src/lib/matricula';
import { GRUPOS } from '../src/data/horarios';
import { vacantesDe } from '../src/lib/vacantes';

const HOY = '2026-11-20';

const grupoAdultos = GRUPOS.find((g) => g.publico.startsWith('Adultos') && vacantesDe(g).libres > 0)!;
const grupoJovenes = GRUPOS.find((g) => g.publico.startsWith('Jóvenes') && vacantesDe(g).libres > 0)!;
const grupoLleno = GRUPOS.find((g) => vacantesDe(g).libres === 0)!;

const adulto: DatosMatricula = {
  alumno: 'Lucía Paredes Vega',
  nacimiento: '1995-03-14',
  celular: '987 654 321',
  correo: 'lucia@ejemplo.invalid',
  horario: grupoAdultos.id,
  consentimiento: true,
  apoderado: '',
  parentesco: '',
  celularApoderado: '',
  autorizacion: false,
};
const menor: DatosMatricula = {
  ...adulto,
  alumno: 'Sofía Paredes Vega',
  nacimiento: '2012-05-02',
  celular: '',
  horario: grupoJovenes.id,
  apoderado: 'Rosa Vega Ruiz',
  parentesco: 'Madre',
  celularApoderado: '912345678',
  autorizacion: true,
};

describe('fechas y edad', () => {
  it('calcula la edad cumplida', () => {
    expect(edadEn('2008-11-20', HOY)).toBe(18);
    expect(edadEn('2008-11-21', HOY)).toBe(17);
    expect(edadEn('2024-02-29', '2025-02-28')).toBe(0);
    expect(edadEn('2027-01-01', HOY)).toBe(-1);
    expect(edadEn('basura', HOY)).toBe(-1);
  });
  it('valida fechas reales', () => {
    expect(fechaValida('2026-02-29')).toBe(false);
    expect(fechaValida('2024-02-29')).toBe(true);
  });
  it('hoyLima usa UTC-5', () => {
    expect(hoyLima(new Date('2026-11-21T03:00:00Z'))).toBe('2026-11-20');
    expect(hoyLima(new Date('2026-11-21T05:00:00Z'))).toBe('2026-11-21');
  });
  it('menor de edad es menos de 18', () => {
    expect(esMenorDeEdad(17)).toBe(true);
    expect(esMenorDeEdad(18)).toBe(false);
    expect(esMenorDeEdad(-1)).toBe(false);
  });
});

describe('campos sueltos', () => {
  it('nombre', () => {
    expect(validarNombre('')).toMatch(/Escribe/);
    expect(validarNombre('Ana')).toMatch(/completo/);
    expect(validarNombre('Ana 3 Lopez')).toMatch(/letras/);
    expect(validarNombre('Ana')).not.toBe('');
    expect(validarNombre('Ana Díaz')).toBe('');
  });
  it('celular peruano', () => {
    expect(validarCelular('987 654 321')).toBe('');
    expect(validarCelular('887654321')).toMatch(/empieza con 9/);
    expect(validarCelular('98765')).toMatch(/9 dígitos/);
    expect(validarCelular('98765432a')).toMatch(/números/);
  });
  it('nacimiento: futura, menor de 12 y razonable', () => {
    expect(validarNacimiento('', HOY)).toMatch(/Escribe/);
    expect(validarNacimiento('2027-01-01', HOY)).toMatch(/válida/);
    expect(validarNacimiento('2018-01-01', HOY)).toMatch(/desde los 12/);
    expect(validarNacimiento('1800-01-01', HOY)).toMatch(/demasiado alta/);
    expect(validarNacimiento('2012-05-02', HOY)).toBe('');
  });
  it('documentos del libro de reclamaciones', () => {
    expect(validarDocumento('DNI', '12345678')).toBe('');
    expect(validarDocumento('DNI', '1234')).toMatch(/8 números/);
    expect(validarDocumento('CE', '123456789')).toBe('');
  });
});

describe('nombres', () => {
  it('abrevia al menor a nombre e inicial', () => {
    expect(abreviarNombre('Sofía Paredes Vega')).toBe('Sofía P.');
    expect(abreviarNombre('  luis   ñañez ')).toBe('luis Ñ.');
    expect(abreviarNombre('Ana')).toBe('Ana');
  });
  it('los mensajes de error se leen bien', () => {
    expect(validarNombre('', 'del padre, madre o apoderado')).toBe('Escribe nombre y apellido del padre, madre o apoderado.');
    expect(validarNombre('')).toBe('Escribe tu nombre y apellido.');
  });
});

describe('matrícula de un adulto', () => {
  it('es válida con datos correctos y no pide apoderado', () => {
    expect(validarMatricula(adulto, HOY)).toEqual({});
  });
  it('exige celular propio, correo, horario y consentimiento', () => {
    const e = validarMatricula({ ...adulto, celular: '', correo: 'x', horario: '', consentimiento: false }, HOY);
    expect(Object.keys(e).sort()).toEqual(['celular', 'consentimiento', 'correo', 'horario']);
  });
});

describe('matrícula de un menor de edad', () => {
  it('es válida con los datos del apoderado y celular propio opcional', () => {
    expect(validarMatricula(menor, HOY)).toEqual({});
  });
  it('exige nombre, parentesco, celular y autorización del apoderado', () => {
    const e = validarMatricula({ ...menor, apoderado: '', parentesco: '', celularApoderado: '', autorizacion: false }, HOY);
    expect(Object.keys(e).sort()).toEqual(['apoderado', 'autorizacion', 'celularApoderado', 'parentesco']);
  });
  it('si escribe su propio celular, debe ser válido', () => {
    expect(validarMatricula({ ...menor, celular: '123' }, HOY).celular).toMatch(/9 dígitos/);
  });
  it('cumplir 18 años quita la exigencia de apoderado', () => {
    const casiAdulto = { ...adulto, nacimiento: '2008-11-20' }; // 18 hoy
    expect(validarMatricula(casiAdulto, HOY)).toEqual({});
    const aunMenor = { ...adulto, nacimiento: '2008-11-21', horario: grupoJovenes.id };
    expect(validarMatricula(aunMenor, HOY).apoderado).toBeDefined();
  });
  it('un menor no entra a un grupo de adultos ni un adulto a uno de jóvenes', () => {
    expect(validarMatricula({ ...menor, horario: grupoAdultos.id }, HOY).horario).toMatch(/adultos/);
    expect(validarMatricula({ ...adulto, horario: grupoJovenes.id }, HOY).horario).toMatch(/jóvenes/);
    expect(grupoCompatible(17, grupoJovenes)).toBe(true);
    expect(grupoCompatible(18, grupoJovenes)).toBe(false);
  });
  it('una fecha de nacimiento inválida no genera errores de apoderado engañosos', () => {
    const e = validarMatricula({ ...adulto, nacimiento: '2027-01-01' }, HOY);
    expect(e.nacimiento).toBeDefined();
    expect(e.apoderado).toBeUndefined();
  });
});

describe('horario', () => {
  it('rechaza un grupo sin vacantes o inexistente', () => {
    expect(grupoLleno).toBeDefined();
    expect(validarHorario(grupoLleno.id, 30)).toMatch(/sin vacantes/i);
    expect(validarHorario('no-existe', 30)).toMatch(/no existe/);
    expect(validarHorario('', 30)).toMatch(/Elige/);
  });
});

describe('mensaje de WhatsApp', () => {
  it('adulto: sin fecha de nacimiento ni correo', () => {
    const m = construirMensajeWhatsApp(adulto, HOY);
    expect(m).toContain('Lucía Paredes Vega');
    expect(m).toContain('987654321');
    expect(m).not.toContain('1995');
    expect(m).not.toContain('ejemplo.invalid');
    expect(m).toContain('entrevista');
  });
  it('menor: escribe el apoderado y se indica que es menor', () => {
    const m = construirMensajeWhatsApp(menor, HOY);
    expect(m).toContain('Rosa Vega Ruiz (madre)');
    expect(m).toContain('menor de edad');
    expect(m).toContain('Sofía P.');
    expect(m).not.toContain('Paredes');
    expect(m).not.toContain('2012');
  });
  it('la URL usa wa.me y codifica el texto', () => {
    const u = construirUrlWhatsApp(adulto, HOY);
    expect(u.startsWith('https://wa.me/51935852637?text=')).toBe(true);
    expect(u).not.toContain(' ');
    expect(decodeURIComponent(u.split('text=')[1])).toBe(construirMensajeWhatsApp(adulto, HOY));
  });
});
