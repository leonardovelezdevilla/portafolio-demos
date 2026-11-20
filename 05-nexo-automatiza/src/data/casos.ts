export interface Caso {
  id: string;
  sector: 'retail' | 'salud' | 'restaurantes' | 'servicios';
  cliente: string;
  titulo: string;
  problema: string;
  solucion: string;
  herramientas: string[];
  resultado: { cifra: string; texto: string }[];
}

export const SECTORES: { id: Caso['sector'] | 'todos'; etiqueta: string }[] = [
  { id: 'todos', etiqueta: 'Todos' },
  { id: 'retail', etiqueta: 'Retail' },
  { id: 'salud', etiqueta: 'Salud' },
  { id: 'restaurantes', etiqueta: 'Restaurantes' },
  { id: 'servicios', etiqueta: 'Servicios' },
];

/** Todos los clientes y cifras son ficticios y se muestran con la etiqueta «Ejemplo de demo». */
export const CASOS: Caso[] = [
  {
    id: 'bodega-mirador',
    sector: 'retail',
    cliente: 'Bodega Mirador (ficticia)',
    titulo: 'Stock que avisa antes de acabarse',
    problema:
      'El dueño contaba la mercadería a mano cada semana y se enteraba de los faltantes cuando el cliente ya había preguntado.',
    solucion:
      'Cada venta descuenta el stock en una hoja de Google Sheets. Cuando un producto baja de su mínimo, el encargado de compras recibe un aviso por WhatsApp con la lista de reposición.',
    herramientas: ['Google Sheets', 'Apps Script', 'WhatsApp Business'],
    resultado: [
      { cifra: '−70 %', texto: 'quiebres de stock en el primer trimestre' },
      { cifra: '5 h', texto: 'semanales que dejaron de gastarse en conteo' },
    ],
  },
  {
    id: 'moda-rimac',
    sector: 'retail',
    cliente: 'Moda Rímac (ficticia)',
    titulo: 'Del pedido por chat a la boleta, sin digitar',
    problema:
      'Los pedidos llegaban por mensajes sueltos; alguien los copiaba a un cuaderno y luego emitía la boleta a mano, con errores de monto.',
    solucion:
      'Un formulario de pedido enlazado desde WhatsApp registra el pedido en Sheets, calcula el total y genera la boleta electrónica con el proveedor de facturación del negocio.',
    herramientas: ['Formularios de Google', 'Google Sheets', 'API de facturación (OSE/PSE)'],
    resultado: [
      { cifra: '3 min', texto: 'por pedido, antes 12 min' },
      { cifra: '0', texto: 'boletas con monto equivocado en 8 semanas' },
    ],
  },
  {
    id: 'sonrie-lima',
    sector: 'salud',
    cliente: 'Consultorio Dental Sonríe (ficticio)',
    titulo: 'Recordatorios de cita que sí se leen',
    problema:
      'Un 28 % de los pacientes faltaba a su cita sin avisar y la recepcionista pasaba las mañanas llamando uno por uno.',
    solucion:
      'La agenda envía un recordatorio por WhatsApp 24 horas antes, con botones para confirmar o reprogramar. Los cupos liberados se ofrecen a la lista de espera.',
    herramientas: ['Google Calendar', 'WhatsApp Business', 'Google Sheets'],
    resultado: [
      { cifra: '28 % → 11 %', texto: 'inasistencias en tres meses' },
      { cifra: '2 h', texto: 'diarias recuperadas en recepción' },
    ],
  },
  {
    id: 'lab-lumbre',
    sector: 'salud',
    cliente: 'Laboratorio Lumbre (ficticio)',
    titulo: 'Aviso de resultados sin exponer datos',
    problema:
      'Los pacientes llamaban para preguntar si ya estaban sus análisis, saturando la línea del laboratorio.',
    solucion:
      'Al cargar un resultado, el paciente recibe un aviso genérico por WhatsApp (sin datos clínicos) con el enlace al portal propio del laboratorio, donde entra con su código.',
    herramientas: ['WhatsApp Business', 'Google Sheets', 'Apps Script'],
    resultado: [
      { cifra: '−45 %', texto: 'llamadas de consulta por resultados' },
      { cifra: '100 %', texto: 'de avisos sin datos clínicos en el mensaje' },
    ],
  },
  {
    id: 'marea-alta',
    sector: 'restaurantes',
    cliente: 'Cevichería Marea Alta (ficticia)',
    titulo: 'Comandas de delivery directo a cocina',
    problema:
      'Los pedidos por WhatsApp se anotaban a mano y en hora punta se perdían o se duplicaban.',
    solucion:
      'Cada pedido confirmado genera una comanda numerada en la pantalla de cocina y suma la venta a la hoja de caja diaria, lista para el cierre.',
    herramientas: ['WhatsApp Business', 'Google Sheets', 'Looker Studio'],
    resultado: [
      { cifra: '−80 %', texto: 'pedidos perdidos o repetidos' },
      { cifra: '15 min', texto: 'menos en el cierre de caja cada noche' },
    ],
  },
  {
    id: 'cafe-tostao',
    sector: 'restaurantes',
    cliente: 'Café Tostao (ficticio)',
    titulo: 'Compras semanales calculadas solas',
    problema:
      'Las compras de insumos se hacían «a ojo»: a veces sobraba leche y a veces faltaba café en pleno fin de semana.',
    solucion:
      'Con las ventas de cada día y las recetas, la hoja descuenta insumos y arma el pedido sugerido al proveedor cada jueves, listo para aprobar con un clic.',
    herramientas: ['Google Sheets', 'Apps Script', 'Correo'],
    resultado: [
      { cifra: '−18 %', texto: 'merma de insumos perecibles' },
      { cifra: '1', texto: 'pedido semanal en vez de compras de emergencia' },
    ],
  },
  {
    id: 'pardo-contadores',
    sector: 'servicios',
    cliente: 'Estudio Contable Pardo (ficticio)',
    titulo: 'Comprobantes que llegan ordenados',
    problema:
      'Los clientes enviaban fotos de facturas por chat; a fin de mes había que buscarlas, renombrarlas y digitarlas.',
    solucion:
      'El cliente envía la foto a un número de WhatsApp del estudio; un flujo la guarda en la carpeta de su empresa y registra fecha, RUC y monto en Sheets para revisión.',
    herramientas: ['WhatsApp Business', 'Google Drive', 'Google Sheets'],
    resultado: [
      { cifra: '−60 %', texto: 'tiempo de digitación al cierre mensual' },
      { cifra: '1 día', texto: 'antes de lo usual para entregar los libros' },
    ],
  },
  {
    id: 'taller-veloz',
    sector: 'servicios',
    cliente: 'Taller Mecánico Veloz (ficticio)',
    titulo: 'Seguimiento de órdenes de trabajo',
    problema:
      'Los clientes llamaban a cada rato para saber si su auto estaba listo, y las cotizaciones se hacían en papel.',
    solucion:
      'Cada orden tiene un estado en Sheets (recibido, en revisión, esperando repuesto, listo). Al cambiarlo, el cliente recibe un aviso por WhatsApp y la cotización sale en PDF.',
    herramientas: ['Google Sheets', 'Apps Script', 'WhatsApp Business'],
    resultado: [
      { cifra: '−55 %', texto: 'llamadas de «¿ya está mi auto?»' },
      { cifra: '24 h', texto: 'a 4 h para enviar una cotización' },
    ],
  },
];
