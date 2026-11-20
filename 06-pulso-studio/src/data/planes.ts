/** Precios ficticios en soles (S/). Todos incluyen IGV (18 %). */

export const IGV = 0.18;
export const PRECIO_PRUEBA = 35;
export const PRECIO_SUELTA = 65;

export interface Plan {
  clave: string;
  nombre: string;
  clases: number;
  precio: number;
  vigenciaDias: number;
  detalle: string;
}

export const PLANES_MENSUALES: Plan[] = [
  { clave: 'ligero', nombre: 'Ligero', clases: 4, precio: 220, vigenciaDias: 30, detalle: '1 clase por semana. Ideal para empezar o complementar otro deporte.' },
  { clave: 'constante', nombre: 'Constante', clases: 8, precio: 400, vigenciaDias: 30, detalle: '2 clases por semana, en reformer o funcional, como prefieras.' },
  { clave: 'pulso-12', nombre: 'Pulso 12', clases: 12, precio: 540, vigenciaDias: 30, detalle: '3 clases por semana, a la hora que prefieras.' },
];

export const PAQUETES: Plan[] = [
  { clave: 'p5', nombre: 'Paquete 5 clases', clases: 5, precio: 285, vigenciaDias: 60, detalle: 'Sin mensualidad. Úsalas cuando quieras durante 60 días.' },
  { clave: 'p10', nombre: 'Paquete 10 clases', clases: 10, precio: 520, vigenciaDias: 90, detalle: 'Para quienes viajan o tienen horarios cambiantes. 90 días.' },
];

/** Condiciones de ejemplo (demo) que se muestran junto a planes y paquetes. */
export const CONDICIONES = [
  'Las clases no usadas al vencer el plan o paquete se pierden; no hay prórroga ni congelamiento (regla de demo).',
  'Cancela una clase hasta 4 horas antes por WhatsApp; después se descuenta de tu plan o paquete.',
  'Sin renovación automática. Devoluciones: solo por cobro duplicado o error del estudio (regla de demo).',
  'Planes y paquetes son personales e intransferibles.',
];
export const EDAD_MINIMA = 16;
