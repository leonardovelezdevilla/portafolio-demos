import { describe, expect, it } from 'vitest';
import { efectoPorPorcion, precioDecoracion, adelanto, alergenosTorta, dosPisos, formatoSoles, igvIncluido, presupuestoTorta, validarMensaje, type Seleccion } from '../src/lib/precio';
import { costoDelivery, DISTRITOS } from '../src/lib/distritos';
import {
  horasDelDia, horasDisponibles, instanteLima, minimoEntrega, motivoCierre, partesLima, primerDiaDisponible, proximasFechas, proximoDiaDisponible, sumarDias, validarEntrega,
} from '../src/lib/fechas';
import { numeroPedido, validarPedido, type DatosPedido } from '../src/lib/validacion';
import { armarMensaje, totalesPedido, urlWhatsApp } from '../src/lib/whatsapp';

const base: Seleccion = { tamano: '12', bizcocho: 'vainilla', relleno: 'manjar', cobertura: 'chantilly', decoraciones: [], mensaje: '' };

describe('precio', () => {
  it('base sin extras = precio del tamaño', () => {
    expect(presupuestoTorta(base)!.total).toBe(135);
  });
  it('suma extras por porción y decoraciones', () => {
    // 12 porciones: 135 + red velvet 1.2*12=14 + lúcuma 0.8*12=10 + fondant 1.5*12=18 + frutas 18 + flores 30
    const p = presupuestoTorta({ ...base, bizcocho: 'red-velvet', relleno: 'lucuma', cobertura: 'fondant', decoraciones: ['frutas', 'flores'] })!;
    expect(p.total).toBe(135 + 14 + 10 + 18 + 18 + 30);
    expect(p.lineas.reduce((a, l) => a + l.monto, 0)).toBe(p.total);
  });
  it('2 pisos recarga la decoración x1.5', () => {
    const p = presupuestoTorta({ ...base, tamano: '2p-36', decoraciones: ['flores'] })!;
    expect(p.dosPisos).toBe(true);
    expect(p.total).toBe(420 + 45);
  });
  it('ignora decoraciones repetidas o desconocidas', () => {
    expect(presupuestoTorta({ ...base, decoraciones: ['frutas', 'frutas', 'x'] })!.total).toBe(153);
  });
  it('opción inválida devuelve null', () => {
    expect(presupuestoTorta({ ...base, tamano: '99' })).toBeNull();
  });
  it('alérgenos acumulados sin repetir', () => {
    expect(alergenosTorta(base)).toEqual(['gluten', 'huevo', 'leche']);
    expect(alergenosTorta({ ...base, bizcocho: 'zanahoria', cobertura: 'ganache' })).toEqual(['gluten', 'huevo', 'leche', 'frutos-secos', 'soya']);
  });
  it('mensaje: límite de 30 y caracteres permitidos', () => {
    expect(validarMensaje('Feliz cumple, Lucía!')).toBeNull();
    expect(validarMensaje('a'.repeat(31))).toMatch(/30/);
    expect(validarMensaje('Hola 🎂')).toMatch(/emojis/);
    expect(validarMensaje('<script>')).not.toBeNull();
  });
  it('formato de soles, IGV y adelanto', () => {
    expect(formatoSoles(1234.5)).toBe('S/ 1,234.50');
    expect(igvIncluido(118)).toBe(18);
    expect(adelanto(185)).toBe(92.5);
    expect(dosPisos('2p-50')).toBe(true);
    expect(dosPisos('8')).toBe(false);
  });
});

describe('efectos y sugerencias', () => {
  it('efecto de extras sobre el tamaño elegido', () => {
    expect(efectoPorPorcion(0.4, 12)).toBe(5);
    expect(efectoPorPorcion(1.5, 24)).toBe(36);
    expect(precioDecoracion(30, 2)).toBe(45);
    expect(precioDecoracion(30, 1)).toBe(30);
  });
});

