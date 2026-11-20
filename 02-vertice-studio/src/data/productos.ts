export type Categoria = 'running' | 'urbana' | 'skate' | 'basquet';

export const CATEGORIAS: { id: Categoria; nombre: string }[] = [
  { id: 'running', nombre: 'Running' },
  { id: 'urbana', nombre: 'Urbana' },
  { id: 'skate', nombre: 'Skate' },
  { id: 'basquet', nombre: 'Básquet' },
];

export const TALLAS_EU = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45] as const;

export interface Color {
  nombre: string;
  hex: string;
}

export interface Producto {
  slug: string;
  nombre: string;
  categoria: Categoria;
  /** Precio en soles (PEN). Datos ficticios de demo. */
  precio: number;
  colores: Color[];
  /** Stock por talla EU (0 = agotada). */
  tallas: Record<number, number>;
  /** Archivo en src/assets/fotos (sin extensión). */
  foto: string;
  /** Posición del recorte (object-position de Astro Image). */
  posicion?: string;
  alt: string;
  resumen: string;
  detalle: string[];
}

export const productos: Producto[] = [
  {
    slug: 'nodo-91',
    nombre: 'Nodo 91',
    categoria: 'urbana',
    precio: 249,
    colores: [
      {
        nombre: 'Blanco',
        hex: '#f1f1ee'
      },
      {
        nombre: 'Negro',
        hex: '#0b0b0b'
      }
    ],
    tallas: {
      38: 3,
      39: 4,
      40: 5,
      41: 2,
      42: 0,
      43: 3,
      44: 1
    },
    foto: 'blancas-hojas',
    posicion: 'left',
    alt: 'Vista desde arriba de unas zapatillas blancas de cuero con cordones, sobre hojas secas oscuras',
    resumen: 'Blancas de cuero, limpias y sin ruido para el diario.',
    detalle: [
      'Capellada de cuero sintético fácil de limpiar',
      'Suela de goma con textura antideslizante',
      'Plantilla acolchada removible'
    ]
  },
  {
    slug: 'rafaga-air',
    nombre: 'Ráfaga Air',
    categoria: 'running',
    precio: 329,
    colores: [
      {
        nombre: 'Blanco',
        hex: '#f1f1ee'
      },
      {
        nombre: 'Hueso',
        hex: '#e6dfd0'
      }
    ],
    tallas: {
      38: 2,
      39: 3,
      40: 4,
      41: 5,
      42: 4,
      43: 2,
      44: 0
    },
    foto: 'blancas-sol',
    posicion: 'left',
    alt: 'Zapatilla blanca de suela gruesa vista de frente, caminando por un sendero con luz de atardecer',
    resumen: 'Suela gruesa con amortiguación para rodar kilómetros.',
    detalle: [
      'Capellada tejida y transpirable',
      'Entresuela alta con amortiguación',
      'Peso aproximado por zapatilla: 280 g (dato de demo)'
    ]
  },
  {
    slug: 'violeta-pro',
    nombre: 'Violeta Pro',
    categoria: 'basquet',
    precio: 389,
    colores: [
      {
        nombre: 'Violeta',
        hex: '#6b46b8'
      },
      {
        nombre: 'Dorado',
        hex: '#d9a441'
      }
    ],
    tallas: {
      40: 2,
      41: 3,
      42: 4,
      43: 3,
      44: 2,
      45: 1
    },
    foto: 'balon-violeta',
    posicion: 'left',
    alt: 'Balón de básquet junto a unas zapatillas tejidas violeta con suela dorada sobre una cancha de asfalto',
    resumen: 'Tejido violeta y suela dorada hecha para la cancha.',
    detalle: [
      'Capellada tejida de una pieza',
      'Suela de goma con agarre multidireccional',
      'Cierre con cordones planos'
    ]
  },
  {
    slug: 'cemento-low',
    nombre: 'Cemento Low',
    categoria: 'urbana',
    precio: 359,
    colores: [
      {
        nombre: 'Gris perla',
        hex: '#cfcfca'
      },
      {
        nombre: 'Blanco',
        hex: '#f1f1ee'
      }
    ],
    tallas: {
      37: 1,
      38: 2,
      39: 3,
      40: 3,
      41: 3,
      42: 2,
      43: 0
    },
    foto: 'grises-concreto',
    posicion: 'center',
    alt: 'Zapatillas grises de cuero apoyadas sobre una vereda de concreto con sombras de una baranda',
    resumen: 'Gris perla de silueta baja que combina con todo.',
    detalle: [
      'Cuero sintético en un solo tono',
      'Suela vulcanizada',
      'Forro textil suave'
    ]
  },
  {
    slug: 'menta-low',
    nombre: 'Menta Low',
    categoria: 'basquet',
    precio: 399,
    colores: [
      {
        nombre: 'Turquesa',
        hex: '#1fa89a'
      },
      {
        nombre: 'Blanco',
        hex: '#f1f1ee'
      }
    ],
    tallas: {
      40: 3,
      41: 2,
      42: 3,
      43: 4,
      44: 2,
      45: 2
    },
    foto: 'turquesa-cenital',
    posicion: 'center',
    alt: 'Vista cenital de zapatillas blancas con puntera turquesa sobre un piso oscuro, con pantalón negro',
    resumen: 'Puntera turquesa de cancha con base blanca.',
    detalle: [
      'Parte superior en cuero sintético',
      'Puntera perforada para ventilar',
      'Lengüeta acolchada'
    ]
  },
  {
    slug: 'trama-run',
    nombre: 'Trama Run',
    categoria: 'running',
    precio: 219,
    colores: [
      {
        nombre: 'Blanco',
        hex: '#f1f1ee'
      },
      {
        nombre: 'Crema',
        hex: '#efe6d2'
      }
    ],
    tallas: {
      39: 3,
      40: 4,
      41: 4,
      42: 5,
      43: 3,
      44: 2,
      45: 0
    },
    foto: 'blancas-sol',
    posicion: 'right',
    alt: 'Zapatilla blanca de running en primer plano con medias blancas sobre un camino de tierra',
    resumen: 'Entrenamiento diario, ligera y fácil de combinar.',
    detalle: [
      'Malla técnica con refuerzos',
      'Suela ligera con flexión en antepié',
      'Ideal para gimnasio y trote corto'
    ]
  },
  {
    slug: 'cancha-pro',
    nombre: 'Cancha Pro',
    categoria: 'basquet',
    precio: 429,
    colores: [
      {
        nombre: 'Violeta',
        hex: '#6b46b8'
      },
      {
        nombre: 'Ámbar',
        hex: '#c98a2b'
      }
    ],
    tallas: {
      41: 2,
      42: 3,
      43: 3,
      44: 2,
      45: 1
    },
    foto: 'balon-violeta',
    posicion: 'right',
    alt: 'Detalle de zapatillas tejidas violeta con suela translúcida ámbar apoyadas junto a un balón',
    resumen: 'Suela translúcida y amortiguación para saltar más.',
    detalle: [
      'Amortiguación en el talón',
      'Suela con patrón de espiga',
      'Soporte de tobillo reforzado'
    ]
  },
  {
    slug: 'pila-blanca',
    nombre: 'Pila Blanca',
    categoria: 'urbana',
    precio: 279,
    colores: [
      {
        nombre: 'Blanco',
        hex: '#f1f1ee'
      },
      {
        nombre: 'Hueso',
        hex: '#e6dfd0'
      }
    ],
    tallas: {
      36: 2,
      37: 3,
      38: 4,
      39: 4,
      40: 3,
      41: 3,
      42: 2,
      43: 1
    },
    foto: 'blancas-hojas',
    posicion: 'right',
    alt: 'Zapatilla blanca de cuero con los cordones sueltos sobre hojas secas oscuras',
    resumen: 'El blanco total que pide limpieza.',
    detalle: [
      'Cuero sintético fácil de limpiar',
      'Suela con borde de goma',
      'Perforaciones en la puntera'
    ]
  },
  {
    slug: 'chapa-roja',
    nombre: 'Chapa Roja',
    categoria: 'skate',
    precio: 229,
    colores: [
      {
        nombre: 'Rojo',
        hex: '#c8202f'
      },
      {
        nombre: 'Blanco',
        hex: '#f1f1ee'
      }
    ],
    tallas: {
      38: 2,
      39: 3,
      40: 4,
      41: 4,
      42: 3,
      43: 2,
      44: 1
    },
    foto: 'rojas-lona',
    posicion: 'center',
    alt: 'Par de zapatillas de lona rojas con puntera blanca y cordones blancos sobre asfalto gris',
    resumen: 'Lona roja y suela plana para sentir la tabla.',
    detalle: [
      'Lona resistente en zonas de desgaste',
      'Suela vulcanizada plana',
      'Puntera reforzada'
    ]
  },
  {
    slug: 'lona-azul',
    nombre: 'Lona Azul',
    categoria: 'skate',
    precio: 259,
    colores: [
      {
        nombre: 'Azul petróleo',
        hex: '#2f5560'
      },
      {
        nombre: 'Crema',
        hex: '#efe6d2'
      }
    ],
    tallas: {
      37: 2,
      38: 3,
      39: 3,
      40: 4,
      41: 4,
      42: 3,
      43: 2,
      44: 2
    },
    foto: 'azul-lona-madera',
    posicion: 'center',
    alt: 'Zapatillas de lona azul petróleo con cordones crema y puntera blanca sobre un piso de madera',
    resumen: 'Lona azul de uso rudo con cordones largos.',
    detalle: [
      'Lona gruesa',
      'Puntera de goma reforzada',
      'Ojales metálicos'
    ]
  },
  {
    slug: 'musgo-knit',
    nombre: 'Musgo Knit',
    categoria: 'running',
    precio: 269,
    colores: [
      {
        nombre: 'Musgo',
        hex: '#6f6a3b'
      },
      {
        nombre: 'Blanco',
        hex: '#f1f1ee'
      }
    ],
    tallas: {
      38: 1,
      39: 2,
      40: 3,
      41: 3,
      42: 4,
      43: 3,
      44: 2
    },
    foto: 'zapatillas-fondo-naranja',
    posicion: 'center',
    alt: 'Dos zapatillas de tela tipo calcetín verde musgo con suela blanca sobre fondo naranja',
    resumen: 'Tejido tipo calcetín sin cordones, listo para salir.',
    detalle: [
      'Tejido elástico sin cordones',
      'Suela blanca de espuma ligera',
      'Talón con lengüeta para calzar rápido'
    ]
  },
  {
    slug: 'noche-low',
    nombre: 'Noche Low',
    categoria: 'urbana',
    precio: 299,
    colores: [
      {
        nombre: 'Negro',
        hex: '#0b0b0b'
      },
      {
        nombre: 'Blanco',
        hex: '#f1f1ee'
      }
    ],
    tallas: {
      36: 1,
      37: 2,
      38: 3,
      39: 3,
      40: 3,
      41: 2,
      42: 2,
      43: 0
    },
    foto: 'negras-adoquin',
    posicion: 'center',
    alt: 'Zapatillas negras de cuero con suela blanca y los cordones sueltos sobre un piso de adoquines hexagonales',
    resumen: 'Negras de cuero con suela blanca para salir de noche.',
    detalle: [
      'Cuero sintético liso',
      'Suela blanca de goma',
      'Plantilla ergonómica'
    ]
  }
];

export const porSlug = (slug: string) => productos.find((p) => p.slug === slug);

export const tallasDisponibles = (p: Pick<Producto, 'tallas'>) =>
  Object.entries(p.tallas)
    .filter(([, n]) => n > 0)
    .map(([t]) => Number(t))
    .sort((a, b) => a - b);

export const nombreCategoria = (c: Categoria) => CATEGORIAS.find((x) => x.id === c)!.nombre;
