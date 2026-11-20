import { ENVIO, formatoSoles, totales, type Linea, type ProductoCarrito, type Zona } from './carrito';
import type { DatosPedido } from './validacion';

export const TELEFONO_DEMO = '51900000000';

/** Quita espacios duros que mete Intl para que el mensaje sea limpio en WhatsApp. */
const soles = (n: number) => formatoSoles(n).replace(/ /g, ' ');

export function armarMensaje(
  datos: DatosPedido,
  lineas: Linea[],
  catalogo: ProductoCarrito[],
  zona: Zona,
): string {
  const t = totales(lineas, catalogo, zona);
  const items = lineas.map((l) => {
    const p = catalogo.find((x) => x.slug === l.slug);
    const nombre = p?.nombre ?? l.slug;
    const parcial = p ? p.precio * l.cantidad : 0;
    return `- ${l.cantidad} x ${nombre} (talla EU ${l.talla}) = ${soles(parcial)}`;
  });
  return [
    'Hola Vértice Studio, quiero hacer este pedido (demo):',
    '',
    ...items,
    '',
    `Subtotal: ${soles(t.subtotal)}`,
    `Envío ${ENVIO[zona].etiqueta}: ${t.envio === 0 ? 'Gratis' : soles(t.envio)}`,
    `Total: ${soles(t.total)}`,
    '',
    `Nombre: ${datos.nombre.trim()}`,
    `Distrito: ${datos.distrito.trim()}`,
    `Referencia: ${datos.referencia.trim()}`,
    `Pago: ${datos.pago}`,
  ].join('\n');
}

export const urlWhatsApp = (mensaje: string, telefono = TELEFONO_DEMO) =>
  `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
