/** Validaciones en español de la matrícula y del Libro de Reclamaciones. Cada validador devuelve un mensaje o ''. */
import { GRUPOS, etiquetaGrupo, type Grupo } from '../data/horarios';
import { NEGOCIO } from './negocio';
import { edadEn, formatearFecha } from './fechas';
import { vacantesDe } from './vacantes';

export const EDAD_MINIMA = 12;
export const EDAD_MAXIMA = 100;
export const MAYORIA_DE_EDAD = 18;

export function esMenorDeEdad(edad: number): boolean {
  return edad >= 0 && edad < MAYORIA_DE_EDAD;
}

/** `de` completa el mensaje, p. ej. «del alumno»: «Escribe nombre y apellido del alumno.» */
export function validarNombre(v: string, de = ''): string {
  const t = v.trim().replace(/\s+/g, ' ');
  if (!t) return de ? `Escribe nombre y apellido ${de}.` : 'Escribe tu nombre y apellido.';
  if (t.length < 5 || t.length > 80) return 'Escribe el nombre completo (entre 5 y 80 caracteres).';
  if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(t)) return 'Solo puede tener letras y espacios.';
  if (t.split(' ').length < 2) return 'Incluye al menos un nombre y un apellido.';
  return '';
}

/** Nombre de pila e inicial del primer apellido: «Sofía Paredes Vega» → «Sofía P.». */
export function abreviarNombre(v: string): string {
  const p = v.trim().replace(/\s+/g, ' ').split(' ');
  if (p.length < 2) return p[0] ?? '';
  return `${p[0]} ${p[1][0].toUpperCase()}.`;
}

export function normalizarCelular(v: string): string {
  return v.replace(/[\s-]/g, '');
}

export function validarCelular(v: string): string {
  const t = normalizarCelular(v);
  if (!t) return 'Escribe un celular de 9 dígitos.';
  if (!/^\d+$/.test(t)) return 'El celular solo puede tener números.';
  if (t.length !== 9) return 'El celular debe tener 9 dígitos.';
  if (t[0] !== '9') return 'El celular peruano empieza con 9.';
  return '';
}

