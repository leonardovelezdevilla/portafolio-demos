/** Validaciones en español. Cada función devuelve un mensaje de error o '' si el dato es correcto. */
import { NEGOCIO } from './negocio';
import { formatearFecha } from './horarios';

export function validarNombre(v: string): string {
  const t = v.trim().replace(/\s+/g, ' ');
  if (!t) return 'Escribe tu nombre y apellido.';
  if (t.length < 5 || t.length > 80) return 'Escribe tu nombre completo (entre 5 y 80 caracteres).';
  if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(t)) return 'El nombre solo puede tener letras y espacios.';
  if (t.split(' ').length < 2) return 'Incluye al menos un nombre y un apellido.';
  return '';
}

export function normalizarCelular(v: string): string {
  return v.replace(/[\s-]/g, '');
}

export function validarCelular(v: string): string {
  const t = normalizarCelular(v);
  if (!t) return 'Escribe tu celular de 9 dígitos.';
  if (!/^\d+$/.test(t)) return 'El celular solo puede tener números.';
  if (t.length !== 9) return 'El celular debe tener 9 dígitos.';
  if (t[0] !== '9') return 'El celular peruano empieza con 9.';
  return '';
}

/** DNI opcional: vacío es válido. */
export function validarDni(v: string): string {
  const t = v.trim();
  if (!t) return '';
  if (!/^\d{8}$/.test(t)) return 'El DNI debe tener exactamente 8 números.';
  return '';
}

/**
 * Motivos generales de consulta. Son los únicos que viajan por WhatsApp: no hay texto libre,
 * así los datos de salud (sensibles, Ley 29733) no pasan a Meta con más detalle del necesario.
 */
export const MOTIVOS_GENERALES = [
  'Control de acné',
  'Revisión de lunares o manchas',
  'Piel sensible o irritación',
  'Caída del cabello',
  'Procedimiento (peeling o crioterapia)',
  'Primera consulta, aún no lo sé',
] as const;

export function validarMotivo(v: string): string {
  const t = v.trim();
  if (t.length < 5) return 'Elige un motivo general de la lista.';
  if (t.length > 200) return 'El motivo es muy largo; elige uno de la lista.';
  return '';
}

/** En el formulario solo se admite un motivo de la lista (sin texto libre). */
export function validarMotivoGeneral(v: string): string {
  return (MOTIVOS_GENERALES as readonly string[]).includes(v.trim()) ? '' : 'Elige un motivo general de la lista.';
}

export function validarConsentimiento(v: boolean): string {
  return v ? '' : 'Debes aceptar el tratamiento de tus datos personales y de salud para continuar.';
}

export function validarCorreo(v: string): string {
  const t = v.trim();
  if (!t) return 'Escribe tu correo electrónico.';
  if (t.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return 'Escribe un correo válido, por ejemplo nombre@dominio.com.';
  return '';
}

export interface DatosReserva {
  nombre: string;
  celular: string;
  dni: string;
  motivo: string;
  consentimiento: boolean;
}

export function validarPaciente(d: DatosReserva): Partial<Record<keyof DatosReserva, string>> {
  const e: Partial<Record<keyof DatosReserva, string>> = {};
  const n = validarNombre(d.nombre);
  if (n) e.nombre = n;
  const c = validarCelular(d.celular);
  if (c) e.celular = c;
  const dn = validarDni(d.dni);
  if (dn) e.dni = dn;
  const m = validarMotivo(d.motivo);
  if (m) e.motivo = m;
  const k = validarConsentimiento(d.consentimiento);
  if (k) e.consentimiento = k;
  return e;
}

export interface ResumenCita extends DatosReserva {
  especialista: string;
  fecha: string;
  hora: string;
  tratamiento?: string;
}

export function construirMensajeWhatsApp(r: ResumenCita): string {
  const lineas = [
    `Hola, soy ${r.nombre.trim()}. Quisiera reservar una cita en ${NEGOCIO.nombre} (demo).`,
    `Especialista: ${r.especialista}`,
    `Fecha: ${formatearFecha(r.fecha)}`,
    `Hora: ${r.hora}`,
    `Celular: ${normalizarCelular(r.celular)}`,
  ];
  if (r.tratamiento?.trim()) lineas.push(`Tratamiento de interés: ${r.tratamiento.trim()}`);
  // El DNI no se envía por WhatsApp (minimización de datos): se pide en la clínica.
  lineas.push(`Motivo: ${r.motivo.trim()}`);
  return lineas.join('\n');
}

export function construirUrlWhatsApp(r: ResumenCita): string {
  return `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(construirMensajeWhatsApp(r))}`;
}

/* ---------- Libro de Reclamaciones de demo ---------- */

export type TipoDoc = 'DNI' | 'CE' | 'PASAPORTE';

export function validarDocumento(tipo: string, num: string): string {
  const t = num.trim();
  if (!t) return 'Escribe tu número de documento.';
  if (tipo === 'DNI') return /^\d{8}$/.test(t) ? '' : 'El DNI debe tener exactamente 8 números.';
  if (tipo === 'CE') return /^[A-Za-z0-9]{9,12}$/.test(t) ? '' : 'El carné de extranjería tiene entre 9 y 12 letras o números.';
  if (tipo === 'PASAPORTE') return /^[A-Za-z0-9]{6,12}$/.test(t) ? '' : 'El pasaporte tiene entre 6 y 12 letras o números.';
  return 'Elige un tipo de documento.';
}

export function validarTexto(v: string, min: number, max: number, nombreCampo: string): string {
  const t = v.trim();
  if (t.length < min) return `${nombreCampo}: escribe al menos ${min} caracteres.`;
  if (t.length > max) return `${nombreCampo}: máximo ${max} caracteres.`;
  return '';
}

/** Monto opcional en soles; vacío es válido. */
export function validarMonto(v: string): string {
  const t = v.trim().replace(',', '.');
  if (!t) return '';
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(t)) return 'Escribe un monto válido en soles, por ejemplo 180 o 180.50.';
  return '';
}

/** Número de hoja de reclamación de demostración, p. ej. LR-DEMO-2026-000123. */
export function numeroHoja(ahora: Date, correlativo: number): string {
  const anio = ahora.getUTCFullYear();
  const n = Math.max(1, Math.floor(correlativo)) % 1000000;
  return `LR-DEMO-${anio}-${String(n).padStart(6, '0')}`;
}
