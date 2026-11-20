// Datos 100 % ficticios de demo. Proyectos, precios, áreas, entregas y equipamiento no existen.
export const TIPO_CAMBIO = 3.75; // S/ por US$, fijo y solo de demo (no es un tipo de cambio de mercado)
export const ETAPAS = ['en planos', 'en construcción', 'entrega inmediata'] as const;
export type Etapa = (typeof ETAPAS)[number];
export const DISTRITOS = ['Chorrillos', 'Lurín', 'San Juan de Miraflores', 'Villa El Salvador', 'Villa María del Triunfo'] as const;
export type Distrito = (typeof DISTRITOS)[number];
export type FotoClave = 'sala' | 'dormitorio' | 'cocina' | 'ext-a' | 'ext-b' | 'ext-c' | 'ext-d' | 'ext-e' | 'ext-f';

export interface Departamento {
  slug: string;
  nombre: string;
  proyecto: string;
  distrito: Distrito;
  zona: string;
  dormitorios: number;
  banos: number;
  area: number; // m² techados, referencial
  piso: number;
  precio: number; // S/
  etapa: Etapa;
  entrega: string;
  resumen: string;
  caracteristicas: string[];
  fotos: FotoClave[];
}

export const departamentos: Departamento[] = [
  { slug: 'morro-solar-502', nombre: 'Morro Solar 502', proyecto: 'Residencial Morro Solar', distrito: 'Chorrillos', zona: 'sector de ejemplo', dormitorios: 2, banos: 2, area: 68, piso: 5, precio: 372000, etapa: 'entrega inmediata', entrega: 'Entrega inmediata', resumen: 'Dos dormitorios con balcón y buena luz de tarde, listos para mudarte.', caracteristicas: ['Balcón corrido', 'Cocina abierta a la sala', 'Lavandería interna', 'Ascensor', 'Cochera opcional'], fotos: ['ext-a', 'sala', 'cocina'] },
  { slug: 'morro-solar-801', nombre: 'Morro Solar 801', proyecto: 'Residencial Morro Solar', distrito: 'Chorrillos', zona: 'sector de ejemplo', dormitorios: 3, banos: 2, area: 92, piso: 8, precio: 498000, etapa: 'entrega inmediata', entrega: 'Entrega inmediata', resumen: 'Tres dormitorios en piso alto, pensado para familias que quieren luz y ventilación cruzada.', caracteristicas: ['Ventilación cruzada', 'Dormitorio principal con baño', 'Terraza de uso exclusivo', 'Ascensor', '1 cochera incluida'], fotos: ['dormitorio', 'ext-a', 'sala'] },
  { slug: 'terrazas-chorrillos-304', nombre: 'Terrazas 304', proyecto: 'Terrazas de Chorrillos', distrito: 'Chorrillos', zona: 'sector de ejemplo', dormitorios: 1, banos: 1, area: 44, piso: 3, precio: 255000, etapa: 'en construcción', entrega: 'III trimestre 2027', resumen: 'Un dormitorio compacto, ideal para primera vivienda o para alquilar.', caracteristicas: ['Cocina integrada', 'Ventanas amplias', 'Azotea común', 'Bicicletero', 'Ascensor'], fotos: ['ext-b', 'cocina', 'dormitorio'] },
  { slug: 'terrazas-chorrillos-1102', nombre: 'Terrazas 1102', proyecto: 'Terrazas de Chorrillos', distrito: 'Chorrillos', zona: 'sector de ejemplo', dormitorios: 2, banos: 2, area: 74, piso: 11, precio: 418000, etapa: 'en construcción', entrega: 'III trimestre 2027', resumen: 'Piso alto con vista abierta y dos baños completos.', caracteristicas: ['Vista despejada', 'Dormitorio principal con baño', 'Sala-comedor amplia', 'Azotea común', 'Ascensor'], fotos: ['sala', 'ext-b', 'dormitorio'] },
  { slug: 'triunfo-patio-201', nombre: 'Patio Triunfo 201', proyecto: 'Edificio Patio Triunfo', distrito: 'Villa María del Triunfo', zona: 'sector de ejemplo', dormitorios: 2, banos: 2, area: 72, piso: 2, precio: 338000, etapa: 'en construcción', entrega: 'I trimestre 2027', resumen: 'Edificio bajo de seis pisos con patio central; dos dormitorios cómodos.', caracteristicas: ['Patio central compartido', 'Cocina independiente', 'Solo 6 pisos', 'Depósito opcional', 'Lavandería interna'], fotos: ['ext-c', 'dormitorio', 'sala'] },
  { slug: 'triunfo-patio-503', nombre: 'Patio Triunfo 503', proyecto: 'Edificio Patio Triunfo', distrito: 'Villa María del Triunfo', zona: 'sector de ejemplo', dormitorios: 3, banos: 2, area: 98, piso: 5, precio: 462000, etapa: 'en planos', entrega: 'II semestre 2028', resumen: 'Tres dormitorios en el último piso, con terraza propia.', caracteristicas: ['Terraza propia', 'Dormitorio principal con baño', 'Cocina independiente', 'Dos cocheras opcionales', 'Depósito opcional'], fotos: ['cocina', 'ext-c', 'sala'] },
  { slug: 'lurin-jardin-406', nombre: 'Jardín Lurín 406', proyecto: 'Conjunto Jardín Lurín', distrito: 'Lurín', zona: 'sector de ejemplo', dormitorios: 3, banos: 2, area: 96, piso: 4, precio: 395000, etapa: 'en planos', entrega: 'I semestre 2029', resumen: 'Conjunto con áreas verdes comunes y tres dormitorios de buen tamaño.', caracteristicas: ['Áreas verdes comunes', 'Sala de usos múltiples', 'Cochera incluida', 'Ascensor', 'Cuarto de servicio'], fotos: ['ext-d', 'sala', 'cocina'] },
  { slug: 'lurin-jardin-208', nombre: 'Jardín Lurín 208', proyecto: 'Conjunto Jardín Lurín', distrito: 'Lurín', zona: 'sector de ejemplo', dormitorios: 2, banos: 2, area: 66, piso: 2, precio: 305000, etapa: 'en planos', entrega: 'I semestre 2029', resumen: 'Dos dormitorios en segundo piso, con vista a las áreas verdes del conjunto.', caracteristicas: ['Vista al jardín común', 'Cocina abierta', 'Lavandería interna', 'Sala de usos múltiples', 'Ascensor'], fotos: ['dormitorio', 'ext-d', 'cocina'] },
  { slug: 'sjm-mirador-603', nombre: 'Mirador 603', proyecto: 'Torre Mirador SJM', distrito: 'San Juan de Miraflores', zona: 'sector de ejemplo', dormitorios: 2, banos: 1, area: 58, piso: 6, precio: 289000, etapa: 'entrega inmediata', entrega: 'Entrega inmediata', resumen: 'Departamento funcional de dos dormitorios con un baño completo, listo para mudarte.', caracteristicas: ['Piso cerámico', 'Cocina equipada básica', 'Balcón', 'Ascensor', 'Cochera opcional'], fotos: ['ext-e', 'cocina', 'sala'] },
  { slug: 'ves-sol-109', nombre: 'Sol de Villa 109', proyecto: 'Residencial Sol de Villa', distrito: 'Villa El Salvador', zona: 'sector de ejemplo', dormitorios: 1, banos: 1, area: 41, piso: 1, precio: 214000, etapa: 'en construcción', entrega: 'I trimestre 2027', resumen: 'Un dormitorio en primer piso con patio privado, sin escaleras largas.', caracteristicas: ['Patio privado', 'Primer piso, sin escaleras', 'Cocina integrada a la sala', 'Bicicletero', 'Depósito opcional'], fotos: ['ext-f', 'dormitorio', 'cocina'] },
];