describe('distritos', () => {
  it('Jesús María cuesta S/ 6, sin importar tildes ni mayúsculas', () => {
    expect(costoDelivery('jesus maria').total).toBe(6);
    expect(costoDelivery('  JESÚS   MARÍA ').distrito).toBe('Jesús María');
  });
  it('2 pisos suma recargo', () => {
    expect(costoDelivery('Lince', true).total).toBe(8 + 25);
  });
  it('distrito sin cobertura', () => {
    expect(costoDelivery('Ate').cubierto).toBe(false);
    expect(DISTRITOS.every((d) => d.costo > 0)).toBe(true);
  });
});

// Viernes 20-nov-2026, 10:00 hora de Lima.
const AHORA = instanteLima('2026-11-20', '10:00');

describe('fechas en America/Lima', () => {
  it('convierte instantes a hora de Lima', () => {
    expect(partesLima(new Date('2026-11-21T03:30:00Z'))).toEqual({ ymd: '2026-11-20', hhmm: '22:30', dow: 5 });
    expect(partesLima(new Date('2026-11-21T05:00:00Z')).ymd).toBe('2026-11-21');
  });
  it('mínimo 48 h y 72 h', () => {
    expect(partesLima(minimoEntrega(AHORA, false))).toMatchObject({ ymd: '2026-11-22', hhmm: '10:00' });
    expect(partesLima(minimoEntrega(AHORA, true))).toMatchObject({ ymd: '2026-11-23', hhmm: '10:00' });
  });
  it('lunes cerrado y feriados cerrados', () => {
    expect(motivoCierre('2026-11-23')).toMatch(/lunes/);
    expect(motivoCierre('2026-12-08')).toMatch(/feriado/);
    expect(motivoCierre('2026-11-24')).toBeNull();
    expect(horasDelDia('2026-11-23')).toEqual([]);
  });
  it('horario: sábado 9-19, domingo 9-14', () => {
    expect(horasDelDia('2026-11-21').at(0)).toBe('09:00');
    expect(horasDelDia('2026-11-21').at(-1)).toBe('18:30');
    expect(horasDelDia('2026-11-22').at(-1)).toBe('13:30');
  });
  it('primer día disponible: 48 h cae domingo; 72 h salta el lunes', () => {
    expect(primerDiaDisponible(AHORA, false)).toBe('2026-11-22');
    expect(primerDiaDisponible(AHORA, true)).toBe('2026-11-24');
  });
  it('si 48 h cae pasado el cierre, pasa al siguiente día abierto', () => {
    const tarde = instanteLima('2026-11-20', '15:00'); // +48 h = domingo 15:00, cerrado
    expect(primerDiaDisponible(tarde, false)).toBe('2026-11-24');
  });
  it('horas del día mínimo respetan los 48 h', () => {
    expect(horasDisponibles('2026-11-22', AHORA, false)[0]).toBe('10:00');
    expect(horasDisponibles('2026-11-21', AHORA, false)).toEqual([]);
  });
  it('sugiere la próxima fecha válida y lista las siguientes', () => {
    expect(proximoDiaDisponible('2026-11-23', AHORA, false)).toBe('2026-11-24');
    expect(proximasFechas(AHORA, false, 3)).toEqual(['2026-11-22', '2026-11-24', '2026-11-25']);
    const r = validarEntrega('2026-11-30', '10:00', AHORA, false) as { mensaje: string };
    expect(r.mensaje).toContain('martes 01/12/2026');
  });
  it('sumarDias cruza mes y año', () => {
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01');
    expect(sumarDias('2026-03-01', -1)).toBe('2026-02-28');
  });
  describe('validarEntrega', () => {
    it('acepta justo en el mínimo', () => {
      expect(validarEntrega('2026-11-22', '10:00', AHORA, false)).toEqual({ ok: true });
    });
    it('rechaza 30 min antes del mínimo (hora)', () => {
      const r = validarEntrega('2026-11-22', '09:30', AHORA, false);
      expect(r).toMatchObject({ ok: false, campo: 'hora' });
    });
    it('rechaza mañana por falta de anticipación', () => {
      const r = validarEntrega('2026-11-21', '12:00', AHORA, false);
      expect(r).toMatchObject({ ok: false, campo: 'fecha' });
      expect((r as { mensaje: string }).mensaje).toContain('domingo 22/11/2026');
    });
    it('2 pisos exige 72 h', () => {
      expect(validarEntrega('2026-11-23', '12:00', AHORA, true)).toMatchObject({ ok: false, campo: 'fecha' });
      expect(validarEntrega('2026-11-24', '09:00', AHORA, true)).toEqual({ ok: true });
    });
    it('lunes y feriado', () => {
      expect(validarEntrega('2026-11-30', '10:00', AHORA, false)).toMatchObject({ ok: false, campo: 'fecha' });
      expect(validarEntrega('2026-12-08', '10:00', AHORA, false)).toMatchObject({ ok: false, campo: 'fecha' });
    });
    it('hora fuera de horario y domingo después de las 14:00', () => {
      expect(validarEntrega('2026-12-02', '19:00', AHORA, false)).toMatchObject({ ok: false, campo: 'hora' });
      expect(validarEntrega('2026-12-06', '15:00', AHORA, false)).toMatchObject({ ok: false, campo: 'hora' });
      expect(validarEntrega('2026-12-02', '', AHORA, false)).toMatchObject({ ok: false, campo: 'hora' });
    });
    it('una fecha pasada (incluso feriado o lunes) dice que ya pasó', () => {
      for (const f of ['2026-11-01', '2026-11-16', '2026-11-10']) {
        const r = validarEntrega(f, '10:00', AHORA, false);
        expect(r).toMatchObject({ ok: false, campo: 'fecha' });
        if (!r.ok) expect(r.mensaje).toMatch(/ya pasó/);
      }
    });

    it('fecha vacía, inválida o demasiado lejana', () => {
      expect(validarEntrega('', '10:00', AHORA, false)).toMatchObject({ campo: 'fecha' });
      expect(validarEntrega('2026-02-30', '10:00', AHORA, false)).toMatchObject({ campo: 'fecha' });
      expect(validarEntrega('2027-06-01', '10:00', AHORA, false)).toMatchObject({ campo: 'fecha' });
    });
    it('usa la hora de Lima aunque el servidor esté en otra zona', () => {
      // 21-nov 03:00 UTC = 20-nov 22:00 en Lima: +48 h = 22-nov 22:00 (domingo cerrado) → martes 24
      const noche = new Date('2026-11-21T03:00:00Z');
      expect(primerDiaDisponible(noche, false)).toBe('2026-11-24');
    });
  });
});

