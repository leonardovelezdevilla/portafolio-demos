import {
  ALERGENOS, BIZCOCHOS, COBERTURAS, DECORACIONES, FACTOR_DECORACION_2_PISOS, IGV, MENSAJE_MAX, RELLENOS, TAMANOS,
  ADELANTO_PORCENTAJE, type Alergeno,
} from './config';

export interface Seleccion {
  tamano: string;
  bizcocho: string;
  relleno: string;
  cobertura: string;
  decoraciones: string[];
  mensaje: string;
}

export interface Linea { etiqueta: string; detalle: string; monto: number }
export interface Presupuesto { lineas: Linea[]; total: number; porciones: number; dosPisos: boolean }

const redondear = (n: number) => Math.round(n + 1e-9);
const porId = <T extends { id: string }>(lista: T[], id: string) => lista.find((x) => x.id === id);

export const formatoSoles = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n).replace(/ /g, ' ');

/** Precio de la torta, IGV incluido. Cada línea se redondea a soles enteros y el total es su suma exacta. */
export function presupuestoTorta(s: Seleccion): Presupuesto | null {
  const t = porId(TAMANOS, s.tamano);
  const b = porId(BIZCOCHOS, s.bizcocho);
  const r = porId(RELLENOS, s.relleno);
  const c = porId(COBERTURAS, s.cobertura);
  if (!t || !b || !r || !c) return null;
  const factor = t.pisos === 2 ? FACTOR_DECORACION_2_PISOS : 1;
  const lineas: Linea[] = [
    { etiqueta: 'Tamaño', detalle: `${t.etiqueta} (${t.detalle})`, monto: t.precio },
    { etiqueta: 'Bizcocho', detalle: b.nombre, monto: redondear(b.porPorcion * t.porciones) },
    { etiqueta: 'Relleno', detalle: r.nombre, monto: redondear(r.porPorcion * t.porciones) },
    { etiqueta: 'Cobertura', detalle: c.nombre, monto: redondear(c.porPorcion * t.porciones) },
  ];
  const vistas = new Set<string>();
  for (const id of s.decoraciones) {
    const d = porId(DECORACIONES, id);
    if (!d || vistas.has(id)) continue;
    vistas.add(id);
    lineas.push({ etiqueta: 'Decoración', detalle: d.nombre, monto: redondear(d.precio * factor) });
  }
  const total = lineas.reduce((a, l) => a + l.monto, 0);
  return { lineas, total, porciones: t.porciones, dosPisos: t.pisos === 2 };
}

/** Alérgenos de la torta, sin repetir y en el orden de ALERGENOS. */
export function alergenosTorta(s: Seleccion): Alergeno[] {
  const set = new Set<Alergeno>();
  porId(BIZCOCHOS, s.bizcocho)?.alergenos.forEach((a) => set.add(a));
  porId(RELLENOS, s.relleno)?.alergenos.forEach((a) => set.add(a));
  porId(COBERTURAS, s.cobertura)?.alergenos.forEach((a) => set.add(a));
  s.decoraciones.forEach((id) => porId(DECORACIONES, id)?.alergenos.forEach((a) => set.add(a)));
  return (Object.keys(ALERGENOS) as Alergeno[]).filter((a) => set.has(a));
}

export const etiquetasAlergenos = (a: Alergeno[]) => a.map((x) => ALERGENOS[x]);

const PERMITIDOS = /^[\p{L}\p{N} .,!¡?¿&+:()-]*$/u;

/** Valida el texto escrito sobre la torta. Devuelve un mensaje de error o null. */
export function validarMensaje(texto: string): string | null {
  const t = texto.trim();
  if ([...t].length > MENSAJE_MAX) return `El mensaje admite hasta ${MENSAJE_MAX} caracteres.`;
  if (!PERMITIDOS.test(t)) return 'Usa solo letras, números y signos simples (. , ! ? & + : - paréntesis). Sin emojis.';
  return null;
}

export const dosPisos = (tamanoId: string) => porId(TAMANOS, tamanoId)?.pisos === 2;

/** IGV contenido en un precio que ya lo incluye (informativo). */
export const igvIncluido = (total: number) => Math.round((total - total / (1 + IGV)) * 100) / 100;

/** Adelanto de la política de la demo (50 %), en soles con céntimos. */
export const adelanto = (total: number) => Math.round(total * ADELANTO_PORCENTAJE) / 100;

/** Efecto de un extra por porción sobre la torta del tamaño elegido (misma regla de redondeo que el presupuesto). */
export const efectoPorPorcion = (porPorcion: number, porciones: number) => redondear(porPorcion * porciones);

/** Precio de una decoración según los pisos de la torta. */
export const precioDecoracion = (precio: number, pisos: 1 | 2) => redondear(precio * (pisos === 2 ? FACTOR_DECORACION_2_PISOS : 1));

export const MAX_NOTAS = 200;