export function validarCorreo(v: string): string {
  const t = v.trim();
  if (!t) return 'Escribe tu correo electrónico.';
  if (t.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return 'Escribe un correo válido, por ejemplo nombre@dominio.com.';
  return '';
}

export function validarNacimiento(nacimiento: string, hoy: string): string {
  if (!nacimiento) return 'Escribe la fecha de nacimiento del alumno.';
  const edad = edadEn(nacimiento, hoy);
  if (edad < 0) return 'La fecha de nacimiento no es válida (no puede ser futura).';
  if (edad < EDAD_MINIMA) return `Lumen recibe alumnos desde los ${EDAD_MINIMA} años.`;
  if (edad > EDAD_MAXIMA) return 'Revisa la fecha de nacimiento: la edad parece demasiado alta.';
  return '';
}

export const PARENTESCOS = ['Madre', 'Padre', 'Apoderado(a)'] as const;

/** Un grupo de jóvenes solo admite menores de 18; uno de adultos, mayores de edad. */
export function grupoCompatible(edad: number, g: Pick<Grupo, 'publico'>): boolean {
  return esMenorDeEdad(edad) ? g.publico.startsWith('Jóvenes') : g.publico.startsWith('Adultos');
}

export function validarHorario(grupoId: string, edad: number): string {
  if (!grupoId) return 'Elige el horario en el que quieres estudiar.';
  const g = GRUPOS.find((x) => x.id === grupoId);
  if (!g) return 'El horario elegido no existe. Elige otro de la lista.';
  if (vacantesDe(g).libres <= 0) return 'Ese horario está sin vacantes. Elige otro.';
  if (edad >= 0 && !grupoCompatible(edad, g)) {
    return esMenorDeEdad(edad)
      ? 'Ese grupo es para adultos. Para un menor de edad elige un horario de jóvenes (12 a 17).'
      : 'Ese grupo es para jóvenes de 12 a 17 años. Elige un horario de adultos.';
  }
  return '';
}

export interface DatosMatricula {
  alumno: string;
  nacimiento: string;
  celular: string;
  correo: string;
  horario: string;
  consentimiento: boolean;
  // Solo si el alumno es menor de edad:
  apoderado: string;
  parentesco: string;
  celularApoderado: string;
  autorizacion: boolean;
}

export type ErroresMatricula = Partial<Record<keyof DatosMatricula, string>>;

/** Validación completa. Para menores de edad exige los datos del padre, madre o apoderado y su autorización. */
export function validarMatricula(d: DatosMatricula, hoy: string): ErroresMatricula {
  const e: ErroresMatricula = {};
  const nombre = validarNombre(d.alumno, 'del alumno');
  if (nombre) e.alumno = nombre;
  const nac = validarNacimiento(d.nacimiento, hoy);
  if (nac) e.nacimiento = nac;
  const edad = nac ? -1 : edadEn(d.nacimiento, hoy);
  const menor = esMenorDeEdad(edad);

  if (menor) {
    const ap = validarNombre(d.apoderado, 'del padre, madre o apoderado');
    if (ap) e.apoderado = ap;
    if (!(PARENTESCOS as readonly string[]).includes(d.parentesco)) e.parentesco = 'Indica si es madre, padre o apoderado(a).';
    const ca = validarCelular(d.celularApoderado);
    if (ca) e.celularApoderado = ca;
    if (!d.autorizacion) e.autorizacion = 'El padre, madre o apoderado debe autorizar la matrícula del menor.';
    // El celular del alumno es opcional si es menor, pero si lo escribe debe ser válido.
    if (d.celular.trim()) {
      const c = validarCelular(d.celular);
      if (c) e.celular = c;
    }
  } else {
    const c = validarCelular(d.celular);
    if (c) e.celular = c;
  }

  const co = validarCorreo(d.correo);
  if (co) e.correo = co;
  const h = validarHorario(d.horario, nac ? -1 : edad);
  if (h) e.horario = h;
  if (!d.consentimiento) e.consentimiento = 'Marca la casilla para aceptar el tratamiento de datos personales y continuar.';
  return e;
}

/**
 * Mensaje de WhatsApp. Minimiza datos: no incluye fecha de nacimiento ni correo.
 * Si es menor, escribe el padre, madre o apoderado y el menor va solo con nombre de pila e inicial del apellido.
 */
export function construirMensajeWhatsApp(d: DatosMatricula, hoy: string): string {
  const g = GRUPOS.find((x) => x.id === d.horario);
  const menor = esMenorDeEdad(edadEn(d.nacimiento, hoy));
  const lineas = menor
    ? [
        `Hola, soy ${d.apoderado.trim()} (${d.parentesco.toLowerCase()}). Quiero matricular a ${abreviarNombre(d.alumno)} (menor de edad) en ${NEGOCIO.nombreLargo} (demo).`,
        `Mi celular: ${normalizarCelular(d.celularApoderado)}`,
      ]
    : [`Hola, soy ${d.alumno.trim()}. Quiero matricularme en ${NEGOCIO.nombreLargo} (demo).`, `Celular: ${normalizarCelular(d.celular)}`];
  if (g) lineas.push(`Horario: ${etiquetaGrupo(g)}`);
  lineas.push('Entiendo que la ubicación final se confirma con una entrevista.');
  return lineas.join('\n');
}

export function construirUrlWhatsApp(d: DatosMatricula, hoy: string): string {
  return `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(construirMensajeWhatsApp(d, hoy))}`;
}

/* ---------- Libro de Reclamaciones de demo ---------- */

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
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(t)) return 'Escribe un monto válido en soles, por ejemplo 480 o 480.50.';
  return '';
}

export { formatearFecha };
