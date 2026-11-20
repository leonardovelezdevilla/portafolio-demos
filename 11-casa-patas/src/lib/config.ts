/** Datos ficticios de la demo. Precios en S/ con IGV incluido. */
export const TELEFONO_DEMO = '51935852637';
export const NEGOCIO = {
  nombre: 'Casa Patas',
  razonSocial: 'Casa Patas Veterinaria S.A.C. (ficticia)',
  ruc: '20000000001 (ficticio, no válido)',
  direccion: 'Jr. Ejemplo 456, Magdalena del Mar, Lima (ficticia)',
  correoArco: 'arco@ejemplo.invalid',
} as const;

export const HORARIO_TEXTO = [
  { dias: 'Lunes a sábado', horas: '9:00 a 20:00' },
  { dias: 'Domingo', horas: '9:00 a 13:00' },
] as const;

export const SERVICIOS_RESERVA = [
  { id: 'consulta', nombre: 'Consulta general', detalle: 'Evaluación con el médico veterinario', desde: 60, duracion: 30 },
  { id: 'vacuna', nombre: 'Vacunación o desparasitación', detalle: 'Aplicación con carnet de salud', desde: 45, duracion: 30 },
  { id: 'bano', nombre: 'Baño y peluquería', detalle: 'Turnos propios con la groomer', desde: 50, duracion: 120 },
] as const;
export type ServicioId = (typeof SERVICIOS_RESERVA)[number]['id'];

export const TAMANOS_BANO = [
  { id: 'pequeno', nombre: 'Pequeño (hasta 8 kg)', desde: 50 },
  { id: 'mediano', nombre: 'Mediano (8 a 20 kg)', desde: 70 },
  { id: 'grande', nombre: 'Grande (20 a 35 kg)', desde: 95 },
  { id: 'gigante', nombre: 'Gigante (más de 35 kg)', desde: 120 },
] as const;

export interface Precio { nombre: string; detalle: string; desde: number; nota?: string }
export const PRECIOS: { grupo: string; icono: 'estetoscopio' | 'banio' | 'pastilla'; items: Precio[] }[] = [
  { grupo: 'Consultorio', icono: 'estetoscopio', items: [
    { nombre: 'Consulta general', detalle: 'Examen físico y orientación; incluye control de peso.', desde: 60 },
    { nombre: 'Vacunación', detalle: 'Múltiple o triple felina y antirrábica, con carnet.', desde: 45, nota: 'Según la vacuna que indique el médico.' },
    { nombre: 'Desparasitación', detalle: 'Interna y externa, según peso.', desde: 25, nota: 'El producto lo define el médico.' },
    { nombre: 'Cirugías menores', detalle: 'Solo previa evaluación del médico.', desde: 180, nota: 'El precio final se informa tras la evaluación.' },
  ] },
  { grupo: 'Baño y peluquería', icono: 'banio', items: [
    { nombre: 'Baño, tamaño pequeño', detalle: 'Hasta 8 kg. Incluye secado y limpieza de oídos.', desde: 50 },
    { nombre: 'Baño, tamaño mediano', detalle: 'De 8 a 20 kg.', desde: 70 },
    { nombre: 'Baño, tamaño grande', detalle: 'De 20 a 35 kg.', desde: 95 },
    { nombre: 'Baño, tamaño gigante', detalle: 'Más de 35 kg.', desde: 120 },
    { nombre: 'Corte de pelo', detalle: 'Se suma al baño; depende del pelaje y el tamaño.', desde: 30 },
  ] },
  { grupo: 'Farmacia y alimento', icono: 'pastilla', items: [
    { nombre: 'Medicamentos', detalle: 'Con receta del médico cuando corresponde.', desde: 15 },
    { nombre: 'Alimento a granel', detalle: 'Por kilo, de varias líneas para perro y gato.', desde: 9 },
    { nombre: 'Antipulgas y garrapatas', detalle: 'Pipeta, pastilla o collar, según peso.', desde: 35 },
  ] },
];
