import type { Modalidad } from './horarios';

/** Precios ficticios por ciclo (8 semanas, 24 horas). Incluyen IGV (18 %). */
export const PRECIOS: Record<Modalidad, { ciclo: number; materiales: number; materialesDetalle: string }> = {
  Presencial: { ciclo: 480, materiales: 90, materialesDetalle: 'libro y cuaderno de práctica impresos' },
  Virtual: { ciclo: 400, materiales: 60, materialesDetalle: 'libro y práctica en versión digital' },
};

export const IGV_TEXTO = 'Precios en soles, IGV incluido. Los materiales se pagan aparte, una vez por ciclo. Precios ficticios de demostración.';

export const soles = (n: number): string =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0, maximumFractionDigits: 2 })
    .format(n)
    .replace(/ /g, ' ');

/** Condiciones del ciclo (ficticias, de demostración): retiro, devolución, materiales y pago. */
export const CONDICIONES: ReadonlyArray<{ titulo: string; texto: string }> = [
  { titulo: 'Pago', texto: 'Se paga antes de iniciar el ciclo, después de la entrevista de ubicación. La vacante se confirma al pagar; hasta entonces no está reservada.' },
  { titulo: 'Retiro y devolución', texto: 'Si te retiras hasta el último día de la primera semana de clases, devolvemos el 80 % del precio del ciclo. Después no hay devolución, pero puedes usar el saldo en un ciclo siguiente si avisas por escrito.' },
  { titulo: 'Materiales', texto: 'No se devuelven una vez entregados (impresos) o activados (digitales).' },
  { titulo: 'Si el grupo no se abre', texto: 'Si un grupo no llega al mínimo de alumnos, te ofrecemos otro horario del mismo nivel o la devolución del 100 % de lo pagado, incluidos los materiales.' },
  { titulo: 'Cambio de grupo', texto: 'Sin costo durante la primera semana, dentro del mismo nivel, público (jóvenes o adultos) y si hay vacantes.' },
  { titulo: 'Inasistencias', texto: 'Las clases a las que faltes no se devuelven; puedes recuperarlas en otro grupo del mismo nivel si hay cupo.' },
];
