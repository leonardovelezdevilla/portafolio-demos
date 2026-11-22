import { iniciar } from '../kit/sistema-demo';
import '../kit/sistema-demo.css';

/** Sistema de demo: diagnóstico agendado con pago simulado, comprobante, calendario, cancelar con enlace y panel. */
export const iniciarKit = () => iniciar({
  id: 'nexo',
  negocio: 'Nexo Automatiza',
  prefijo: 'NX',
  direccion: 'Videollamada (el enlace llega por WhatsApp)',
  horasCancelar: 12,
  pinDemo: '2468',
  panelUrl: `${import.meta.env.BASE_URL}panel/`,
  nombres: { llamada: 'diagnóstico' },
});
