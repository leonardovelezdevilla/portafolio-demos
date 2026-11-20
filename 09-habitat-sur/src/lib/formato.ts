import { TIPO_CAMBIO } from '../data/departamentos';
const pen = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 });
const penDec = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });
export const soles = (n: number) => pen.format(n);
export const solesDec = (n: number) => penDec.format(n);
export const aDolares = (s: number, tc = TIPO_CAMBIO) => Math.round(s / tc);
export const dolares = (s: number, tc = TIPO_CAMBIO) => `US$ ${num.format(aDolares(s, tc))}`;
