import { SEGUIMIENTOS, type SeguimientoDemo } from '../data/seguimiento';

export function normalizarCodigo(texto: string): string {
  return texto.toUpperCase().replace(/\s+/g, '').replace(/_/g, '-');
}

export function buscarSeguimiento(texto: string): SeguimientoDemo | null {
  const c = normalizarCodigo(texto);
  return SEGUIMIENTOS.find((s) => s.codigo === c) ?? null;
}

// En el seguimiento no se muestra la placa completa.
export function ocultarPlaca(placa: string): string {
  const [a, b] = placa.split('-');
  return `${a}-${'*'.repeat(b.length)}`;
}

export function esCodigoDeCita(texto: string): boolean {
  return normalizarCodigo(texto).startsWith('CITA-DEMO');
}
