/**
 * Guía REFERENCIAL de vacunación y desparasitación por especie y edad.
 * No es un esquema médico: el médico veterinario lo define según la mascota (ver DECISIONES.md, «verificar con el médico»).
 * Lógica pura: recibe el instante actual para poder probarla.
 */
import { partesLima, sumarDias, ymdValido } from './fechas';

export type Especie = 'perro' | 'gato';
export type UnidadEdad = 'semanas' | 'meses' | 'anios';
export type Grupo = 'desparasitacion' | 'vacuna' | 'antirrabica';
export type Estado = 'ahora' | 'proximo' | 'anterior';

export interface Hito { id: string; grupo: Grupo; titulo: string; detalle: string; desdeSem: number; hastaSem: number }
export interface HitoResultado extends Hito { estado: Estado; desde?: string; hasta?: string }
export interface Periodico { id: string; titulo: string; detalle: string }

export interface EntradaGuia {
  especie: string;
  nacimiento?: string;
  edadValor?: string | number;
  edadUnidad?: string;
}
export interface GuiaOk {
  ok: true;
  especie: Especie;
  edadSemanas: number;
  edadTexto: string;
  etapa: 'muy-pequeno' | 'cachorro' | 'joven' | 'adulto';
  etapaTexto: string;
  aproximada: boolean;
  hitos: HitoResultado[];
  periodicos: Periodico[];
  avisos: string[];
}
export type ResultadoGuia = GuiaOk | { ok: false; campo: 'especie' | 'edad'; error: string };

const DES: Hito[] = [
  { id: 'des-1', grupo: 'desparasitacion', titulo: 'Desparasitación interna, 1.ª dosis', detalle: 'Primera dosis, desde las 2 a 4 semanas de vida.', desdeSem: 2, hastaSem: 4 },
  { id: 'des-2', grupo: 'desparasitacion', titulo: 'Desparasitación interna, 2.ª dosis', detalle: 'Se repite cada 2 a 4 semanas hasta los 3 meses.', desdeSem: 5, hastaSem: 7 },
  { id: 'des-3', grupo: 'desparasitacion', titulo: 'Desparasitación interna, 3.ª dosis', detalle: 'Se repite cada 2 a 4 semanas hasta los 3 meses.', desdeSem: 8, hastaSem: 10 },
  { id: 'des-4', grupo: 'desparasitacion', titulo: 'Desparasitación interna, 4.ª dosis', detalle: 'Cierra la serie del cachorro o gatito; luego pasa a cada 3 a 6 meses.', desdeSem: 11, hastaSem: 13 },
];
const RABIA: Hito = { id: 'rabia', grupo: 'antirrabica', titulo: 'Vacuna antirrábica', detalle: 'Desde los 3 meses de edad, con refuerzo anual. Suele pedirse en trámites, viajes y campañas; confirma el requisito vigente con el médico (verificar).', desdeSem: 12, hastaSem: 16 };

