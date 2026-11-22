import { SERVICIOS_RESERVA, TAMANOS_BANO, TELEFONO_DEMO, NEGOCIO, type ServicioId } from './config';
import { etiquetaFecha, validarCita } from './fechas';

export interface DatosCita {
  servicio: string;
  especie: string;
  tamano: string;
  mascota: string;
  edadValor: string;
  edadUnidad: string;
  dueno: string;
  celular: string;
  fecha: string;
  hora: string;
  sintomas: string;
  acepta: string;
}
export type Errores = Partial<Record<keyof DatosCita, string>>;

const soloLetras = /^[\p{L}][\p{L}\s'.-]*$/u;
const nombreMascota = /^[\p{L}\p{N}][\p{L}\p{N}\s'.-]*$/u;
export const normalizarCelular = (v: string) => v.replace(/[\s-]/g, '').replace(/^\+?51/, '');
export const celularValido = (v: string) => /^9\d{8}$/.test(normalizarCelular(v));

export const LIMITE_EDAD: Record<string, [number, string]> = { semanas: [12, 'semanas'], meses: [35, 'meses'], anios: [30, 'años'] };

export function validarCitaForm(d: DatosCita, ahora: Date): Errores {
  const e: Errores = {};
  const ids = SERVICIOS_RESERVA.map((s) => s.id as string);
  if (!ids.includes(d.servicio)) e.servicio = 'Elige el servicio: consulta, vacuna o baño y peluquería.';
  if (!['perro', 'gato'].includes(d.especie)) e.especie = 'Indica si tu mascota es perro o gato.';
  if (d.servicio === 'bano' && !TAMANOS_BANO.some((t) => t.id === d.tamano)) e.tamano = 'Elige el tamaño de tu mascota para el baño.';
  const m = d.mascota.trim();
  if (!m) e.mascota = 'Escribe el nombre de tu mascota.';
  else if (m.length < 2 || m.length > 30 || !nombreMascota.test(m)) e.mascota = 'Ingresa un nombre válido (2 a 30 caracteres, sin símbolos).';
  const lim = LIMITE_EDAD[d.edadUnidad];
  const n = Number(d.edadValor);
  if (!lim) e.edadValor = 'Elige si la edad es en semanas, meses o años.';
  else if (!d.edadValor.trim()) e.edadValor = 'Escribe la edad aproximada de tu mascota.';
  else if (!Number.isInteger(n) || n < 1 || n > lim[0]) e.edadValor = `Escribe un número entero de 1 a ${lim[0]} ${lim[1]}.`;
  const o = d.dueno.trim();
  if (!o) e.dueno = 'Escribe tu nombre.';
  else if (o.length < 3 || !soloLetras.test(o)) e.dueno = 'Ingresa un nombre válido (solo letras, mínimo 3).';
  if (!d.celular.trim()) e.celular = 'Escribe tu celular.';
  else if (!celularValido(d.celular)) e.celular = 'Ingresa un celular peruano de 9 dígitos que empiece con 9.';
  if (ids.includes(d.servicio)) {
    const r = validarCita(d.fecha, d.hora, d.servicio as ServicioId, ahora);
    if (!r.ok) e[r.campo] = r.mensaje;
  } else {
    if (!d.fecha) e.fecha = 'Elige la fecha de la cita.';
    if (!d.hora) e.hora = 'Elige la hora de la cita.';
  }
  if (d.sintomas.trim().length > 200) e.sintomas = 'El texto admite hasta 200 caracteres.';
  if (d.acepta !== 'si') e.acepta = 'Marca la casilla para continuar a WhatsApp.';
  return e;
}

/** Número de cita de demo: CP-AAAA-NNNN. `azar` inyectable para pruebas. */
export function numeroCita(fecha = new Date(), azar: () => number = Math.random): string {
  return `CP-${fecha.getFullYear()}-${String(Math.floor(azar() * 10_000)).padStart(4, '0')}`;
}

/** Mensaje de WhatsApp: sin síntomas, sin celular y sin datos clínicos. Solo el nombre de pila del dueño. */
export function armarMensaje(d: DatosCita, numero: string): string {
  const s = SERVICIOS_RESERVA.find((x) => x.id === d.servicio)!;
  const t = TAMANOS_BANO.find((x) => x.id === d.tamano);
  return [
    `Hola ${NEGOCIO.nombre}, quiero solicitar una cita (demo, código ${numero}):`,
    '',
    `- Servicio: ${s.nombre}${d.servicio === 'bano' && t ? ` (${t.nombre})` : ''}`,
    `- Mascota: ${d.mascota.trim()} (${d.especie})`,
    `- Fecha y hora: ${etiquetaFecha(d.fecha)}, ${d.hora}`,
    `- A nombre de: ${d.dueno.trim().split(/\s+/)[0]}`,
    '',
    'Los detalles de salud los comento en la clínica.',
  ].join('\n');
}
export const urlWhatsApp = (mensaje: string, telefono = TELEFONO_DEMO) => `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

export interface DatosReclamo {
  nombre: string; dni: string; email: string; telefono: string; domicilio: string; menor: string; apoderado: string;
  bien: string; descripcionBien: string; monto: string; tipo: string; detalle: string; pedido: string;
}
export type ErroresReclamo = Partial<Record<keyof DatosReclamo, string>>;

export function validarReclamo(d: DatosReclamo): ErroresReclamo {
  const e: ErroresReclamo = {};
  const nombre = d.nombre.trim();
  if (!nombre) e.nombre = 'Escribe tus nombres y apellidos.';
  else if (nombre.length < 5 || !soloLetras.test(nombre)) e.nombre = 'Ingresa nombres y apellidos válidos.';
  if (!d.dni.trim()) e.dni = 'Escribe tu documento de identidad.';
  else if (!/^(\d{8}|[A-Za-z0-9]{9,12})$/.test(d.dni.trim())) e.dni = 'Escribe un DNI de 8 dígitos o un carné/pasaporte de 9 a 12 caracteres.';
  if (!d.email.trim()) e.email = 'Escribe tu correo.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = 'Ingresa un correo válido, por ejemplo nombre@ejemplo.invalid.';
  if (!d.telefono.trim()) e.telefono = 'Escribe tu teléfono.';
  else if (!celularValido(d.telefono)) e.telefono = 'Ingresa un celular peruano de 9 dígitos que empiece con 9.';
  if (d.domicilio.trim().length < 8) e.domicilio = 'Escribe tu domicilio completo (mínimo 8 caracteres).';
  if (d.menor === 'si') {
    const ap = d.apoderado.trim();
    if (!ap) e.apoderado = 'Escribe el nombre del padre, madre o apoderado.';
    else if (ap.length < 5 || !soloLetras.test(ap)) e.apoderado = 'Ingresa nombres y apellidos válidos del apoderado.';
  }
  if (!['producto', 'servicio'].includes(d.bien)) e.bien = 'Indica si es un producto o un servicio.';
  if (d.descripcionBien.trim().length < 3) e.descripcionBien = 'Describe el bien contratado (por ejemplo, baño de perro mediano).';
  if (d.monto.trim() && !(Number(d.monto.replace(',', '.')) >= 0)) e.monto = 'El monto debe ser un número, por ejemplo 70.00.';
  if (!['reclamo', 'queja'].includes(d.tipo)) e.tipo = 'Elige si es un reclamo o una queja.';
  if (d.detalle.trim().length < 20) e.detalle = 'Describe lo ocurrido con al menos 20 caracteres.';
  if (d.pedido.trim().length < 10) e.pedido = 'Indica qué solución esperas (mínimo 10 caracteres).';
  return e;
}
export function numeroHoja(fecha = new Date(), azar: () => number = Math.random): string {
  return `LR-${fecha.getFullYear()}-${String(Math.floor(azar() * 1_000_000)).padStart(6, '0')}`;
}
