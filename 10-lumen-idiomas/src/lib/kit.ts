import { iniciar } from '../kit/sistema-demo';
import '../kit/sistema-demo.css';
import type { Grupo } from '../data/horarios';

/** Sistema de demo: pago, calendario, cancelar con enlace, lista de espera y panel. */
export const iniciarKit = () => iniciar({
  id: 'lumen-idiomas',
  negocio: 'Lumen',
  prefijo: 'LU',
  direccion: 'Lumen, Pueblo Libre, Lima (dirección ficticia)',
  horasCancelar: 48,
  pinDemo: '2468',
  panelUrl: `${import.meta.env.BASE_URL}panel/`,
  nombres: { matricula: 'matrícula' },
});

/** El ciclo empieza el lunes 14 de diciembre de 2026 (demo). */
export const INICIO_CICLO = '2026-12-14';
export const RESERVA_VACANTE = 100;
const OFFSET: Record<string, number> = { Lun: 0, Mar: 1, 'Mié': 2, Jue: 3, Vie: 4, 'Sáb': 5 };
/** Fecha de la primera clase del grupo (YYYY-MM-DD). */
export function primeraClase(g: Pick<Grupo, 'dias'>): string {
  const d = new Date(INICIO_CICLO + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + Math.min(...g.dias.map((x) => OFFSET[x] ?? 0)));
  return d.toISOString().slice(0, 10);
}
export const aMin = (h: string) => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
