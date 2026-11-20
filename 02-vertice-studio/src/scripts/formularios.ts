/** Muestra errores de validación accesibles: aria-invalid + mensaje con role="alert". */
export function mostrarErrores(form: HTMLFormElement, errores: Record<string, string | undefined>): HTMLElement | null {
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
  const fd = new FormData(form);
  const out: Record<string, string> = {};
  fd.forEach((v, k) => {
    out[k] = typeof v === 'string' ? v : '';
  });
  return out;
}
