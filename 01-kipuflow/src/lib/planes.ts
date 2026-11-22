/** Planes de demo (precios en S/ con IGV incluido). mensual = mes a mes; anualMes = equivalente mensual pagando el año. */
export const PLANES = [
  { id: 'esencial', nombre: 'Esencial', para: 'Si recién emites tus primeros recibos.', mensual: 19, anualMes: 15, items: ['Hasta 30 recibos al mes', 'Cálculo de retención', 'Recordatorios de pagos a cuenta'] },
  { id: 'pro', nombre: 'Pro', para: 'Para quien vive de sus honorarios.', mensual: 39, anualMes: 31, destacado: true, items: ['Recibos sin límite', 'Gastos con categorías', 'Reportes y proyección anual', 'Exportación para contador'] },
  { id: 'estudio', nombre: 'Estudio', para: 'Dos o tres socios compartiendo cuenta.', mensual: 79, anualMes: 63, items: ['Hasta 3 personas', 'Todo lo de Pro', 'Reportes por cliente y por socio', 'Soporte prioritario'] },
];
export type Periodo = 'mensual' | 'anual';
/** Lo que se cobra hoy: un mes, o el año completo. */
export const cobroHoy = (id: string, periodo: Periodo) => {
  const p = PLANES.find((x) => x.id === id);
  return p ? (periodo === 'anual' ? p.anualMes * 12 : p.mensual) : 0;
};