const HITOS: Record<Especie, Hito[]> = {
  perro: [
    ...DES,
    { id: 'mul-1', grupo: 'vacuna', titulo: 'Vacuna múltiple, 1.ª dosis', detalle: 'Moquillo, parvovirus, hepatitis y otras, según la vacuna (quíntuple, séxtuple u óctuple).', desdeSem: 6, hastaSem: 8 },
    { id: 'mul-2', grupo: 'vacuna', titulo: 'Vacuna múltiple, 2.ª dosis', detalle: 'Refuerzo 3 a 4 semanas después de la anterior.', desdeSem: 9, hastaSem: 11 },
    { id: 'mul-3', grupo: 'vacuna', titulo: 'Vacuna múltiple, 3.ª dosis', detalle: 'Refuerzos cada 3 a 4 semanas hasta cerca de las 16 semanas.', desdeSem: 12, hastaSem: 16 },
    RABIA,
    { id: 'mul-ref', grupo: 'vacuna', titulo: 'Vacuna múltiple, refuerzo del primer año', detalle: 'Entre los 6 y los 12 meses; el médico fija el momento.', desdeSem: 26, hastaSem: 52 },
  ],
  gato: [
    ...DES,
    { id: 'tri-1', grupo: 'vacuna', titulo: 'Triple felina, 1.ª dosis', detalle: 'Panleucopenia, rinotraqueítis y calicivirus.', desdeSem: 8, hastaSem: 10 },
    { id: 'tri-2', grupo: 'vacuna', titulo: 'Triple felina, 2.ª dosis', detalle: 'Refuerzo a las 12 semanas aproximadamente.', desdeSem: 12, hastaSem: 14 },
    { id: 'tri-3', grupo: 'vacuna', titulo: 'Triple felina, 3.ª dosis', detalle: 'Refuerzo a las 16 semanas aproximadamente.', desdeSem: 16, hastaSem: 18 },
    RABIA,
    { id: 'tri-ref', grupo: 'vacuna', titulo: 'Triple felina, refuerzo del primer año', detalle: 'Entre los 6 y los 12 meses; el médico fija el momento.', desdeSem: 26, hastaSem: 52 },
  ],
};

const PERIODICOS: Record<Especie, Periodico[]> = {
  perro: [
    { id: 'p-anual', titulo: 'Cada año: refuerzo de la vacuna múltiple y de la antirrábica', detalle: 'La fecha exacta depende de la última dosis que figure en el carnet.' },
    { id: 'p-int', titulo: 'Desparasitación interna cada 3 a 6 meses', detalle: 'El intervalo y el producto los define el médico según peso y estilo de vida.' },
    { id: 'p-ext', titulo: 'Antipulgas y garrapatas, mensual o trimestral', detalle: 'Depende del producto y de la edad mínima que indique su fabricante.' },
    { id: 'p-riesgo', titulo: 'Según riesgo: tos de las perreras y otras', detalle: 'Si va a guardería, hospedaje o exposiciones, consulta si le corresponden.' },
  ],
  gato: [
    { id: 'p-anual', titulo: 'Cada año: refuerzo de la triple felina y de la antirrábica', detalle: 'La fecha exacta depende de la última dosis que figure en el carnet.' },
    { id: 'p-int', titulo: 'Desparasitación interna cada 3 a 6 meses', detalle: 'El intervalo y el producto los define el médico según peso y estilo de vida.' },
    { id: 'p-ext', titulo: 'Antipulgas y garrapatas, mensual o trimestral', detalle: 'Depende del producto y de la edad mínima que indique su fabricante.' },
    { id: 'p-riesgo', titulo: 'Según riesgo: leucemia felina', detalle: 'Se evalúa si el gato sale de casa o convive con otros gatos; el médico decide.' },
  ],
};

export const AVISO_REFERENCIAL =
  'Guía referencial. No es una receta ni un diagnóstico. El médico veterinario define el esquema según la mascota (peso, salud, antecedentes y vacunas previas). Verifica siempre en el carnet y con el médico.';

const DIA_MS = 86_400_000;
const ymdADias = (ymd: string) => { const [y, m, d] = ymd.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / DIA_MS); };
const UNIDADES = ['semanas', 'meses', 'anios'];

export function edadTextoDesdeDias(dias: number): string {
  const sem = Math.floor(dias / 7);
  if (dias < 14) return dias === 1 ? '1 día' : `${dias} días`;
  if (sem < 12) return `${sem} semanas`;
  const meses = Math.floor(dias / 30.4375);
  if (meses < 24) return meses === 1 ? '1 mes' : `${meses} meses`;
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  return `${anios} años${resto ? ` y ${resto} ${resto === 1 ? 'mes' : 'meses'}` : ''}`;
}

