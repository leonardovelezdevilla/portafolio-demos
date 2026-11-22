import { iniciar } from '../kit/sistema-demo';
import '../kit/sistema-demo.css';

/** Configuración del sistema de demo (pago, calendario, cancelar, lista de espera y panel). */
export const iniciarKit = () => iniciar({
  id: 'casa-patas',
  negocio: 'Casa Patas',
  prefijo: 'CP',
  direccion: 'Casa Patas, Magdalena del Mar, Lima (dirección ficticia)',
  horasCancelar: 2,
  pinDemo: '2468',
  panelUrl: `${import.meta.env.BASE_URL}panel/`,
  nombres: { cita: 'cita' },
});
