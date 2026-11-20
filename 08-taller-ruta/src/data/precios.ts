// Tarifario referencial de Taller Ruta (ficticio). Montos en soles, IGV incluido.
export type VehiculoId = 'auto' | 'suv' | 'camioneta' | 'moto';
export type ServicioId = 'aceite' | 'frenos' | 'afinamiento' | 'alineamiento' | 'diagnostico' | 'preitv';

export interface Vehiculo {
  id: VehiculoId;
  nombre: string;
  ejemplo: string;
}

export const VEHICULOS: Vehiculo[] = [
  { id: 'auto', nombre: 'Auto', ejemplo: 'Sedán o hatchback' },
  { id: 'suv', nombre: 'SUV', ejemplo: 'Crossover o SUV compacta' },
  { id: 'camioneta', nombre: 'Camioneta', ejemplo: 'Pickup o van pequeña' },
  { id: 'moto', nombre: 'Moto', ejemplo: 'Moto lineal o scooter' },
];

export interface Servicio {
  id: ServicioId;
  nombre: string;
  incluye: string;
}

export const SERVICIOS: Servicio[] = [
  { id: 'aceite', nombre: 'Cambio de aceite y filtro', incluye: 'Aceite, filtro de aceite y revisión de niveles.' },
  { id: 'frenos', nombre: 'Frenos', incluye: 'Pastillas o zapatas del eje delantero y revisión del sistema.' },
  { id: 'afinamiento', nombre: 'Afinamiento', incluye: 'Bujías, filtro de aire y limpieza de componentes de admisión.' },
  { id: 'alineamiento', nombre: 'Alineamiento y balanceo', incluye: 'Alineamiento de dirección y balanceo de las cuatro ruedas.' },
  { id: 'diagnostico', nombre: 'Diagnóstico por escáner', incluye: 'Lectura de códigos de falla y reporte con recomendaciones.' },
  { id: 'preitv', nombre: 'Revisión pre-ITV', incluye: 'Chequeo de luces, frenos, suspensión, emisiones visibles y llantas.' },
];

// Rango [mínimo, máximo] por servicio y vehículo. null = no se ofrece para ese vehículo.
export type Rango = readonly [number, number];
export const TARIFAS: Record<ServicioId, Record<VehiculoId, Rango | null>> = {
  aceite: { auto: [140, 200], suv: [170, 240], camioneta: [200, 290], moto: [70, 100] },
  frenos: { auto: [220, 340], suv: [280, 430], camioneta: [330, 500], moto: [90, 140] },
  afinamiento: { auto: [240, 340], suv: [280, 400], camioneta: [330, 470], moto: [100, 150] },
  alineamiento: { auto: [100, 140], suv: [120, 160], camioneta: [140, 190], moto: null },
  diagnostico: { auto: [90, 130], suv: [100, 140], camioneta: [110, 160], moto: [70, 100] },
  preitv: { auto: [80, 120], suv: [90, 130], camioneta: [100, 150], moto: null },
};

// A mayor kilometraje, mayor probabilidad de piezas adicionales: sube solo el tope del rango.
export interface BandaKm {
  desde: number;
  hasta: number;
  factorTope: number;
  etiqueta: string;
}
export const BANDAS_KM: BandaKm[] = [
  { desde: 0, hasta: 19999, factorTope: 1, etiqueta: 'Menos de 20 000 km' },
  { desde: 20000, hasta: 59999, factorTope: 1.03, etiqueta: '20 000 a 59 999 km' },
  { desde: 60000, hasta: 99999, factorTope: 1.07, etiqueta: '60 000 a 99 999 km' },
  { desde: 100000, hasta: 500000, factorTope: 1.12, etiqueta: '100 000 km o más' },
];
export const KM_MAX = 500000;
