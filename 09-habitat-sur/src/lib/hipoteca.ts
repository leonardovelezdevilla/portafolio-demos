// Simulador referencial: método francés (cuota fija). No es una oferta ni una evaluación crediticia.
export const CUOTA_INICIAL_MIN = 0.1;
export const PLAZO_MIN = 5;
export const PLAZO_MAX = 30;
export const TEA_MIN = 1;
export const TEA_MAX = 40;
export const TEA_EJEMPLO = 10; // % anual, valor de ejemplo editable; no es una tasa de ninguna entidad

/** TEA (%) a tasa efectiva mensual (fracción). */
export function tasaMensual(teaPct: number): number {
  return Math.pow(1 + teaPct / 100, 1 / 12) - 1;
}

/** Cuota mensual por método francés. Con tasa 0 reparte el monto en partes iguales. */
export function cuotaFrancesa(monto: number, teaPct: number, plazoAnios: number): number {
  const n = Math.round(plazoAnios * 12);
  if (monto <= 0 || n <= 0) return 0;
  const i = tasaMensual(teaPct);
  if (i === 0) return monto / n;
  return (monto * i) / (1 - Math.pow(1 + i, -n));
}

export const cuotaInicialMinima = (precio: number) => Math.ceil(precio * CUOTA_INICIAL_MIN);

export interface EntradaSimulador { precio: number; inicial: number; plazoAnios: number; teaPct: number; }
export interface ErroresSimulador { precio?: string; inicial?: string; plazo?: string; tea?: string; }

export function validarSimulador(e: EntradaSimulador): ErroresSimulador {
  const err: ErroresSimulador = {};
  if (!Number.isFinite(e.precio) || e.precio < 50000) err.precio = 'Ingresa un precio de al menos S/ 50 000.';
  if (!Number.isFinite(e.inicial)) err.inicial = 'Ingresa la cuota inicial.';
  else if (!err.precio && e.inicial < cuotaInicialMinima(e.precio)) err.inicial = 'La cuota inicial mínima de este ejemplo es 10 % del precio; cada entidad define la suya.';
  else if (!err.precio && e.inicial >= e.precio) err.inicial = 'La cuota inicial debe ser menor que el precio.';
  if (!Number.isInteger(e.plazoAnios) || e.plazoAnios < PLAZO_MIN || e.plazoAnios > PLAZO_MAX) err.plazo = `El plazo de este ejemplo va de ${PLAZO_MIN} a ${PLAZO_MAX} años enteros; cada entidad define el suyo.`;
  if (!Number.isFinite(e.teaPct) || e.teaPct < TEA_MIN || e.teaPct > TEA_MAX) err.tea = `La TEA va de ${TEA_MIN} % a ${TEA_MAX} %.`;
  return err;
}

export interface ResultadoSimulador { financiado: number; cuota: number; meses: number; totalPagado: number; interesesTotales: number; }

export function simular(e: EntradaSimulador): ResultadoSimulador {
  const financiado = Math.max(0, e.precio - e.inicial);
  const meses = Math.round(e.plazoAnios * 12);
  const cuota = cuotaFrancesa(financiado, e.teaPct, e.plazoAnios);
  const totalPagado = cuota * meses;
  return { financiado, cuota, meses, totalPagado, interesesTotales: totalPagado - financiado };
}