describe('pedido', () => {
  const ok: DatosPedido = { nombre: 'Lucía Paredes', entrega: 'delivery', distrito: 'Lince', direccion: 'Av. Ejemplo 123, piso 2', fecha: '2026-11-25', hora: '15:00', mensaje: '', acepta: 'si' };
  it('pedido válido', () => {
    expect(validarPedido(ok, AHORA, false)).toEqual({});
  });
  it('exige consentimiento, distrito con cobertura y fecha', () => {
    const e = validarPedido({ ...ok, acepta: '', distrito: 'Ate', fecha: '2026-11-21' }, AHORA, false);
    expect(Object.keys(e).sort()).toEqual(['acepta', 'distrito', 'fecha']);
  });
  it('recojo no pide dirección', () => {
    expect(validarPedido({ ...ok, entrega: 'recojo', distrito: '', direccion: '' }, AHORA, false)).toEqual({});
  });
  it('totales con delivery y adelanto', () => {
    const t = totalesPedido(base, ok)!;
    expect(t).toEqual({ torta: 135, envio: 8, total: 143, adelanto: 71.5 });
  });
  it('mensaje de WhatsApp y URL codificada', () => {
    const m = armarMensaje({ ...base, mensaje: 'Feliz cumple' }, ok, 'AL-2026-0001');
    expect(m).toContain('Total (IGV incluido): S/ 143.00');
    expect(m).toContain('"Feliz cumple"');
    expect(m).toContain('Alérgenos según receta: Gluten (trigo), Huevo, Leche');
    const u = urlWhatsApp(m);
    expect(u.startsWith('https://wa.me/51935852637?text=')).toBe(true);
    expect(u).not.toContain(' ');
    expect(numeroPedido(new Date('2026-11-20T12:00:00Z'), () => 0.5)).toBe('AL-2026-5000');
  });
});
