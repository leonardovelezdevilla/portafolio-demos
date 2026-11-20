import { BANDAS_KM, KM_MAX, SERVICIOS, TARIFAS, type ServicioId, type VehiculoId } from '../data/precios';

export interface LineaCotizacion {
  servicio: ServicioId;
  nombre: string;
  min: number;
  max: number;
}

export interface Cotizacion {
  lineas: LineaCotizacion[];
  min: number;
  max: number;
  noDisponibles: ServicioId[];
}

export const AVISO_PRECIO =
  'Rango referencial en soles con IGV incluido. El precio final requiere inspección del vehículo y puede variar según el estado de las piezas y los repuestos elegidos.';

export function parsearKm(texto: string): number | null {
  const limpio = texto.trim().replace(/[\s.,]/g, '');
  if (!/^\d+$/.test(limpio)) return null;
  const n = Number(limpio);
  return n <= KM_MAX ? n : null;
}

export function bandaKm(km: number) {
  return BANDAS_KM.find((b) => km >= b.desde && km <= b.hasta) ?? BANDAS_KM[BANDAS_KM.length - 1];
}

export function servicioDisponible(servicio: ServicioId, vehiculo: VehiculoId): boolean {
  return TARIFAS[servicio][vehiculo] !== null;
}

const aMultiplo5Abajo = (n: number) => Math.floor(n / 5) * 5;
const aMultiplo5Arriba = (n: number) => Math.ceil(n / 5) * 5;

export function rangoServicio(servicio: ServicioId, vehiculo: VehiculoId, km: number): readonly [number, number] | null {
  const base = TARIFAS[servicio][vehiculo];
  if (!base) return null;
  const { factorTope } = bandaKm(km);
  return [aMultiplo5Abajo(base[0]), aMultiplo5Arriba(base[1] * factorTope)];
}

export function cotizar(vehiculo: VehiculoId, km: number, servicios: ServicioId[]): Cotizacion {
  const lineas: LineaCotizacion[] = [];
  const noDisponibles: ServicioId[] = [];
  for (const def of SERVICIOS) {
    if (!servicios.includes(def.id)) continue;
    const r = rangoServicio(def.id, vehiculo, km);
    if (!r) {
      noDisponibles.push(def.id);
      continue;
    }
    lineas.push({ servicio: def.id, nombre: def.nombre, min: r[0], max: r[1] });
  }
  return {
    lineas,
    min: lineas.reduce((s, l) => s + l.min, 0),
    max: lineas.reduce((s, l) => s + l.max, 0),
    noDisponibles,
  };
}

const formato = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 });
export const soles = (n: number) => formato.format(n);
export const formatoRango = (min: number, max: number) => `${soles(min)} a ${soles(max)}`;
