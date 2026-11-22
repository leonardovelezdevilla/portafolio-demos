import { BIZCOCHOS, COBERTURAS, DECORACIONES, RELLENOS, TAMANOS } from './config';
import { costoDelivery } from './distritos';
import { etiquetaFecha } from './fechas';
import { adelanto, alergenosTorta, etiquetasAlergenos, formatoSoles, presupuestoTorta, type Seleccion } from './precio';
import type { DatosPedido } from './validacion';

export const TELEFONO_DEMO = '51935852637'; // WhatsApp del estudio Vélez De Villa (las demos publicadas escriben al estudio)

export interface ResumenPedido {
  total: number;
  torta: number;
  envio: number;
  adelanto: number;
}

/** Totales del pedido: torta + delivery (si lo hay). */
export function totalesPedido(sel: Seleccion, d: Pick<DatosPedido, 'entrega' | 'distrito'>): ResumenPedido | null {
  const p = presupuestoTorta(sel);
  if (!p) return null;
  const envio = d.entrega === 'delivery' ? costoDelivery(d.distrito, p.dosPisos).total : 0;
  const total = p.total + envio;
  return { torta: p.total, envio, total, adelanto: adelanto(total) };
}

export function armarMensaje(sel: Seleccion, d: DatosPedido, numero: string): string {
  const t = TAMANOS.find((x) => x.id === sel.tamano)!;
  const b = BIZCOCHOS.find((x) => x.id === sel.bizcocho)!;
  const r = RELLENOS.find((x) => x.id === sel.relleno)!;
  const c = COBERTURAS.find((x) => x.id === sel.cobertura)!;
  const decs = sel.decoraciones.map((id) => DECORACIONES.find((x) => x.id === id)?.nombre).filter(Boolean);
  const tot = totalesPedido(sel, d)!;
  const delivery = d.entrega === 'delivery';
  return [
    `Hola Alba, quiero encargar una torta (demo, pedido ${numero}):`,
    '',
    `- Tamaño: ${t.etiqueta}`,
    `- Bizcocho: ${b.nombre}`,
    `- Relleno: ${r.nombre}`,
    `- Cobertura: ${c.nombre}`,
    `- Decoración: ${decs.length ? decs.join(', ') : 'Ninguna'}`,
    `- Mensaje en la torta: ${sel.mensaje.trim() ? `"${sel.mensaje.trim()}"` : 'Sin mensaje'}`,
    ...((d.notas ?? '').trim() ? [`- Detalles del diseño: ${d.notas!.trim()}`] : []),
    `- Alérgenos según receta: ${etiquetasAlergenos(alergenosTorta(sel)).join(', ')}`,
    '',
    `Entrega: ${delivery ? `Delivery a ${d.distrito.trim()}, ${d.direccion.trim()}` : 'Recojo en tienda (Jesús María)'}`,
    `Fecha y hora: ${etiquetaFecha(d.fecha)}, ${d.hora}`,
    '',
    `Torta: ${formatoSoles(tot.torta)}`,
    delivery ? `Delivery: ${formatoSoles(tot.envio)}` : 'Delivery: no aplica',
    `Total (IGV incluido): ${formatoSoles(tot.total)}`,
    `Adelanto 50 % por Yape o Plin: ${formatoSoles(tot.adelanto)}`,
    '',
    `Nombre: ${d.nombre.trim()}`,
  ].join('\n');
}

export const urlWhatsApp = (mensaje: string, telefono = TELEFONO_DEMO) =>
  `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
