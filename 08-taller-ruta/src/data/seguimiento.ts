// Seguimiento de ejemplo: códigos de demostración, no corresponden a vehículos reales.
export interface EtapaDef {
  id: string;
  nombre: string;
  detalle: string;
}

export const ETAPAS: EtapaDef[] = [
  { id: 'recibido', nombre: 'Recibido', detalle: 'Registramos tu vehículo, el kilometraje y lo que nos contaste.' },
  { id: 'diagnostico', nombre: 'Diagnóstico', detalle: 'Revisión en elevador y lectura con escáner.' },
  { id: 'aprobacion', nombre: 'Aprobación', detalle: 'Te enviamos el presupuesto detallado; no avanzamos sin tu aprobación.' },
  { id: 'reparacion', nombre: 'Reparación', detalle: 'El trabajo aprobado se realiza y se prueba.' },
  { id: 'listo', nombre: 'Listo para recoger', detalle: 'Prueba final hecha; te devolvemos las piezas cambiadas si las pides.' },
];

export interface SeguimientoDemo {
  codigo: string;
  vehiculo: string;
  placa: string;
  servicio: string;
  etapa: number; // índice en ETAPAS
  nota: string;
}

export const SEGUIMIENTOS: SeguimientoDemo[] = [
  { codigo: 'TR-DEMO-1001', vehiculo: 'Auto (ejemplo)', placa: 'ABC-123', servicio: 'Diagnóstico por escáner', etapa: 1, nota: 'Estamos leyendo los códigos de falla. Te avisamos cuando el presupuesto esté listo.' },
  { codigo: 'TR-DEMO-1002', vehiculo: 'SUV (ejemplo)', placa: 'A1B-234', servicio: 'Frenos', etapa: 2, nota: 'El presupuesto está listo y espera tu aprobación. No empezamos hasta que respondas.' },
  { codigo: 'TR-DEMO-1003', vehiculo: 'Camioneta (ejemplo)', placa: 'B2C-345', servicio: 'Afinamiento y cambio de aceite', etapa: 3, nota: 'Trabajo aprobado en curso. Falta la prueba de ruta.' },
  { codigo: 'TR-DEMO-1004', vehiculo: 'Moto (ejemplo)', placa: '1234-AB', servicio: 'Cambio de aceite', etapa: 4, nota: 'Tu moto está lista. Puedes recogerla dentro del horario del taller.' },
];
