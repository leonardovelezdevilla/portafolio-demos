/** Docentes ficticios. Sin títulos, certificaciones ni instituciones que parezcan verificables. */
export interface Docente {
  id: string;
  nombre: string;
  enfoque: string;
  descripcion: string;
}

export const DOCENTES: readonly Docente[] = [
  { id: 'salas', nombre: 'Daniela Salas', enfoque: 'Primeros pasos y pronunciación', descripcion: 'Le gusta empezar con canciones, mímica y mucha conversación para que nadie se quede callado el primer día.' },
  { id: 'ibanez', nombre: 'Mateo Ibáñez', enfoque: 'Jóvenes de 12 a 17 años', descripcion: 'Arma las clases con juegos, series cortas y proyectos en parejas. Cree que se aprende más riendo que copiando.' },
  { id: 'cardenas', nombre: 'Rosa Cárdenas', enfoque: 'Inglés para el trabajo', descripcion: 'Practica correos, reuniones y presentaciones con situaciones parecidas a las de una oficina.' },
  { id: 'quiroz', nombre: 'Andrés Quiroz', enfoque: 'Gramática en contexto', descripcion: 'Explica las reglas con ejemplos de la vida diaria y deja siempre tiempo para corregir en voz alta.' },
  { id: 'montoya', nombre: 'Valeria Montoya', enfoque: 'Debate y escritura avanzada', descripcion: 'Dirige discusiones, reseñas y ensayos cortos para ganar precisión y seguridad al expresar ideas.' },
];

export const docentePorId = (id: string): Docente => {
  const d = DOCENTES.find((x) => x.id === id);
  if (!d) throw new Error(`Docente desconocido: ${id}`);
  return d;
};
