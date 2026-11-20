import { CIERRES, HORARIO, partesLima } from '../lib/fechas';

/** Indica si la clínica está abierta ahora, en hora de Lima. Solo texto; sin avisos en vivo. */
const el = document.querySelector<HTMLElement>('[data-ahora]');
const p = partesLima(new Date());
const h = HORARIO[p.dow];
const abierto = !CIERRES[p.ymd] && p.hhmm >= h.abre && p.hhmm < h.cierra;
if (el) {
  if (CIERRES[p.ymd]) el.textContent = `Hoy cerramos por feriado (${CIERRES[p.ymd]}).`;
  else if (abierto) el.textContent = `Ahora estamos abiertos, hasta las ${h.cierra.replace(/^0/, '')}.`;
  else el.textContent = 'Ahora estamos cerrados. Para una urgencia, ve a una clínica con atención 24 horas.';
}
// Si estamos cerrados: aviso arriba de la banda y el botón pasa a ser una consulta para cuando abramos.
if (!abierto) {
  document.querySelector<HTMLElement>('[data-cerrado]')?.removeAttribute('hidden');
  const b = document.querySelector<HTMLAnchorElement>('[data-wa-urgencia]');
  if (b?.dataset.waCerrado) {
    b.href = b.dataset.waCerrado;
    const t = b.querySelector('[data-wa-texto]');
    if (t) t.textContent = 'Escribirnos (respondemos al abrir)';
  }
}
