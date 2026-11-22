import { iniciar, ocupados } from '../kit/sistema-demo';
import '../kit/sistema-demo.css';

/** Sistema de demo: visitas con calendario, cancelar con enlace, lista de espera y panel. */
export const iniciarKit = () => iniciar({
  id: 'habitat-sur',
  negocio: 'Habitat Sur',
  prefijo: 'HS',
  direccion: 'Sala de ventas Habitat Sur, Chorrillos, Lima (dirección ficticia)',
  horasCancelar: 3,
  pinDemo: '2468',
  panelUrl: `${import.meta.env.BASE_URL}panel/`,
  nombres: { visita: 'visita' },
});
export const INICIO_FRANJA: Record<string, number> = { manana: 10 * 60, tarde: 15 * 60 };
export const VISITAS_POR_FRANJA = 3;
export const tituloVisita = (depto: string) => `Visita: ${depto}`;
/** Visitas ya agendadas en esa franja (pruebas de este navegador). */
export const visitasEn = (fecha: string, franja: string, depto: string) => ocupados(fecha, tituloVisita(depto)).filter((m) => m === INICIO_FRANJA[franja]).length;
