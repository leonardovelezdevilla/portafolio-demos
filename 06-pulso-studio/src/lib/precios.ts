import { IGV, type Plan } from '../data/planes';

const fmt = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

export function soles(n: number): string {
  // Intl da «S/ 220.00»; para enteros se prefiere «S/ 220».
  return Number.isInteger(n) ? fmt.format(n).replace(/\.00$/, '') : fmt.format(n);
}

const redondear = (n: number) => Math.round(n * 100) / 100;

/** Precio sin IGV a partir de un precio final que ya lo incluye. */
export function baseSinIGV(precioFinal: number): number {
  return redondear(precioFinal / (1 + IGV));
}

export function montoIGV(precioFinal: number): number {
  return redondear(precioFinal - baseSinIGV(precioFinal));
}

export function precioPorClase(plan: Pick<Plan, 'precio' | 'clases'>): number {
  return redondear(plan.precio / plan.clases);
}

/** Ahorro porcentual (entero) frente a pagar clases sueltas. */
export function ahorroFrenteASuelta(plan: Pick<Plan, 'precio' | 'clases'>, suelta: number): number {
  const total = suelta * plan.clases;
  return Math.max(0, Math.round(((total - plan.precio) / total) * 100));
}
