const OFFSET_LIMA_MIN = -5 * 60;

/** Fecha (YYYY-MM-DD) en America/Lima (UTC-5, sin horario de verano). */
export function hoyLima(ahora: Date = new Date()): string {
  return new Date(ahora.getTime() + OFFSET_LIMA_MIN * 60000).toISOString().slice(0, 10);
}

export function formatearFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

/** ¿Es una fecha real con formato YYYY-MM-DD? */
export function fechaValida(f: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return false;
  const [y, m, d] = f.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

/** Edad cumplida en años a la fecha `hoy`. Devuelve -1 si la fecha de nacimiento no es válida o es futura. */
export function edadEn(nacimiento: string, hoy: string): number {
  if (!fechaValida(nacimiento) || !fechaValida(hoy) || nacimiento > hoy) return -1;
  const [ny, nm, nd] = nacimiento.split('-').map(Number);
  const [hy, hm, hd] = hoy.split('-').map(Number);
  let edad = hy - ny;
  if (hm < nm || (hm === nm && hd < nd)) edad--;
  return edad;
}

/** Número de hoja de reclamación de demostración, p. ej. LR-DEMO-2026-000123. */
export function numeroHoja(ahora: Date, correlativo: number): string {
  const n = Math.max(1, Math.floor(correlativo)) % 1000000;
  return `LR-DEMO-${ahora.getUTCFullYear()}-${String(n).padStart(6, '0')}`;
}
