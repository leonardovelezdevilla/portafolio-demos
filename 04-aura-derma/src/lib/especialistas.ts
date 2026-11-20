/** Especialistas ficticios. No se muestran CMP ni RNE: «se muestran en la clínica». */
export interface Especialista {
  id: string;
  nombre: string;
  iniciales: string;
  enfoque: string;
  detalle: string;
  /** Días de atención: 1 = lunes … 6 = sábado. */
  dias: number[];
}

export const ESPECIALISTAS: Especialista[] = [
  {
    id: 'rojas',
    nombre: 'Dra. Camila Rojas Ferreyra',
    iniciales: 'CR',
    enfoque: 'Dermatología clínica y acné en adultos',
    detalle: 'Le interesa explicar cada paso del plan en un lenguaje claro y acompañar los controles.',
    dias: [1, 2, 3, 4, 5],
  },
  {
    id: 'quispe',
    nombre: 'Dr. Mateo Quispe Valdivia',
    iniciales: 'MQ',
    enfoque: 'Dermatoscopia y revisión de lunares',
    detalle: 'Se dedica a la detección temprana de cambios en la piel y a procedimientos menores.',
    dias: [2, 3, 4, 5, 6],
  },
  {
    id: 'tello',
    nombre: 'Dra. Valeria Tello Arbulú',
    iniciales: 'VT',
    enfoque: 'Piel sensible, dermatitis y cabello',
    detalle: 'Atiende a adolescentes y adultos con irritación frecuente o caída del cabello.',
    dias: [1, 3, 4, 5, 6],
  },
  {
    id: 'salazar',
    nombre: 'Dr. Renzo Salazar Benites',
    iniciales: 'RS',
    enfoque: 'Procedimientos: peelings y crioterapia',
    detalle: 'Realiza procedimientos ambulatorios superficiales, siempre después de una evaluación.',
    dias: [1, 2, 4, 5],
  },
];

export const MENCION_REGISTRO = 'CMP y RNE se muestran en la clínica.';
