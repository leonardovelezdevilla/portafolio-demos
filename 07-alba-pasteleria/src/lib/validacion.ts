import { costoDelivery } from './distritos';
import { validarEntrega } from './fechas';

export type Errores<T extends string> = Partial<Record<T, string>>;

export interface DatosPedido {
  nombre: string;
  entrega: string;
  distrito: string;
  direccion: string;
  fecha: string;
  hora: string;
  mensaje: string;
  notas?: string;
  acepta: string;
}

const soloLetras = /^[\p{L}][\p{L}\s'.-]*$/u;

export function validarPedido(d: DatosPedido, ahora: Date, dosPisos: boolean): Errores<keyof DatosPedido> {
  const e: Errores<keyof DatosPedido> = {};
  const nombre = d.nombre.trim();
  if (!nombre) e.nombre = 'Escribe tu nombre.';
  else if (nombre.length < 3 || !soloLetras.test(nombre)) e.nombre = 'Ingresa un nombre válido (solo letras, mínimo 3).';
  if (d.entrega !== 'recojo' && d.entrega !== 'delivery') e.entrega = 'Elige recojo en tienda o delivery.';
  if (d.entrega === 'delivery') {
    if (!d.distrito.trim()) e.distrito = 'Elige el distrito de entrega.';
    else if (!costoDelivery(d.distrito, dosPisos).cubierto) e.distrito = 'Ese distrito no tiene delivery. Elige uno de la lista o recoge en tienda.';
    const dir = d.direccion.trim();
    if (!dir) e.direccion = 'Escribe la dirección de entrega.';
    else if (dir.length < 8) e.direccion = 'Agrega más detalle (calle, número y una referencia).';
  }
  const ent = validarEntrega(d.fecha, d.hora, ahora, dosPisos);
  if (!ent.ok) e[ent.campo] = ent.mensaje;
  if ((d.notas ?? '').trim().length > 200) e.notas = 'Los detalles admiten hasta 200 caracteres.';
  if (d.acepta !== 'si') e.acepta = 'Marca la casilla para continuar a WhatsApp.';
  return e;
}

export interface DatosReclamo {
  nombre: string;
  dni: string;
  email: string;
  telefono: string;
  domicilio: string;
  menor: string;
  apoderado: string;
  bien: string;
  descripcionBien: string;
  monto: string;
  tipo: string;
  detalle: string;
  pedido: string;
}

export function validarReclamo(d: DatosReclamo): Errores<keyof DatosReclamo> {
  const e: Errores<keyof DatosReclamo> = {};
  const nombre = d.nombre.trim();
  if (!nombre) e.nombre = 'Escribe tus nombres y apellidos.';
  else if (nombre.length < 5 || !soloLetras.test(nombre)) e.nombre = 'Ingresa nombres y apellidos válidos.';
  if (!d.dni.trim()) e.dni = 'Escribe tu documento de identidad.';
  else if (!/^(\d{8}|[A-Za-z0-9]{9,12})$/.test(d.dni.trim())) e.dni = 'Escribe un DNI de 8 dígitos o un carné/pasaporte de 9 a 12 caracteres.';
  if (!d.email.trim()) e.email = 'Escribe tu correo.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = 'Ingresa un correo válido, por ejemplo nombre@ejemplo.invalid.';
  if (!d.telefono.trim()) e.telefono = 'Escribe tu teléfono.';
  else if (!/^(\+?51)?9\d{8}$/.test(d.telefono.replace(/[\s-]/g, ''))) e.telefono = 'Ingresa un celular peruano de 9 dígitos que empiece con 9.';
  if (d.domicilio.trim().length < 8) e.domicilio = 'Escribe tu domicilio completo (mínimo 8 caracteres).';
  if (d.menor === 'si') {
    const ap = d.apoderado.trim();
    if (!ap) e.apoderado = 'Escribe el nombre del padre, madre o apoderado.';
    else if (ap.length < 5 || !soloLetras.test(ap)) e.apoderado = 'Ingresa nombres y apellidos válidos del apoderado.';
  }
  if (!['producto', 'servicio'].includes(d.bien)) e.bien = 'Indica si es un producto o un servicio.';
  if (d.descripcionBien.trim().length < 3) e.descripcionBien = 'Describe el bien contratado (por ejemplo, torta de 12 porciones, bizcocho de vainilla).';
  if (d.monto.trim() && !(Number(d.monto.replace(',', '.')) >= 0)) e.monto = 'El monto debe ser un número, por ejemplo 185.00.';
  if (!['reclamo', 'queja'].includes(d.tipo)) e.tipo = 'Elige si es un reclamo o una queja.';
  if (d.detalle.trim().length < 20) e.detalle = 'Describe lo ocurrido con al menos 20 caracteres.';
  if (d.pedido.trim().length < 10) e.pedido = 'Indica qué solución esperas (mínimo 10 caracteres).';
  return e;
}

/** Hoja de reclamación de demo: LR-AAAA-NNNNNN. `azar` inyectable para pruebas. */
export function numeroHoja(fecha = new Date(), azar: () => number = Math.random): string {
  const n = String(Math.floor(azar() * 1_000_000)).padStart(6, '0');
  return `LR-${fecha.getFullYear()}-${n}`;
}

/** Número de pedido de demo: AL-AAAA-NNNN. */
export function numeroPedido(fecha = new Date(), azar: () => number = Math.random): string {
  return `AL-${fecha.getFullYear()}-${String(Math.floor(azar() * 10_000)).padStart(4, '0')}`;
}
