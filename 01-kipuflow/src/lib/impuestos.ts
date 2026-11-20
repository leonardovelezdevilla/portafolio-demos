// Cálculo REFERENCIAL de renta de 4.ª categoría (recibos por honorarios). Ver DECISIONES.md.

// UIT 2026 = S/ 5 500 (DS 301-2025-EF según prensa). Verificar valor oficial en sunat.gob.pe antes de usar fuera de la demo.
export const UIT_2026 = 5500;
export const UMBRAL_RETENCION = 1500; // el recibo debe SUPERAR este monto
export const TASA_RETENCION = 0.08;
export const TASA_DEDUCCION = 0.2;
export const TOPE_DEDUCCION_UIT = 24;
export const DEDUCCION_FIJA_UIT = 7;

/** Tramos de la escala progresiva (sobre renta neta de trabajo anual), en UIT. */
export const ESCALA = [
  { hasta: 5, tasa: 0.08 },
  { hasta: 20, tasa: 0.14 },
  { hasta: 35, tasa: 0.17 },
  { hasta: 45, tasa: 0.2 },
  { hasta: Infinity, tasa: 0.3 },
] as const;

export interface Entrada {
  ingresoMensual: number; // soles brutos por mes
  recibosPorMes: number; // cantidad de recibos emitidos por mes (≥1)
  uit?: number;
}

export interface Tramo { desde: number; hasta: number; base: number; tasa: number; impuesto: number }

export interface Resultado {
  ingresoAnual: number;
  montoPorRecibo: number;
  seRetiene: boolean;
  retencionMensual: number;
  retencionAnual: number;
  deduccion20: number;
  deduccionFija: number;
  rentaNeta: number;
  tramos: Tramo[];
  impuestoAnual: number;
  saldo: number; // >0 por pagar; <0 a favor
  tasaEfectiva: number;
  netoMensualEstimado: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function calcular({ ingresoMensual, recibosPorMes, uit = UIT_2026 }: Entrada): Resultado {
  const ing = Math.max(0, Number.isFinite(ingresoMensual) ? ingresoMensual : 0);
  const n = Math.max(1, Math.floor(recibosPorMes) || 1);
  const montoPorRecibo = ing / n;
  const seRetiene = montoPorRecibo > UMBRAL_RETENCION;
  const retencionMensual = seRetiene ? ing * TASA_RETENCION : 0;
  const retencionAnual = retencionMensual * 12;

  const ingresoAnual = ing * 12;
  const deduccion20 = Math.min(ingresoAnual * TASA_DEDUCCION, TOPE_DEDUCCION_UIT * uit);
  const deduccionFija = DEDUCCION_FIJA_UIT * uit;
  const rentaNeta = Math.max(0, ingresoAnual - deduccion20 - deduccionFija);

  const tramos: Tramo[] = [];
  let previo = 0;
  let impuestoAnual = 0;
  for (const t of ESCALA) {
    const limite = t.hasta * uit;
    const base = Math.max(0, Math.min(rentaNeta, limite) - previo);
    if (base > 0) {
      const impuesto = base * t.tasa;
      impuestoAnual += impuesto;
      tramos.push({ desde: previo, hasta: limite, base: r2(base), tasa: t.tasa, impuesto: r2(impuesto) });
    }
    previo = limite;
  }
  impuestoAnual = r2(impuestoAnual);
  const saldo = r2(impuestoAnual - retencionAnual);
  return {
    ingresoAnual: r2(ingresoAnual),
    montoPorRecibo: r2(montoPorRecibo),
    seRetiene,
    retencionMensual: r2(retencionMensual),
    retencionAnual: r2(retencionAnual),
    deduccion20: r2(deduccion20),
    deduccionFija: r2(deduccionFija),
    rentaNeta: r2(rentaNeta),
    tramos,
    impuestoAnual,
    saldo,
    tasaEfectiva: ingresoAnual > 0 ? impuestoAnual / ingresoAnual : 0,
    netoMensualEstimado: r2(ing - impuestoAnual / 12),
  };
}
