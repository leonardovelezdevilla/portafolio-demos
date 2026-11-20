/** Rellena un resumen de errores con nodos DOM (sin innerHTML). Cada elemento enfoca su campo. */
export function pintarResumen(caja: HTMLElement, errores: { msg: string; enfocar: () => void }[]): void {
  caja.replaceChildren();
  const h = document.createElement('h3');
  h.tabIndex = -1;
  h.textContent = `Hay ${errores.length} dato${errores.length > 1 ? 's' : ''} por corregir`;
  const ul = document.createElement('ul');
  for (const e of errores) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'enlace-btn';
    b.textContent = e.msg;
    b.addEventListener('click', e.enfocar);
    li.append(b);
    ul.append(li);
  }
  caja.append(h, ul);
  caja.hidden = false;
}
