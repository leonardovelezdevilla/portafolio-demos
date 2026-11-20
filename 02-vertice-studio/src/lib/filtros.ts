import type { Categoria, Producto } from '../data/productos';

export interface Filtro {
  categoria: Categoria | null;
  talla: number | null;
}

const CATS: Categoria[] = ['running', 'urbana', 'skate', 'basquet'];

export function leerParams(search: string): Filtro {
  const p = new URLSearchParams(search);
  const c = p.get('categoria');
  const t = Number(p.get('talla'));
  return {
    categoria: CATS.includes(c as Categoria) ? (c as Categoria) : null,
    talla: Number.isInteger(t) && t >= 36 && t <= 45 ? t : null,
  };
}

export function escribirParams(f: Filtro): string {
  const p = new URLSearchParams();
  if (f.categoria) p.set('categoria', f.categoria);
  if (f.talla) p.set('talla', String(f.talla));
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const coincide = (p: Pick<Producto, 'categoria' | 'tallas'>, f: Filtro): boolean =>
  (!f.categoria || p.categoria === f.categoria) && (!f.talla || (p.tallas[f.talla] ?? 0) > 0);

export const filtrar = <T extends Pick<Producto, 'categoria' | 'tallas'>>(lista: T[], f: Filtro): T[] =>
  lista.filter((p) => coincide(p, f));
