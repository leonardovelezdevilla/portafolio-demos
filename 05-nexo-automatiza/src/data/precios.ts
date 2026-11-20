/**
 * Tabla de precios REFERENCIALES del cotizador (soles, S/). Datos ficticios de demo.
 * Cada valor es un rango [min, max]; la cotización final requiere diagnóstico.
 */
export interface Opcion {
  id: string;
  etiqueta: string;
  detalle?: string;
}

export const TIPOS_NEGOCIO: (Opcion & { factor: number })[] = [
  { id: 'retail', etiqueta: 'Tienda o comercio', detalle: 'Ropa, bodega, ferretería, e-commerce', factor: 1 },
  { id: 'salud', etiqueta: 'Salud', detalle: 'Clínica, consultorio, laboratorio', factor: 1.15 },
  { id: 'restaurante', etiqueta: 'Restaurante o café', detalle: 'Salón, delivery, cocina oculta', factor: 0.95 },
  { id: 'servicios', etiqueta: 'Servicios profesionales', detalle: 'Estudios, talleres, consultoras', factor: 1 },
  { id: 'otro', etiqueta: 'Otro rubro', detalle: 'Lo vemos en el diagnóstico', factor: 1.05 },
];

export const PROCESOS: (Opcion & { min: number; max: number })[] = [
  { id: 'whatsapp', etiqueta: 'Atención y avisos por WhatsApp', detalle: 'Respuestas, recordatorios, pedidos', min: 600, max: 1400 },
  { id: 'sheets', etiqueta: 'Datos ordenados en Google Sheets', detalle: 'Registro automático, sin copiar y pegar', min: 400, max: 900 },
  { id: 'facturacion', etiqueta: 'Facturación y comprobantes', detalle: 'Boletas y facturas electrónicas', min: 800, max: 1800 },
  { id: 'inventario', etiqueta: 'Inventario y compras', detalle: 'Stock, alertas, reposición', min: 900, max: 2200 },
  { id: 'reportes', etiqueta: 'Reportes y tableros', detalle: 'Ventas y caja al día, por correo', min: 500, max: 1200 },
];

export const VOLUMENES: (Opcion & { factor: number })[] = [
  { id: 'bajo', etiqueta: 'Hasta 500 al mes', detalle: 'Pedidos, citas o comprobantes', factor: 1 },
  { id: 'medio', etiqueta: 'De 501 a 3,000 al mes', detalle: 'Pedidos, citas o comprobantes', factor: 1.25 },
  { id: 'alto', etiqueta: 'Más de 3,000 al mes', detalle: 'Pedidos, citas o comprobantes', factor: 1.6 },
];

export const INTEGRACIONES: (Opcion & { min: number; max: number })[] = [
  { id: 'ose', etiqueta: 'Proveedor de facturación (OSE/PSE)', min: 200, max: 450 },
  { id: 'pagos', etiqueta: 'Pasarela de pagos o Yape/Plin', min: 250, max: 500 },
  { id: 'crm', etiqueta: 'CRM o sistema que ya usas', min: 300, max: 650 },
  { id: 'agenda', etiqueta: 'Calendario y correo', min: 150, max: 300 },
];

/** `plazo` = construcción, contada desde la propuesta aprobada y después del diagnóstico (3 a 5 días hábiles). */
export const URGENCIAS: (Opcion & { factor: number; plazo: string })[] = [
  { id: 'normal', etiqueta: 'Sin apuro', detalle: 'Construcción en 3 a 6 semanas', factor: 1, plazo: '3 a 6 semanas' },
  { id: 'prioritaria', etiqueta: 'Prioritaria', detalle: 'Construcción en 2 a 3 semanas', factor: 1.15, plazo: '2 a 3 semanas' },
  { id: 'urgente', etiqueta: 'Urgente', detalle: 'Construcción en 1 a 2 semanas (alcance acotado)', factor: 1.3, plazo: '1 a 2 semanas' },
];

/** Los montos del cotizador se muestran sin IGV. */
export const NOTA_IGV = 'Montos en soles, no incluyen IGV (18 %).';

/** Descuento por paquete según cantidad de procesos (desde = mínimo de procesos). */
export const DESCUENTO_PAQUETE: { desde: number; descuento: number }[] = [
  { desde: 5, descuento: 0.12 },
  { desde: 3, descuento: 0.08 },
];

/** Soporte mensual referencial posterior a los 30 días incluidos, por proceso. */
export const SOPORTE_MENSUAL_POR_PROCESO = { min: 40, max: 90 };

/** Redondeo de los extremos del rango, en soles. */
export const REDONDEO = 50;

export const PRECIOS = {
  tipos: TIPOS_NEGOCIO,
  procesos: PROCESOS,
  volumenes: VOLUMENES,
  integraciones: INTEGRACIONES,
  urgencias: URGENCIAS,
  descuentos: DESCUENTO_PAQUETE,
  soporte: SOPORTE_MENSUAL_POR_PROCESO,
  redondeo: REDONDEO,
};
export type TablaPrecios = typeof PRECIOS;
