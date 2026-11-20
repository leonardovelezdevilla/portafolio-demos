/** Validaciones compartidas (formularios de reserva y de reclamaciones). */

export function normalizarTexto(v: string): string {
  return (v ?? '').replace(/\s+/g, ' ').trim();
}

export function validarNombre(v: string): string | null {
  const t = normalizarTexto(v);
  if (!t) return 'Escribe tu nombre.';
  if (t.length < 2) return 'El nombre es demasiado corto.';
  if (t.length > 60) return 'El nombre no puede pasar de 60 caracteres.';
  if (!/^[\p{L}][\p{L}\s.'’-]*$/u.test(t)) return 'Usa solo letras en el nombre.';
  return null;
}

/** Celular peruano: 9 dígitos que empiezan con 9 (se aceptan espacios, guiones y +51). */
export function limpiarCelular(v: string): string {
  let d = (v ?? '').replace(/[\s-]/g, '');
  if (d.startsWith('+51')) d = d.slice(3);
  else if (/^51\d{9}$/.test(d)) d = d.slice(2);
  return d;
}

export function validarCelular(v: string): string | null {
  const d = limpiarCelular(v);
  if (!d) return 'Escribe tu número de celular.';
  if (!/^\d+$/.test(d)) return 'El celular solo debe tener números.';
  if (d.length !== 9) return 'El celular peruano tiene 9 dígitos.';
  if (d[0] !== '9') return 'El celular peruano empieza con 9.';
  return null;
}

export function validarDocumento(tipo: string, v: string): string | null {
  const d = (v ?? '').replace(/\s/g, '');
  if (!d) return 'Escribe tu número de documento.';
  if (tipo === 'DNI') return /^\d{8}$/.test(d) ? null : 'El DNI tiene 8 dígitos.';
  if (tipo === 'CE') return /^[A-Za-z0-9]{9,12}$/.test(d) ? null : 'El carné de extranjería tiene entre 9 y 12 caracteres.';
  return /^[A-Za-z0-9]{6,12}$/.test(d) ? null : 'El pasaporte tiene entre 6 y 12 caracteres.';
}

export function validarCorreo(v: string): string | null {
  const t = (v ?? '').trim();
  if (!t) return 'Escribe tu correo.';
  if (t.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return 'Escribe un correo válido, por ejemplo nombre@dominio.pe.';
  return null;
}

export function validarTextoLargo(v: string, min: number, max: number, etiqueta: string): string | null {
  const t = normalizarTexto(v);
  if (!t) return `Cuéntanos ${etiqueta}.`;
  if (t.length < min) return `Agrega un poco más de detalle (mínimo ${min} caracteres).`;
  if (t.length > max) return `Máximo ${max} caracteres.`;
  return null;
}
