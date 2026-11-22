export type Errores<T extends string> = Partial<Record<T, string>>;

export const METODOS_PAGO = ['Tarjeta en línea', 'Yape', 'Plin', 'Contraentrega'] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

export interface DatosPedido {
  nombre: string;
  distrito: string;
  referencia: string;
  pago: string;
}

export interface DatosPedidoForm extends DatosPedido {
  /** Valor de la casilla de consentimiento ('si' cuando está marcada). */
  acepta: string;
}

const soloLetras = /^[\p{L}][\p{L}\s'.-]*$/u;

export function validarPedido(d: DatosPedidoForm): Errores<keyof DatosPedidoForm> {
  const e: Errores<keyof DatosPedidoForm> = {};
  const nombre = d.nombre.trim();
  if (!nombre) e.nombre = 'Escribe tu nombre.';
  else if (nombre.length < 3 || !soloLetras.test(nombre)) e.nombre = 'Ingresa un nombre válido (solo letras, mínimo 3).';
  const distrito = d.distrito.trim();
  if (!distrito) e.distrito = 'Indica tu distrito o ciudad.';
  else if (distrito.length < 3) e.distrito = 'El distrito debe tener al menos 3 letras.';
  const ref = d.referencia.trim();
  if (!ref) e.referencia = 'Escribe una dirección de referencia.';
  else if (ref.length < 8) e.referencia = 'Agrega más detalle (calle, número o punto de referencia).';
  if (!(METODOS_PAGO as readonly string[]).includes(d.pago)) e.pago = 'Elige un método de pago.';
  if (d.acepta !== 'si') e.acepta = 'Debes autorizar el uso de tus datos para gestionar el pedido.';
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
  acepta: string;
}

export function validarReclamo(d: DatosReclamo): Errores<keyof DatosReclamo> {
  const e: Errores<keyof DatosReclamo> = {};
  const nombre = d.nombre.trim();
  if (!nombre) e.nombre = 'Escribe tus nombres y apellidos.';
  else if (nombre.length < 5 || !soloLetras.test(nombre)) e.nombre = 'Ingresa nombres y apellidos válidos.';
  if (!d.dni.trim()) e.dni = 'Escribe tu DNI.';
  else if (!/^\d{8}$/.test(d.dni.trim())) e.dni = 'El DNI debe tener 8 dígitos.';
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
  if (d.descripcionBien.trim().length < 3) e.descripcionBien = 'Describe el bien contratado (por ejemplo, Chapa Roja talla 41).';
  if (d.monto.trim() && !(Number(d.monto.replace(',', '.')) >= 0)) e.monto = 'El monto debe ser un número, por ejemplo 249.90.';
  if (!['reclamo', 'queja'].includes(d.tipo)) e.tipo = 'Elige si es un reclamo o una queja.';
  if (d.detalle.trim().length < 20) e.detalle = 'Describe lo ocurrido con al menos 20 caracteres.';
  if (d.pedido.trim().length < 10) e.pedido = 'Indica qué solución esperas (mínimo 10 caracteres).';
  if (d.acepta !== 'si') e.acepta = 'Debes aceptar el tratamiento de tus datos para registrar la hoja (demo).';
  return e;
}

/** Hoja de reclamación de demo: LR-AAAA-NNNNNN. `azar` inyectable para pruebas. */
export function numeroHoja(fecha = new Date(), azar: () => number = Math.random): string {
  const n = String(Math.floor(azar() * 1_000_000)).padStart(6, '0');
  return `LR-${fecha.getFullYear()}-${n}`;
}
