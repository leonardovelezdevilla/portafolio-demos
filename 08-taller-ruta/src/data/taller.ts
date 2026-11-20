// Datos de la marca ficticia Taller Ruta. Todo es de demostración.
export const TALLER = {
  nombre: 'Taller Ruta',
  razonSocial: 'Taller Ruta Servicios Automotrices S.A.C. (ficticia)',
  ruc: '20000000001 (RUC ficticio)',
  telefono: '51935852637',
  telefonoVisible: 'Escribir por WhatsApp',
  correo: 'hola@tallerruta.ejemplo.invalid',
  direccion: 'Av. Ejemplo 000, Los Olivos, Lima (dirección ficticia)',
};

export const WA_BASE = `https://wa.me/${TALLER.telefono}`;

export function enlaceWhatsApp(texto: string): string {
  return `${WA_BASE}?text=${encodeURIComponent(texto)}`;
}
