export type Etiqueta = 'vegetariano' | 'picante' | 'mariscos' | 'singluten';

export type Plato = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number; // soles
  etiquetas: Etiqueta[];
};

export type Tiempo = {
  id: string;
  numero: string; // numeral romano editorial
  nombre: string;
  bajada: string;
  platos: Plato[];
};

export const ETIQUETAS: Record<Etiqueta, { texto: string; abreviatura: string }> = {
  vegetariano: { texto: 'Vegetariano', abreviatura: 'V' },
  picante: { texto: 'Picante', abreviatura: 'P' },
  mariscos: { texto: 'Contiene mariscos', abreviatura: 'M' },
  singluten: { texto: 'Sin gluten', abreviatura: 'SG' },
};

export const carta: Tiempo[] = [
  {
    id: 'para-empezar',
    numero: 'I',
    nombre: 'Para empezar',
    bajada: 'Bocados para abrir el apetito y compartir en la mesa.',
    platos: [
      {
        id: 'edamame-ajiamarillo',
        nombre: 'Edamame al ají amarillo',
        descripcion: 'Vainitas de soya salteadas en wok con sal de Maras, ajo tostado y un hilo de ají amarillo que pica apenas.',
        precio: 24,
        etiquetas: ['vegetariano', 'picante', 'singluten'],
      },
      {
        id: 'gyoza-pato',
        nombre: 'Gyozas de pato al tamarindo',
        descripcion: 'Masa fina dorada en plancha, relleno de pato confitado y cebolla china, lacado con tamarindo y miel de chancaca.',
        precio: 38,
        etiquetas: [],
      },
      {
        id: 'causa-nikkei',
        nombre: 'Causa nikkei de palta',
        descripcion: 'Papa amarilla prensada con limón y miso blanco, palta cremosa, wakame y ajonjolí tostado. Fresca y sin apuro.',
        precio: 32,
        etiquetas: ['vegetariano', 'singluten'],
      },
      {
        id: 'tempura-camaron',
        nombre: 'Tempura de langostinos',
        descripcion: 'Langostinos en tempura ligera, crocantes por fuera y jugosos por dentro, con mayonesa de rocoto y limón sutil.',
        precio: 46,
        etiquetas: ['mariscos', 'picante'],
      },
    ],
  },
  {
    id: 'tiraditos-ceviches',
    numero: 'II',
    nombre: 'Tiraditos y ceviches',
    bajada: 'El mar de Chorrillos con técnica japonesa: cortes finos y leche de tigre al momento.',
    platos: [
      {
        id: 'tiradito-kuro',
        nombre: 'Tiradito Kuro',
        descripcion: 'Láminas de lenguado en crema de ají amarillo, aceite de ajonjolí, tobiko y crocante de camote. El de la casa.',
        precio: 56,
        etiquetas: ['mariscos', 'picante', 'singluten'],
      },
      {
        id: 'ceviche-nikkei',
        nombre: 'Ceviche nikkei de atún',
        descripcion: 'Atún aleta amarilla marinado en leche de tigre con salsa de soya, jengibre y cebolla morada. Se sirve con choclo y cancha.',
        precio: 62,
        etiquetas: ['mariscos'],
      },
      {
        id: 'ceviche-carretillero',
        nombre: 'Ceviche carretillero',
        descripcion: 'Pesca del día con leche de tigre bien cargada, chicharrón de calamar, camote glaseado y rocoto picado fino.',
        precio: 58,
        etiquetas: ['mariscos', 'picante'],
      },
      {
        id: 'tiradito-hongos',
        nombre: 'Tiradito de hongos y yuzu',
        descripcion: 'Shiitake y champiñón en láminas, ponzu de yuzu, ají limo y brotes de shiso. Una opción de mar sin mar.',
        precio: 42,
        etiquetas: ['vegetariano', 'picante', 'singluten'],
      },
    ],
  },
  {
    id: 'nigiris-makis',
    numero: 'III',
    nombre: 'Nigiris y makis',
    bajada: 'Arroz tibio al punto, pescado cortado a pedido y salsas hechas en casa.',
    platos: [
      {
        id: 'nigiri-atun-acevichado',
        nombre: 'Nigiri de atún acevichado',
        descripcion: 'Dos piezas de atún sobre arroz tibio, salsa acevichada cremosa y un toque de ralladura de limón.',
        precio: 36,
        etiquetas: ['mariscos'],
      },
      {
        id: 'nigiri-salmon-flameado',
        nombre: 'Nigiri de salmón flameado',
        descripcion: 'Salmón sellado a la llama, glaseado con soya dulce y coronado con cebollita china y ajonjolí negro. Tres piezas.',
        precio: 34,
        etiquetas: ['mariscos'],
      },
      {
        id: 'maki-barranco',
        nombre: 'Maki Barranco',
        descripcion: 'Langostino en tempura, palta y pepino, cubierto con pulpa de ají amarillo y crocante de quinua. Ocho cortes.',
        precio: 52,
        etiquetas: ['mariscos', 'picante'],
      },
      {
        id: 'maki-vegetal',
        nombre: 'Maki del huerto',
        descripcion: 'Zapallo loche asado, palta, espárragos y brotes, con salsa de maní y sillao. Ocho cortes que no extrañan el pescado.',
        precio: 40,
        etiquetas: ['vegetariano'],
      },
    ],
  },
  {
    id: 'fondos',
    numero: 'IV',
    nombre: 'Fondos',
    bajada: 'Platos de fuego y de olla, donde el criollo y el nikkei se dan la mano.',
    platos: [
      {
        id: 'lomo-saltado-wagyu',
        nombre: 'Lomo saltado de res maturada',
        descripcion: 'Res madurada 21 días salteada al wok con tomate, cebolla y sillao, papas nativas fritas y arroz graneado.',
        precio: 78,
        etiquetas: [],
      },
      {
        id: 'pescado-miso',
        nombre: 'Pesca del día al miso',
        descripcion: 'Filete laqueado en miso rojo y chancaca, puré de camote y verduras al vapor. Cocción suave, sabor profundo.',
        precio: 74,
        etiquetas: ['mariscos', 'singluten'],
      },
      {
        id: 'arroz-chaufa-aeropuerto',
        nombre: 'Chaufa de mariscos al wok',
        descripcion: 'Arroz al wok con huevo, cebolla china, kion, pulpo y conchas de abanico. Salteado con mucho wok hei.',
        precio: 68,
        etiquetas: ['mariscos'],
      },
      {
        id: 'udon-setas',
        nombre: 'Udon cremoso de setas',
        descripcion: 'Fideos udon gruesos en salsa de hongos y mantequilla de miso, con yema curada y cebollita china.',
        precio: 54,
        etiquetas: ['vegetariano'],
      },
    ],
  },
  {
    id: 'postres',
    numero: 'V',
    nombre: 'Postres',
    bajada: 'Dulces suaves para cerrar sin pesadez.',
    platos: [
      {
        id: 'mochi-lucuma',
        nombre: 'Mochis de lúcuma',
        descripcion: 'Tres mochis suaves rellenos de helado de lúcuma, con salsa tibia de maracuyá y ralladura de limón.',
        precio: 28,
        etiquetas: ['vegetariano', 'singluten'],
      },
      {
        id: 'cheesecake-matcha',
        nombre: 'Cheesecake de matcha',
        descripcion: 'Cremoso y apenas amargo, sobre base de galleta de jengibre, con frutos rojos y un toque de miel de abeja.',
        precio: 30,
        etiquetas: ['vegetariano'],
      },
      {
        id: 'suspiro-yuzu',
        nombre: 'Suspiro al yuzu',
        descripcion: 'Nuestra versión del clásico limeño: manjar blanco sedoso y merengue de oporto con aroma a yuzu.',
        precio: 29,
        etiquetas: ['vegetariano', 'singluten'],
      },
      {
        id: 'helado-sesamo',
        nombre: 'Helado de sésamo negro',
        descripcion: 'Dos bolas de helado artesanal de sésamo negro, con crocante de ajonjolí y un hilo de chancaca líquida.',
        precio: 24,
        etiquetas: ['vegetariano', 'singluten'],
      },
    ],
  },
  {
    id: 'barra',
    numero: 'VI',
    nombre: 'Barra',
    bajada: 'Coctelería de autor con ingredientes peruanos, sakes y algo sin alcohol.',
    platos: [
      {
        id: 'pisco-sour-yuzu',
        nombre: 'Pisco sour al yuzu',
        descripcion: 'Pisco quebranta, limón sutil, yuzu y clara de huevo, con gotas de amargo de Chuncho. Seco, cítrico y largo.',
        precio: 32,
        etiquetas: ['vegetariano', 'singluten'],
      },
      {
        id: 'chilcano-shiso',
        nombre: 'Chilcano de shiso',
        descripcion: 'Pisco, ginger ale artesanal, limón y hojas de shiso machacadas. Refrescante, para empezar o para seguir.',
        precio: 30,
        etiquetas: ['vegetariano', 'singluten'],
      },
      {
        id: 'sake-junmai',
        nombre: 'Sake junmai frío (copa)',
        descripcion: 'Un junmai limpio y floral, servido frío en vaso de madera. Pídelo con los tiraditos.',
        precio: 36,
        etiquetas: ['vegetariano', 'singluten'],
      },
      {
        id: 'te-helado-hojicha',
        nombre: 'Té helado de hojicha',
        descripcion: 'Té tostado infusionado en frío con naranja y un toque de miel. Sin alcohol y sin azúcar añadida.',
        precio: 16,
        etiquetas: ['vegetariano', 'singluten'],
      },
    ],
  },
];

export const todosLosPlatos: Plato[] = carta.flatMap((t) => t.platos);

const formato = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 });
export function precio(n: number): string {
  return formato.format(n).replace(/ /g, ' ');
}
