/** Tratamientos ficticios pero realistas. Precios referenciales, no son una oferta. */
export interface Tratamiento {
  id: string;
  nombre: string;
  icono: string;
  sirve: string;
  duracion: string;
  sesiones: string;
  molestias: string;
  cuidados: string;
  desde: number;
}

export const TRATAMIENTOS: Tratamiento[] = [
  {
    id: 'consulta',
    nombre: 'Consulta dermatológica',
    icono: 'stethoscope',
    sirve: 'Evaluar la piel, el cabello o las uñas, resolver dudas y definir un plan.',
    duracion: '30 a 40 min',
    sesiones: '1; los controles los indica el especialista',
    molestias: 'Ninguna; es una revisión visual y conversación.',
    cuidados: 'Llevar tus productos actuales y exámenes previos, si los tienes.',
    desde: 180,
  },
  {
    id: 'acne',
    nombre: 'Control de acné',
    icono: 'droplets',
    sirve: 'Seguimiento del acné con una rutina de cuidado y, si corresponde, tratamiento indicado.',
    duracion: '20 a 30 min',
    sesiones: 'Controles cada 4 a 8 semanas, según el caso',
    molestias: 'Resequedad o sensibilidad pasajera según lo indicado.',
    cuidados: 'Limpieza suave, protector solar a diario y no manipular las lesiones.',
    desde: 150,
  },
  {
    id: 'peeling',
    nombre: 'Peeling químico superficial',
    icono: 'sparkles',
    sirve: 'Renovar la capa más externa de la piel de forma controlada, previa evaluación.',
    duracion: '30 a 45 min',
    sesiones: 'Entre 3 y 6, con semanas de intervalo',
    molestias: 'Ardor leve durante la aplicación; enrojecimiento y descamación fina por unos días.',
    cuidados: 'Protector solar estricto, hidratación y evitar exfoliantes durante la recuperación.',
    desde: 220,
  },
  {
    id: 'limpieza',
    nombre: 'Limpieza facial médica',
    icono: 'leaf',
    sirve: 'Limpieza profunda supervisada, adaptada a pieles sensibles o con tendencia a poros obstruidos.',
    duracion: '60 min',
    sesiones: '1; puede repetirse cada 4 a 6 semanas',
    molestias: 'Molestia leve en la extracción; enrojecimiento que cede en horas.',
    cuidados: 'Evitar maquillaje por 24 horas y usar protector solar.',
    desde: 190,
  },
  {
    id: 'crioterapia',
    nombre: 'Crioterapia de lesiones benignas',
    icono: 'snowflake',
    sirve: 'Retirar verrugas u otras lesiones benignas con frío controlado, tras confirmar el diagnóstico.',
    duracion: '10 a 20 min',
    sesiones: '1 a 3, según el tipo y tamaño de la lesión',
    molestias: 'Ardor o picor breve; puede salir una ampolla o costra.',
    cuidados: 'Mantener la zona limpia, no retirar la costra y proteger del sol.',
    desde: 160,
  },
  {
    id: 'dermatoscopia',
    nombre: 'Evaluación de lunares con dermatoscopia',
    icono: 'scan-search',
    sirve: 'Revisar lunares y manchas con una lente de aumento especial para detectar cambios a tiempo.',
    duracion: '30 min',
    sesiones: '1; el seguimiento lo define el especialista',
    molestias: 'Ninguna; no hay cortes ni pinchazos.',
    cuidados: 'Ir sin esmalte en las uñas y señalar los lunares que hayan cambiado.',
    desde: 200,
  },
  {
    id: 'tricoscopia',
    nombre: 'Evaluación de caída del cabello',
    icono: 'search',
    sirve: 'Observar el cuero cabelludo con tricoscopia para orientar la causa de la caída.',
    duracion: '30 a 40 min',
    sesiones: '1, con controles según indicación',
    molestias: 'Ninguna; es un examen sin dolor.',
    cuidados: 'Llevar análisis previos y evitar productos pesados en el cabello ese día.',
    desde: 170,
  },
  {
    id: 'piel-sensible',
    nombre: 'Control de dermatitis y piel sensible',
    icono: 'heart-pulse',
    sirve: 'Seguimiento de brotes de dermatitis, resequedad o irritación, con pautas de cuidado diario.',
    duracion: '20 a 30 min',
    sesiones: 'Controles cada 4 a 12 semanas, según el caso',
    molestias: 'Ninguna en la consulta; el tratamiento indicado puede dar picor leve al inicio.',
    cuidados: 'Jabones sin fragancia, hidratación frecuente y evitar rascarte.',
    desde: 150,
  },
];

export const formatoPEN = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  maximumFractionDigits: 0,
});
