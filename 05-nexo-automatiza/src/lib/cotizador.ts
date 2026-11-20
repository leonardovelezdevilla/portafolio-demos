import { PRECIOS, type TablaPrecios } from '../data/precios';

export interface EntradaCotizador {
  tipo: string;
  procesos: string[];
  volumen: string;
  integraciones: string[];
  urgencia: string;
}

export interface Cotizacion {
  min: number;
  max: number;
  descuento: number; // 0..1
  soporteMin: number;
  soporteMax: number;
}

function buscar<T extends { id: string }>(lista: T[], id: string, campo: string): T {
  const x = lista.find((i) => i.id === id);
  if (!x) throw new RangeError(`Valor no válido para ${campo}: «${id}»`);
  return x;
}

const redondear = (n: number, paso: number, modo: 'abajo' | 'arriba') =>
  (modo === 'abajo' ? Math.floor(n / paso) : Math.ceil(n / paso)) * paso;

/**
 * Calcula el rango referencial en S/. Función pura: no toca el DOM ni lee globales.
 * Lanza RangeError si falta algún dato o un id no existe en la tabla.
 */
export function cotizar(e: EntradaCotizador, t: TablaPrecios = PRECIOS): Cotizacion {
  const tipo = buscar(t.tipos, e.tipo, 'tipo de negocio');
  const volumen = buscar(t.volumenes, e.volumen, 'volumen');
  const urgencia = buscar(t.urgencias, e.urgencia, 'urgencia');
  const procesosUnicos = [...new Set(e.procesos)];
  if (procesosUnicos.length === 0) throw new RangeError('Elige al menos un proceso');
  const procesos = procesosUnicos.map((id) => buscar(t.procesos, id, 'proceso'));
  const integraciones = [...new Set(e.integraciones)].map((id) => buscar(t.integraciones, id, 'integración'));

  let min = procesos.reduce((s, p) => s + p.min, 0) + integraciones.reduce((s, i) => s + i.min, 0);
  let max = procesos.reduce((s, p) => s + p.max, 0) + integraciones.reduce((s, i) => s + i.max, 0);

  const factor = tipo.factor * volumen.factor * urgencia.factor;
  const descuento =
    [...t.descuentos].sort((a, b) => b.desde - a.desde).find((d) => procesos.length >= d.desde)?.descuento ?? 0;
  min *= factor * (1 - descuento);
  max *= factor * (1 - descuento);

  return {
    min: redondear(min, t.redondeo, 'abajo'),
    max: redondear(max, t.redondeo, 'arriba'),
    descuento,
    soporteMin: redondear(procesos.length * t.soporte.min, 10, 'abajo'),
    soporteMax: redondear(procesos.length * t.soporte.max, 10, 'arriba'),
  };
}

export const formatoSoles = (n: number): string =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 })
    .format(n); // Intl ya usa espacio de no ruptura tras «S/»

export const WHATSAPP_NEXO = '51900000000';

/** Mensaje prellenado para wa.me con el resumen de las respuestas. */
export function mensajeWhatsApp(e: EntradaCotizador, c: Cotizacion, t: TablaPrecios = PRECIOS): string {
  const nombres = (lista: { id: string; etiqueta: string }[], ids: string[]) =>
    ids.map((id) => lista.find((i) => i.id === id)?.etiqueta ?? id).join(', ') || 'ninguna';
  return [
    'Hola Nexo, hice el cotizador de su web (demo) y quiero un diagnóstico.',
    `Negocio: ${nombres(t.tipos, [e.tipo])}`,
    `Procesos: ${nombres(t.procesos, e.procesos)}`,
    `Volumen: ${nombres(t.volumenes, [e.volumen])}`,
    `Integraciones: ${nombres(t.integraciones, e.integraciones)}`,
    `Urgencia: ${nombres(t.urgencias, [e.urgencia])}`,
    `Rango referencial (sin IGV): ${formatoSoles(c.min)} a ${formatoSoles(c.max)}`,
  ].join('\n');
}

export const enlaceWhatsApp = (texto: string, telefono = WHATSAPP_NEXO): string =>
  `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;
