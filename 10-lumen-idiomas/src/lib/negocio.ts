/** Datos ficticios de la academia. Todo es de demostración. */
export const NEGOCIO = {
  nombre: 'Lumen',
  nombreLargo: 'Lumen Idiomas',
  razonSocial: 'Lumen Idiomas S.A.C. (razón social ficticia)',
  lema: 'Inglés que se habla desde la primera clase',
  whatsapp: '51935852637',
  telefonoVisible: 'Escribir por WhatsApp',
  correo: 'hola@lumen.ejemplo.invalid',
  direccion: 'Av. Ficticia 456, piso 2',
  distrito: 'Pueblo Libre, Lima',
  ruc: '20000000001',
  atencion: 'Lunes a viernes de 9:00 a 20:00 · Sábados de 9:00 a 13:00',
} as const;

export const AVISO_WHATSAPP =
  'Al abrir WhatsApp, tu mensaje y tu número pasan a WhatsApp (Meta), con sus propias condiciones. No envíes DNI, datos de salud ni fotos del menor por WhatsApp.';

export const AVISO_NIVEL =
  'El resultado es referencial: mide gramática y vocabulario básicos en pocas preguntas. La ubicación final se confirma con una entrevista breve (conversación y comprensión) antes de iniciar el ciclo.';

export const NAV = [
  { href: '/#test', texto: 'Test de nivel' },
  { href: '/#horarios', texto: 'Horarios' },
  { href: '/#precios', texto: 'Precios' },
  { href: '/#docentes', texto: 'Docentes' },
  { href: '/#matricula', texto: 'Matrícula' },
  { href: '/#preguntas', texto: 'Preguntas' },
] as const;
