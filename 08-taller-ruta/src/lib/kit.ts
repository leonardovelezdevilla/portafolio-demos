import { iniciar, ocupados } from '../kit/sistema-demo';
import '../kit/sistema-demo.css';
import { TALLER } from '../data/taller';
import { estadoTurno, type TurnoDef, type TurnoEstado } from './reserva';

/** Sistema de demo: pago, calendario, cancelar con enlace, lista de espera y panel. */
export const iniciarKit = () => iniciar({
  id: 'taller-ruta',
  negocio: TALLER.nombre,
  prefijo: 'CITA', // distinto del código de seguimiento TR-DEMO-… que se entrega en el taller
  direccion: TALLER.direccion,
  horasCancelar: 12,
  pinDemo: '2468',
  panelUrl: `${import.meta.env.BASE_URL}panel/`,
  nombres: { cita: 'cita' },
});

export const inicioTurno = (id: string) => (id === 'manana' ? 8 * 60 : 14 * 60);

/** Estado del turno restando también las reservas de prueba hechas en este navegador. */
export function estadoTurnoKit(fecha: string, turno: TurnoDef, ahora: Date): TurnoEstado {
  const e = estadoTurno(fecha, turno, ahora);
  if (e.estado === 'cerrado') return e;
  const libres = Math.max(0, e.libres - ocupados(fecha).filter((m) => m === inicioTurno(turno.id)).length);
  return { ...e, libres, estado: libres === 0 ? 'agotado' : libres <= 2 ? 'ultimos' : 'disponible' };
}
