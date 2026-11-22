import { iniciar } from '../kit/sistema-demo';
import '../kit/sistema-demo.css';

/** Sistema de demo: pago, calendario, cancelar con enlace, lista de espera y panel. */
export const iniciarKit = () => iniciar({
  id: 'pulso-studio',
  negocio: 'Pulso Studio',
  prefijo: 'PS',
  direccion: 'Pulso Studio, Av. Los Fresnos 482, Santiago de Surco, Lima (dirección ficticia)',
  horasCancelar: 6,
  pinDemo: '2468',
  panelUrl: `${import.meta.env.BASE_URL}panel/`,
  nombres: { clase: 'clase' },
});
