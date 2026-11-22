import { iniciar } from '../kit/sistema-demo';
import '../kit/sistema-demo.css';

/** Sistema de demo: pago en línea, comprobante y panel de pedidos. */
export const iniciarKit = () => iniciar({
  id: 'vertice-studio',
  negocio: 'Vértice Studio',
  prefijo: 'VS',
  horasCancelar: 2,
  pinDemo: '2468',
  panelUrl: `${import.meta.env.BASE_URL}panel/`,
  nombres: { pedido: 'pedido' },
});
