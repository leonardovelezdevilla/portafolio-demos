/** Opciones del configurador. Precios en soles (S/), IGV incluido. Datos ficticios de demo. */
export type Alergeno = 'gluten' | 'huevo' | 'leche' | 'frutos-secos' | 'soya' | 'mani';

export const ALERGENOS: Record<Alergeno, string> = {
  gluten: 'Gluten (trigo)',
  huevo: 'Huevo',
  leche: 'Leche',
  'frutos-secos': 'Frutos secos (nueces)',
  soya: 'Soya',
  mani: 'Maní',
};

export interface Tamano { id: string; etiqueta: string; detalle: string; porciones: number; precio: number; pisos: 1 | 2 }
export interface Opcion { id: string; nombre: string; detalle: string; porPorcion: number; alergenos: Alergeno[] }
export interface Decoracion { id: string; nombre: string; detalle: string; precio: number; alergenos: Alergeno[] }

export const TAMANOS: Tamano[] = [
  { id: '8', etiqueta: '8 porciones', detalle: 'Molde de 18 cm', porciones: 8, precio: 95, pisos: 1 },
  { id: '12', etiqueta: '12 porciones', detalle: 'Molde de 20 cm', porciones: 12, precio: 135, pisos: 1 },
  { id: '16', etiqueta: '16 porciones', detalle: 'Molde de 23 cm', porciones: 16, precio: 175, pisos: 1 },
  { id: '24', etiqueta: '24 porciones', detalle: 'Molde de 26 cm', porciones: 24, precio: 245, pisos: 1 },
  { id: '2p-36', etiqueta: '2 pisos, 36 porciones', detalle: 'Pedir con 72 h de anticipación', porciones: 36, precio: 420, pisos: 2 },
  { id: '2p-50', etiqueta: '2 pisos, 50 porciones', detalle: 'Pedir con 72 h de anticipación', porciones: 50, precio: 560, pisos: 2 },
];

export const BIZCOCHOS: Opcion[] = [
  { id: 'vainilla', nombre: 'Vainilla', detalle: 'Esponjoso y suave', porPorcion: 0, alergenos: ['gluten', 'huevo', 'leche'] },
  { id: 'chocolate', nombre: 'Chocolate', detalle: 'Húmedo e intenso', porPorcion: 0, alergenos: ['gluten', 'huevo', 'leche'] },
  { id: 'naranja', nombre: 'Naranja', detalle: 'Con ralladura de naranja', porPorcion: 0.4, alergenos: ['gluten', 'huevo', 'leche'] },
  { id: 'zanahoria', nombre: 'Zanahoria y nueces', detalle: 'Con canela y nueces', porPorcion: 0.8, alergenos: ['gluten', 'huevo', 'leche', 'frutos-secos'] },
  { id: 'red-velvet', nombre: 'Red velvet', detalle: 'Rojo suave con toque de cacao', porPorcion: 1.2, alergenos: ['gluten', 'huevo', 'leche'] },
  { id: 'tres-leches', nombre: 'Tres leches', detalle: 'Bañado en tres leches', porPorcion: 1, alergenos: ['gluten', 'huevo', 'leche'] },
];

export const RELLENOS: Opcion[] = [
  { id: 'manjar', nombre: 'Manjarblanco', detalle: 'Clásico peruano', porPorcion: 0, alergenos: ['leche'] },
  { id: 'crema-pastelera', nombre: 'Crema pastelera', detalle: 'Con vainilla', porPorcion: 0, alergenos: ['huevo', 'leche', 'gluten'] },
  { id: 'fresas-crema', nombre: 'Fresas con crema', detalle: 'Fresas frescas y chantilly', porPorcion: 0.6, alergenos: ['leche'] },
  { id: 'lucuma', nombre: 'Crema de lúcuma', detalle: 'Sabor a lúcuma', porPorcion: 0.8, alergenos: ['leche'] },
  { id: 'ganache', nombre: 'Ganache de chocolate', detalle: 'Chocolate cremoso', porPorcion: 0.8, alergenos: ['leche', 'soya'] },
  { id: 'maracuya', nombre: 'Crema de maracuyá', detalle: 'Ácida y fresca', porPorcion: 0.6, alergenos: ['huevo', 'leche'] },
];

export const COBERTURAS: Opcion[] = [
  { id: 'chantilly', nombre: 'Chantilly', detalle: 'Crema batida ligera (refrigerar)', porPorcion: 0, alergenos: ['leche'] },
  { id: 'buttercream', nombre: 'Buttercream', detalle: 'Mantequilla, textura firme', porPorcion: 0.4, alergenos: ['leche'] },
  { id: 'merengue', nombre: 'Merengue italiano', detalle: 'Brillante y poco dulce', porPorcion: 0.5, alergenos: ['huevo'] },
  { id: 'ganache', nombre: 'Ganache de chocolate', detalle: 'Acabado liso y brillante', porPorcion: 0.9, alergenos: ['leche', 'soya'] },
  { id: 'fondant', nombre: 'Fondant', detalle: 'Liso, para figuras y diseños', porPorcion: 1.5, alergenos: ['gluten', 'soya'] },
];

export const DECORACIONES: Decoracion[] = [
  { id: 'frutas', nombre: 'Frutas frescas', detalle: 'Fresas, arándanos y hojas', precio: 18, alergenos: [] },
  { id: 'flores', nombre: 'Flores comestibles', detalle: 'Flores comestibles de estación', precio: 30, alergenos: [] },
  { id: 'topper', nombre: 'Topper con tu mensaje', detalle: 'Acrílico o papel, a elección', precio: 15, alergenos: [] },
  { id: 'perlas', nombre: 'Perlas y detalles dorados', detalle: 'Perlas de azúcar y hoja dorada', precio: 22, alergenos: [] },
  { id: 'drip', nombre: 'Drip de chocolate', detalle: 'Chocolate cayendo por el borde', precio: 20, alergenos: ['leche', 'soya'] },
];

/** Recargo de decoración para tortas de 2 pisos (más superficie y trabajo). */
export const FACTOR_DECORACION_2_PISOS = 1.5;
export const MENSAJE_MAX = 30;
export const ADELANTO_PORCENTAJE = 50;
export const IGV = 0.18;

export const TRAZAS = 'Ninguna receta lleva maní, pero se elabora en una cocina donde también hay gluten, huevo, leche, frutos secos, maní y soya: puede haber trazas de cualquiera de ellos.';
