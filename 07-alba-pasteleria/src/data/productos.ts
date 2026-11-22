import { alergenosTorta, presupuestoTorta, type Seleccion } from '../lib/precio';
import { TAMANOS } from '../lib/config';

export type Ocasion = 'cumpleanos' | 'aniversario' | 'boda' | 'infantil' | 'reunion';
export type Sabor = 'chocolate' | 'vainilla' | 'frutas' | 'lucuma' | 'red-velvet';

export const OCASIONES: Record<Ocasion, string> = {
  cumpleanos: 'Cumpleaños', aniversario: 'Aniversario', boda: 'Boda y quince años', infantil: 'Infantil', reunion: 'Reunión familiar',
};
export const SABORES: Record<Sabor, string> = {
  chocolate: 'Chocolate', vainilla: 'Vainilla', frutas: 'Frutas', lucuma: 'Lúcuma', 'red-velvet': 'Red velvet',
};
export const RANGOS_PORCIONES = { 'hasta-12': 'Hasta 12 porciones', '13-24': 'De 13 a 24 porciones', '25-mas': 'Más de 25 porciones' } as const;
export type RangoPorciones = keyof typeof RANGOS_PORCIONES;

export interface Producto {
  slug: string;
  nombre: string;
  descripcion: string;
  foto: string;
  alt: string;
  posicion?: string;
  ocasiones: Ocasion[];
  sabor: Sabor;
  seleccion: Seleccion;
}

export const productos: Producto[] = [
  {
    slug: 'dorada', nombre: 'Dorada', foto: 'crema-95-fresas', posicion: 'center 70%',
    alt: 'Torta cubierta de crema color marfil con chocolate cayendo por el borde, fresas partidas y perlas doradas arriba',
    descripcion: 'Crema marfil, drip de chocolate, fresas y perlas doradas. Para cumpleaños con número o inicial.',
    ocasiones: ['cumpleanos', 'aniversario'], sabor: 'vainilla',
    seleccion: { tamano: '12', bizcocho: 'vainilla', relleno: 'manjar', cobertura: 'buttercream', decoraciones: ['drip', 'perlas', 'frutas'], mensaje: '' },
  },
  {
    slug: 'huerto', nombre: 'Huerto', foto: 'naked-3-frutas',
    alt: 'Torta de bordes descubiertos atada con cordel, con fresas, arándanos y kumquats, velas verdes y adornos dorados',
    descripcion: 'Bordes al descubierto, cordel y frutas de estación. Rústica y fresca, ideal para fiestas infantiles.',
    ocasiones: ['infantil', 'cumpleanos'], sabor: 'frutas',
    seleccion: { tamano: '12', bizcocho: 'naranja', relleno: 'fresas-crema', cobertura: 'chantilly', decoraciones: ['frutas', 'topper'], mensaje: '' },
  },
  {
    slug: 'cacao-y-fresa', nombre: 'Cacao y fresa', foto: 'chocolate-fresas-trufas', posicion: 'center 45%',
    alt: 'Torta cubierta de ganache de chocolate brillante con fresas, trufas de granillo y bolitas claras encima',
    descripcion: 'Bizcocho de chocolate, ganache brillante, fresas y trufas. Intensa y no demasiado dulce.',
    ocasiones: ['cumpleanos', 'reunion'], sabor: 'chocolate',
    seleccion: { tamano: '16', bizcocho: 'chocolate', relleno: 'ganache', cobertura: 'ganache', decoraciones: ['frutas'], mensaje: '' },
  },
  {
    slug: 'campo-abierto', nombre: 'Campo abierto', foto: 'crema-frutos-cenital',
    alt: 'Vista desde arriba de una torta con crema blanca, fresas en láminas y arándanos sobre un paño a rayas verdes',
    descripcion: 'Crema blanca, fresas en láminas y arándanos. Sencilla, de las que gustan a todos en una reunión.',
    ocasiones: ['reunion', 'aniversario'], sabor: 'frutas',
    seleccion: { tamano: '16', bizcocho: 'vainilla', relleno: 'fresas-crema', cobertura: 'chantilly', decoraciones: ['frutas'], mensaje: '' },
  },
  {
    slug: 'nube', nombre: 'Nube', foto: 'crema-65', posicion: 'center 70%',
    alt: 'Torta blanca de acabado texturizado sobre un plato, con velas de números, uvas y hojas verdes arriba',
    descripcion: 'Acabado blanco texturizado con frutas y hojas. Elegante y discreta para celebraciones de adultos.',
    ocasiones: ['aniversario', 'cumpleanos'], sabor: 'lucuma',
    seleccion: { tamano: '8', bizcocho: 'vainilla', relleno: 'lucuma', cobertura: 'merengue', decoraciones: ['frutas'], mensaje: '' },
  },
  {
    slug: 'jardin-de-rosas', nombre: 'Jardín de rosas', foto: 'tres-pisos-flores',
    alt: 'Torta de tres pisos color rosa pálido cubierta de pequeñas rosas y flores de azúcar, con un lazo blanco',
    descripcion: 'Tres pisos de rosas modeladas a mano. Para quince años y bodas; se recoge en tienda o con delivery especial.',
    ocasiones: ['boda'], sabor: 'vainilla',
    seleccion: { tamano: '2p-50', bizcocho: 'vainilla', relleno: 'crema-pastelera', cobertura: 'fondant', decoraciones: ['flores', 'perlas'], mensaje: '' },
  },
  {
    slug: 'silvestre', nombre: 'Silvestre', foto: 'dos-pisos-rosas',
    alt: 'Torta blanca de dos pisos con rosas rosadas, higos y moras cayendo en cascada por un lado',
    descripcion: 'Dos pisos lisos con rosas, higos y moras. Para matrimonios civiles y aniversarios grandes.',
    ocasiones: ['boda', 'aniversario'], sabor: 'red-velvet',
    seleccion: { tamano: '2p-36', bizcocho: 'red-velvet', relleno: 'lucuma', cobertura: 'buttercream', decoraciones: ['flores', 'frutas'], mensaje: '' },
  },
];

export const rangoDe = (porciones: number): RangoPorciones => (porciones <= 12 ? 'hasta-12' : porciones <= 24 ? '13-24' : '25-mas');

export function datosProducto(p: Producto) {
  const pres = presupuestoTorta(p.seleccion)!;
  const t = TAMANOS.find((x) => x.id === p.seleccion.tamano)!;
  return { ...p, precio: pres.total, porciones: t.porciones, tamanoEtiqueta: t.etiqueta, alergenos: alergenosTorta(p.seleccion), rango: rangoDe(t.porciones) };
}
