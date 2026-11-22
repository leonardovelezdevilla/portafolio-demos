import { iniciar, ocupados } from '../kit/sistema-demo';
import '../kit/sistema-demo.css';
import { OMAKASE_ASIENTOS } from './reserva';

/** Sistema de demo: pago, calendario, cancelar con enlace, lista de espera y panel. */
export const iniciarKit = () => iniciar({
  id: 'kuro-lima',
  negocio: 'Kuro',
  prefijo: 'KU',
  direccion: 'Kuro, Jr. Los Cedros 245, Barranco, Lima (dirección ficticia)',
  horasCancelar: 24,
  pinDemo: '2468',
  panelUrl: `${import.meta.env.BASE_URL}panel/`,
  nombres: { reserva: 'reserva' },
});

export const PRECIO_OMAKASE = 320;
export const GARANTIA_OMAKASE = 100; // por persona, se descuenta de la cuenta
export const TITULO_OMAKASE = 'Omakase en la barra';
export const aMin = (h: string) => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
/** Asientos libres de omakase en un horario, restando las reservas de prueba de este navegador. */
export const asientosLibres = (fecha: string, hora: string) => OMAKASE_ASIENTOS - ocupados(fecha, TITULO_OMAKASE).filter((m) => m === aMin(hora)).length;
