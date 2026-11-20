import { DISTRITOS, ETAPAS, type Departamento } from '../data/departamentos';

export interface Criterios {
  distrito: string; // '' = todos
  dormitorios: number; // 0 = cualquiera; n = n o más
  precioMax: number; // 0 = sin tope (S/)
  areaMin: number; // 0 = sin mínimo (m²)
  etapa: string; // '' = todas
  orden: 'relevancia' | 'precio-asc' | 'precio-desc' | 'area-desc';
}

export const CRITERIOS_VACIOS: Criterios = { distrito: '', dormitorios: 0, precioMax: 0, areaMin: 0, etapa: '', orden: 'relevancia' };
const ORDENES = ['relevancia', 'precio-asc', 'precio-desc', 'area-desc'];

const entero = (v: string | null, max: number) => {
  const n = Number(v);
  return v !== null && v !== '' && Number.isInteger(n) && n >= 0 && n <= max ? n : 0;
};

/** Lee criterios de una URL ignorando valores inválidos. */
export function desdeParametros(p: URLSearchParams): Criterios {
  const distrito = p.get('distrito') ?? '';
  const etapa = p.get('etapa') ?? '';
  const orden = p.get('orden') ?? 'relevancia';
  return {
    distrito: (DISTRITOS as readonly string[]).includes(distrito) ? distrito : '',
    dormitorios: entero(p.get('dormitorios'), 5),
    precioMax: entero(p.get('precioMax'), 5_000_000),
    areaMin: entero(p.get('areaMin'), 500),
    etapa: (ETAPAS as readonly string[]).includes(etapa) ? etapa : '',
    orden: (ORDENES.includes(orden) ? orden : 'relevancia') as Criterios['orden'],
  };
}

/** Solo escribe lo que difiere del valor por defecto: URLs cortas y compartibles. */
export function aParametros(c: Criterios): URLSearchParams {
  const p = new URLSearchParams();
  if (c.distrito) p.set('distrito', c.distrito);
  if (c.dormitorios) p.set('dormitorios', String(c.dormitorios));
  if (c.precioMax) p.set('precioMax', String(c.precioMax));
  if (c.areaMin) p.set('areaMin', String(c.areaMin));
  if (c.etapa) p.set('etapa', c.etapa);
  if (c.orden !== 'relevancia') p.set('orden', c.orden);
  return p;
}

export function filtrar(lista: Departamento[], c: Criterios): Departamento[] {
  const copia = lista.filter((d) =>
    (!c.distrito || d.distrito === c.distrito) &&
    (!c.dormitorios || d.dormitorios >= c.dormitorios) &&
    (!c.precioMax || d.precio <= c.precioMax) &&
    (!c.areaMin || d.area >= c.areaMin) &&
    (!c.etapa || d.etapa === c.etapa),
  );
  if (c.orden === 'precio-asc') copia.sort((a, b) => a.precio - b.precio);
  else if (c.orden === 'precio-desc') copia.sort((a, b) => b.precio - a.precio);
  else if (c.orden === 'area-desc') copia.sort((a, b) => b.area - a.area);
  return copia;
}

export const hayFiltros = (c: Criterios) => aParametros({ ...c, orden: 'relevancia' }).toString() !== '';
