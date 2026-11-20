/** Lógica pura del carrito (sin DOM) para poder probarla con vitest. */

export interface ProductoCarrito {
  slug: string;
  nombre: string;
  precio: number;
  tallas: Record<number, number>;
}

export interface Linea {
  slug: string;
  talla: number;
  cantidad: number;
}

export type Zona = 'lima' | 'provincias';

export const ENVIO = {
  lima: { tarifa: 10, gratisDesde: 299, etiqueta: 'Lima Metropolitana' },
  provincias: { tarifa: 25, gratisDesde: 499, etiqueta: 'Provincias' },
} as const;

export const CLAVE_STORAGE = 'vertice-carrito-v1';

const buscar = (catalogo: ProductoCarrito[], slug: string) => catalogo.find((p) => p.slug === slug);

export const stockDe = (catalogo: ProductoCarrito[], slug: string, talla: number): number =>
  buscar(catalogo, slug)?.tallas[talla] ?? 0;

/** Agrega unidades limitadas por el stock de la talla. Devuelve un arreglo nuevo. */
export function agregar(
  lineas: Linea[],
  catalogo: ProductoCarrito[],
  slug: string,
  talla: number,
  cantidad = 1,
): Linea[] {
  const max = stockDe(catalogo, slug, talla);
  if (max <= 0 || cantidad <= 0) return lineas;
  const existe = lineas.find((l) => l.slug === slug && l.talla === talla);
  if (existe) {
    return lineas.map((l) => (l === existe ? { ...l, cantidad: Math.min(max, l.cantidad + cantidad) } : l));
  }
  return [...lineas, { slug, talla, cantidad: Math.min(max, cantidad) }];
}

/** Fija la cantidad (limitada por stock). Cantidad <= 0 quita la línea. */
export function cambiarCantidad(
  lineas: Linea[],
  catalogo: ProductoCarrito[],
  slug: string,
  talla: number,
  cantidad: number,
): Linea[] {
  if (cantidad <= 0) return quitar(lineas, slug, talla);
  const max = stockDe(catalogo, slug, talla);
  return lineas.map((l) =>
    l.slug === slug && l.talla === talla ? { ...l, cantidad: Math.min(max, Math.floor(cantidad)) } : l,
  );
}

export const quitar = (lineas: Linea[], slug: string, talla: number): Linea[] =>
  lineas.filter((l) => !(l.slug === slug && l.talla === talla));

export const totalUnidades = (lineas: Linea[]): number => lineas.reduce((s, l) => s + l.cantidad, 0);

export function subtotal(lineas: Linea[], catalogo: ProductoCarrito[]): number {
  const centimos = lineas.reduce((s, l) => {
    const p = buscar(catalogo, l.slug);
    return s + (p ? Math.round(p.precio * 100) * l.cantidad : 0);
  }, 0);
  return centimos / 100;
}

/** Regla: tarifa fija por zona; gratis al llegar al monto de la zona. Carrito vacío = 0. */
export function costoEnvio(zona: Zona, sub: number): number {
  if (sub <= 0) return 0;
  const regla = ENVIO[zona];
  return sub >= regla.gratisDesde ? 0 : regla.tarifa;
}

export function totales(lineas: Linea[], catalogo: ProductoCarrito[], zona: Zona) {
  const sub = subtotal(lineas, catalogo);
  const envio = costoEnvio(zona, sub);
  return { subtotal: sub, envio, total: Math.round((sub + envio) * 100) / 100 };
}

export const serializar = (lineas: Linea[]): string => JSON.stringify({ v: 1, lineas });

/** Lee lo guardado y descarta cualquier línea inválida o sin stock. Nunca lanza. */
export function deserializar(texto: string | null | undefined, catalogo: ProductoCarrito[]): Linea[] {
  if (!texto) return [];
  try {
    const data = JSON.parse(texto);
    if (!data || data.v !== 1 || !Array.isArray(data.lineas)) return [];
    let resultado: Linea[] = [];
    for (const l of data.lineas) {
      if (!l || typeof l.slug !== 'string' || !Number.isInteger(l.talla) || !Number.isInteger(l.cantidad)) continue;
      resultado = agregar(resultado, catalogo, l.slug, l.talla, l.cantidad);
    }
    return resultado;
  } catch {
    return [];
  }
}

interface AlmacenamientoMinimo {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

export function guardar(lineas: Linea[], almacen?: AlmacenamientoMinimo): boolean {
  try {
    (almacen ?? localStorage).setItem(CLAVE_STORAGE, serializar(lineas));
    return true;
  } catch {
    return false;
  }
}

export function cargar(catalogo: ProductoCarrito[], almacen?: AlmacenamientoMinimo): Linea[] {
  try {
    return deserializar((almacen ?? localStorage).getItem(CLAVE_STORAGE), catalogo);
  } catch {
    return [];
  }
}

export function formatoSoles(n: number): string {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);
}
