import { iniciar } from '../kit/sistema-demo';
import '../kit/sistema-demo.css';

/** Sistema de demo: suscripción con pago simulado, comprobante y panel. */
export const iniciarKit = () => iniciar({
  id: 'kipuflow',
  negocio: 'Kipuflow',
  prefijo: 'KF',
  pinDemo: '2468',
  panelUrl: `${import.meta.env.BASE_URL}panel/`,
  nombres: { suscripcion: 'suscripción' },
});
