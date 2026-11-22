import { iniciar } from '../kit/sistema-demo';
import '../kit/sistema-demo.css';
import { NEGOCIO } from './negocio';

/** Sistema de demo: pago, calendario, cancelar con enlace, lista de espera y panel. */
export const iniciarKit = () => iniciar({
  id: 'aura-derma',
  negocio: NEGOCIO.nombre,
  prefijo: 'AD',
  direccion: `${NEGOCIO.nombre}, ${NEGOCIO.direccion} (dirección ficticia)`,
  horasCancelar: 24,
  pinDemo: '2468',
  panelUrl: `${import.meta.env.BASE_URL}panel/`,
});
export const tituloCita = (especialista: string) => `Consulta con ${especialista}`;