/** Edad en unidades que acepta la reserva (semanas hasta 12, meses hasta 35, luego años). */
export function edadParaReserva(semanas: number): { valor: number; unidad: UnidadEdad } {
  if (semanas <= 12) return { valor: Math.max(1, semanas), unidad: 'semanas' };
  const meses = Math.round(semanas / 4.345);
  if (meses <= 35) return { valor: meses, unidad: 'meses' };
  return { valor: Math.min(30, Math.max(1, Math.round(semanas / 52.18))), unidad: 'anios' };
}

export function generarGuia(entrada: EntradaGuia, ahora: Date): ResultadoGuia {
  if (entrada.especie !== 'perro' && entrada.especie !== 'gato') return { ok: false, campo: 'especie', error: 'Elige si tu mascota es perro o gato.' };
  const especie = entrada.especie as Especie;
  const hoy = partesLima(ahora).ymd;
  let dias: number;
  let aproximada: boolean;
  if (entrada.nacimiento) {
    if (!ymdValido(entrada.nacimiento)) return { ok: false, campo: 'edad', error: 'Escribe una fecha de nacimiento válida.' };
    if (entrada.nacimiento > hoy) return { ok: false, campo: 'edad', error: 'La fecha de nacimiento no puede ser futura.' };
    dias = ymdADias(hoy) - ymdADias(entrada.nacimiento);
    aproximada = false;
  } else {
    const n = Number(entrada.edadValor);
    if (entrada.edadValor === undefined || String(entrada.edadValor).trim() === '') return { ok: false, campo: 'edad', error: 'Escribe la edad o elige la fecha de nacimiento.' };
    if (!UNIDADES.includes(entrada.edadUnidad ?? '')) return { ok: false, campo: 'edad', error: 'Elige si la edad es en semanas, meses o años.' };
    if (!Number.isInteger(n) || n < 1) return { ok: false, campo: 'edad', error: 'Escribe un número entero mayor que cero.' };
    dias = entrada.edadUnidad === 'semanas' ? n * 7 : entrada.edadUnidad === 'meses' ? Math.round(n * 30.4375) : Math.round(n * 365.25);
    aproximada = true;
  }
  if (dias > 25 * 366) return { ok: false, campo: 'edad', error: 'Esa edad parece demasiado alta. Revisa el dato.' };

  const sem = dias / 7;
  const nacimientoYmd = entrada.nacimiento || sumarDias(hoy, -dias);
  const hitos: HitoResultado[] = HITOS[especie].map((h) => ({
    ...h,
    estado: sem < h.desdeSem ? 'proximo' : sem <= h.hastaSem + 0.999 ? 'ahora' : 'anterior',
    desde: sumarDias(nacimientoYmd, h.desdeSem * 7),
    hasta: sumarDias(nacimientoYmd, h.hastaSem * 7 + 6),
  }));

  const etapa = sem < 8 ? 'muy-pequeno' : sem < 17 ? 'cachorro' : sem < 52 ? 'joven' : 'adulto';
  const nombre = especie === 'perro' ? 'cachorro' : 'gatito';
  const etapaTexto = { 'muy-pequeno': `${nombre} muy pequeño`, cachorro: nombre, joven: `${especie} joven (menos de 1 año)`, adulto: `${especie} adulto` }[etapa];

  const avisos: string[] = [];
  if (dias < 14) avisos.push('A esta edad aún no corresponden vacunas. Si es huérfano o lo rescataste, tráelo a consulta para que el médico lo evalúe y te indique su alimentación y cuidados.');
  if (etapa === 'adulto' || etapa === 'joven') avisos.push('Si no tienes su carnet o no sabes qué vacunas recibió, el médico define cómo ponerlo al día. No repitas dosis por tu cuenta.');
  if (aproximada) avisos.push('Las fechas son aproximadas porque se calcularon con una edad estimada.');

  return {
    ok: true, especie, edadSemanas: Math.floor(sem), edadTexto: edadTextoDesdeDias(dias), etapa, etapaTexto, aproximada,
    hitos, periodicos: PERIODICOS[especie], avisos,
  };
}
