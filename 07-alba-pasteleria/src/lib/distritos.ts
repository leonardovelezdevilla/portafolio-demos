/** Cobertura de delivery de la demo (costo en S/ por distrito, IGV incluido). */
export const DISTRITOS: { nombre: string; costo: number }[] = [
  { nombre: 'Jesús María', costo: 6 },
  { nombre: 'Lince', costo: 8 },
  { nombre: 'Breña', costo: 10 },
  { nombre: 'Magdalena del Mar', costo: 10 },
  { nombre: 'Pueblo Libre', costo: 10 },
  { nombre: 'San Isidro', costo: 10 },
  { nombre: 'Cercado de Lima', costo: 12 },
  { nombre: 'Miraflores', costo: 12 },
  { nombre: 'San Miguel', costo: 12 },
  { nombre: 'Surquillo', costo: 14 },
  { nombre: 'San Borja', costo: 15 },
  { nombre: 'Santiago de Surco', costo: 15 },
];

/** Recargo por llevar una torta de 2 pisos (se envía con dos personas y caja especial). */
export const RECARGO_2_PISOS = 25;

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');

export interface ResultadoDelivery { cubierto: boolean; distrito?: string; costo: number; recargo: number; total: number }

/** Costo de delivery para un distrito (sin importar tildes ni mayúsculas). `cubierto: false` si no hay cobertura. */
export function costoDelivery(distrito: string, dosPisos = false): ResultadoDelivery {
  const d = DISTRITOS.find((x) => normalizar(x.nombre) === normalizar(distrito));
  if (!d) return { cubierto: false, costo: 0, recargo: 0, total: 0 };
  const recargo = dosPisos ? RECARGO_2_PISOS : 0;
  return { cubierto: true, distrito: d.nombre, costo: d.costo, recargo, total: d.costo + recargo };
}
