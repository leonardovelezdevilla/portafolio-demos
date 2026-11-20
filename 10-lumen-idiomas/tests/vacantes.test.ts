import { describe, expect, it } from 'vitest';
import { CAPACIDAD, GRUPOS, aMinutos, seSuperponen, turnoDe, textoDias } from '../src/data/horarios';
import { DOCENTES } from '../src/data/docentes';
import { estadoDe, filtrarGrupos, hashUnitario, textoVacantes, vacantesDe } from '../src/lib/vacantes';

describe('vacantes simuladas', () => {
  it('son deterministas para el mismo grupo y ciclo', () => {
    for (const g of GRUPOS) expect(vacantesDe(g)).toEqual(vacantesDe(g));
    expect(hashUnitario('x')).toBe(hashUnitario('x'));
  });
  it('cambian con la semilla del ciclo', () => {
    const distintas = GRUPOS.filter((g) => vacantesDe(g, 'otro-ciclo').libres !== vacantesDe(g).libres);
    expect(distintas.length).toBeGreaterThan(3);
  });
  it('respetan la capacidad y la ocupación mínima', () => {
    for (const g of GRUPOS) {
      const v = vacantesDe(g);
      expect(v.capacidad).toBe(CAPACIDAD[g.modalidad]);
      expect(v.ocupadas + v.libres).toBe(v.capacidad);
      expect(v.libres).toBeGreaterThanOrEqual(0);
      expect(v.libres).toBeLessThanOrEqual(Math.floor(v.capacidad * 0.7));
    }
  });
  it('la demo muestra de los tres estados', () => {
    const estados = new Set(GRUPOS.map((g) => vacantesDe(g).estado));
    expect(estados).toEqual(new Set(['disponible', 'ultimas', 'sin-vacantes']));
  });
  it('estado y texto coinciden', () => {
    expect(estadoDe(0)).toBe('sin-vacantes');
    expect(estadoDe(1)).toBe('ultimas');
    expect(estadoDe(3)).toBe('ultimas');
    expect(estadoDe(4)).toBe('disponible');
    expect(textoVacantes(0)).toBe('Sin vacantes');
    expect(textoVacantes(1)).toBe('Última vacante');
    expect(textoVacantes(3)).toBe('Últimas 3 vacantes');
    expect(textoVacantes(9)).toBe('9 vacantes');
  });
});

describe('datos de horarios', () => {
  it('ids únicos y docentes existentes', () => {
    expect(new Set(GRUPOS.map((g) => g.id)).size).toBe(GRUPOS.length);
    const ids = new Set(DOCENTES.map((d) => d.id));
    for (const g of GRUPOS) expect(ids.has(g.docente)).toBe(true);
  });
  it('hay al menos un grupo por nivel y por modalidad', () => {
    for (const n of ['A1', 'A2', 'B1', 'B2', 'C1']) expect(GRUPOS.some((g) => g.nivel === n)).toBe(true);
    expect(GRUPOS.some((g) => g.modalidad === 'Virtual')).toBe(true);
    expect(GRUPOS.some((g) => g.modalidad === 'Presencial')).toBe(true);
  });
  it('turnos y días en texto', () => {
    expect(turnoDe('07:00')).toBe('Mañana');
    expect(turnoDe('12:00')).toBe('Tarde');
    expect(turnoDe('17:59')).toBe('Tarde');
    expect(turnoDe('18:00')).toBe('Noche');
    expect(textoDias(['Lun', 'Mié', 'Vie'])).toBe('lunes, miércoles y viernes');
    expect(textoDias(['Sáb'])).toBe('sábados');
  });
});

describe('coherencia de la oferta', () => {
  it('ningún docente tiene dos grupos que se pisen', () => {
    const choques: string[] = [];
    for (let i = 0; i < GRUPOS.length; i++)
      for (let j = i + 1; j < GRUPOS.length; j++)
        if (GRUPOS[i].docente === GRUPOS[j].docente && seSuperponen(GRUPOS[i], GRUPOS[j])) choques.push(`${GRUPOS[i].id} / ${GRUPOS[j].id}`);
    expect(choques).toEqual([]);
  });
  it('seSuperponen detecta cruces y respeta bordes y días distintos', () => {
    const a = { dias: ['Mar', 'Jue'], inicio: '19:00', fin: '20:30' } as const;
    expect(seSuperponen(a, { dias: ['Mar'], inicio: '18:00', fin: '19:30' })).toBe(true);
    expect(seSuperponen(a, { dias: ['Mar'], inicio: '17:30', fin: '19:00' })).toBe(false);
    expect(seSuperponen(a, { dias: ['Lun'], inicio: '19:00', fin: '20:30' })).toBe(false);
    expect(aMinutos('07:30')).toBe(450);
  });
  it('cada nivel tiene al menos un grupo de jóvenes y uno de adultos', () => {
    for (const n of ['A1', 'A2', 'B1', 'B2', 'C1']) {
      expect(GRUPOS.some((g) => g.nivel === n && g.publico.startsWith('Jóvenes'))).toBe(true);
      expect(GRUPOS.some((g) => g.nivel === n && g.publico.startsWith('Adultos'))).toBe(true);
    }
  });
  it('los grupos terminan después de empezar', () => {
    for (const g of GRUPOS) expect(aMinutos(g.fin)).toBeGreaterThan(aMinutos(g.inicio));
  });
});

describe('filtros', () => {
  it('sin filtros devuelve todo', () => {
    expect(filtrarGrupos(GRUPOS, {})).toHaveLength(GRUPOS.length);
  });
  it('filtra por nivel, modalidad y turno', () => {
    expect(filtrarGrupos(GRUPOS, { nivel: 'B1' }).every((g) => g.nivel === 'B1')).toBe(true);
    expect(filtrarGrupos(GRUPOS, { modalidad: 'Virtual' }).every((g) => g.modalidad === 'Virtual')).toBe(true);
    expect(filtrarGrupos(GRUPOS, { turno: 'Noche' }).every((g) => g.inicio >= '18:00')).toBe(true);
  });
  it('combina filtros y puede quedar vacío', () => {
    expect(filtrarGrupos(GRUPOS, { nivel: 'C1', modalidad: 'Virtual', turno: 'Noche' })).toHaveLength(0);
  });
  it('«solo con vacantes» quita los grupos sin vacantes', () => {
    const conVacantes = filtrarGrupos(GRUPOS, { soloConVacantes: true });
    expect(conVacantes.length).toBeLessThan(GRUPOS.length);
    expect(conVacantes.every((g) => vacantesDe(g).libres > 0)).toBe(true);
  });
});
