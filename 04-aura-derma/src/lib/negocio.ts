/** Datos ficticios de la clínica. Todo es de demostración. */
export const NEGOCIO = {
  nombre: 'Aura Derma',
  lema: 'Dermatología con calma',
  whatsapp: '51935852637',
  telefonoVisible: 'Escribir por WhatsApp',
  correo: 'hola@auraderma.ejemplo.invalid',
  direccion: 'Av. Ficticia 123, oficina 402',
  distrito: 'San Isidro, Lima',
  ruc: '20000000001',
  horario: [
    { dias: 'Lunes a viernes', horas: '9:00 a 13:00 y 15:00 a 19:00' },
    { dias: 'Sábados', horas: '9:00 a 13:00' },
    { dias: 'Domingos', horas: 'Cerrado' },
  ],
} as const;

export const AVISO_MEDICO =
  'La información es general y no reemplaza una consulta médica; el especialista indicará el tratamiento adecuado.';

export const NAV = [
  { href: '/#tratamientos', texto: 'Tratamientos' },
  { href: '/#especialistas', texto: 'Especialistas' },
  { href: '/#primera-consulta', texto: 'Primera consulta' },
  { href: '/#agenda', texto: 'Agenda' },
  { href: '/#preguntas', texto: 'Preguntas' },
] as const;
