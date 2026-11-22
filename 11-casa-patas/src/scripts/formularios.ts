/** Muestra errores de validación accesibles: aria-invalid + mensaje asociado por aria-describedby. Devuelve el primer control inválido. */
export function mostrarErrores(form: HTMLElement, errores: Record<string, string | undefined>): HTMLElement | null {
  let primero: HTMLElement | null = null;
  form.querySelectorAll<HTMLElement>('[data-error]').forEach((p) => {
    const campo = p.dataset.error!;
    const msg = errores[campo];
    const controles = form.querySelectorAll<HTMLElement>(`[name="${campo}"]`);
    if (msg) {
      p.textContent = msg;
      p.hidden = false;
      controles.forEach((c) => c.setAttribute('aria-invalid', 'true'));
      if (!primero && controles[0]) primero = controles[0];
    } else {
      p.textContent = '';
      p.hidden = true;
      controles.forEach((c) => c.removeAttribute('aria-invalid'));
    }
  });
  return primero;
}

export function leerForm(form: HTMLFormElement): Record<string, string> {
  const out: Record<string, string> = {};
  new FormData(form).forEach((v, k) => {
    out[k] = typeof v === 'string' ? v : '';
  });
  return out;
}

const nombreCampo = (form: HTMLElement, control: HTMLElement): string => {
  const id = control.id;
  const lab = id ? form.querySelector<HTMLElement>(`label[for="${id}"]`) : null;
  if (control.getAttribute('type') === 'checkbox') return 'Consentimiento';
  const leyenda = control.closest('fieldset')?.querySelector('legend');
  const t = (lab ?? leyenda)?.textContent ?? control.getAttribute('name') ?? 'Campo';
  return t.replace(/\s*\((obligatorio|opcional)\)\s*/i, '').replace(/\s+/g, ' ').trim();
};

/** Resumen de errores con un botón-enlace a cada campo. No es una región en vivo: el foco va al primer campo inválido y cada campo se describe con aria-describedby. */
export function pintarResumen(form: HTMLElement, caja: HTMLElement, errores: Record<string, string | undefined>) {
  const items = Object.entries(errores).filter(([, m]) => m);
  if (!items.length) {
    caja.hidden = true;
    caja.replaceChildren();
    return;
  }
  const t = document.createElement('p');
  t.textContent = `Hay ${items.length} ${items.length === 1 ? 'dato por corregir' : 'datos por corregir'}:`;
  const ul = document.createElement('ul');
  for (const [campo, msg] of items) {
    const c = form.querySelector<HTMLElement>(`[name="${campo}"]`);
    const li = document.createElement('li');
    li.dataset.campo = campo;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'enlace';
    b.textContent = `${c ? nombreCampo(form, c) : campo}: ${msg}`;
    b.addEventListener('click', () => c?.focus());
    li.append(b);
    ul.append(li);
  }
  caja.replaceChildren(t, ul);
  caja.tabIndex = -1;
  caja.hidden = false;
}

/** Al corregir un campo, quita su línea del resumen (y oculta el resumen cuando queda vacío). */
export function quitarDelResumen(caja: HTMLElement, campo: string) {
  if (caja.hidden) return;
  caja.querySelector(`li[data-campo="${campo}"]`)?.remove();
  const n = caja.querySelectorAll('li').length;
  if (!n) {
    caja.hidden = true;
    caja.replaceChildren();
  } else {
    const p = caja.querySelector('p');
    if (p) p.textContent = `Hay ${n} ${n === 1 ? 'dato por corregir' : 'datos por corregir'}:`;
  }
}

