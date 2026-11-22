/** Configurador en pasos: muestra un panel a la vez. Sin JS, todos los paneles quedan visibles. */
const form = document.querySelector<HTMLFormElement>('[data-config]');
const nav = form?.querySelector<HTMLElement>('[data-wiz-nav]');
const paneles = form ? [...form.querySelectorAll<HTMLElement>('[data-wiz-panel]')] : [];

if (form && nav && paneles.length) {
  const total = paneles.length;
  const titulos = paneles.map((p) => p.dataset.wizTitulo ?? '');
  let actual = 0;

  const ol = document.createElement('ol');
  ol.className = 'wiz-nav__lista';
  const botones = titulos.map((t, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'wiz-nav__btn';
    const n = document.createElement('span');
    n.className = 'wiz-nav__n';
    n.setAttribute('aria-hidden', 'true');
    n.textContent = String(i + 1);
    const tx = document.createElement('span');
    tx.textContent = t;
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = `Paso ${i + 1} de ${total}: `;
    b.append(sr, n, tx);
    b.addEventListener('click', () => ir(i, true));
    li.append(b);
    ol.append(li);
    return b;
  });
  nav.append(ol);
  nav.hidden = false;
  form.classList.add('wiz-on');

  paneles.forEach((p, i) => {
    const acc = document.createElement('div');
    acc.className = 'wiz__acc';
    if (i > 0) {
      const a = document.createElement('button');
      a.type = 'button';
      a.className = 'btn';
      a.textContent = 'Atrás';
      a.addEventListener('click', () => ir(i - 1, true));
      acc.append(a);
    }
    if (i < total - 1) {
      const s = document.createElement('button');
      s.type = 'button';
      s.className = 'btn btn--primario';
      s.textContent = `Siguiente: ${titulos[i + 1].toLowerCase()}`;
      s.addEventListener('click', () => ir(i + 1, true));
      acc.append(s);
    }
    if (acc.children.length) p.append(acc);
  });

  function ir(i: number, enfocar: boolean) {
    actual = Math.max(0, Math.min(total - 1, i));
    paneles.forEach((p, k) => { p.hidden = k !== actual; });
    botones.forEach((b, k) => {
      if (k === actual) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
      b.classList.toggle('wiz-nav__btn--hecho', k < actual);
    });
    if (enfocar) {
      if (nav!.getBoundingClientRect().top < 70) nav!.scrollIntoView({ block: 'start', behavior: 'auto' });
      paneles[actual].querySelector<HTMLElement>('h3')?.focus({ preventScroll: true });
    }
  }

  // Al enviar se muestran todos los pasos para que el foco llegue al primer error; luego se vuelve al paso de ese campo.
  form.addEventListener('submit', () => {
    paneles.forEach((p) => { p.hidden = false; });
    window.setTimeout(() => {
      if (form.hidden) return;
      const k = paneles.findIndex((p) => p.contains(document.activeElement));
      ir(k >= 0 ? k : total - 1, false);
      (document.activeElement as HTMLElement | null)?.scrollIntoView({ block: 'center', behavior: 'auto' });
    }, 0);
  }, true);

  // Los enlaces del resumen de errores abren el paso donde está el campo.
  form.querySelector<HTMLElement>('[data-resumen-errores]')?.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-campo]');
    const c = li ? form.querySelector<HTMLElement>(`[name="${li.dataset.campo}"]`) : null;
    const k = c ? paneles.findIndex((p) => p.contains(c)) : -1;
    if (k >= 0) ir(k, false);
  }, true);

  // Desde el catálogo se empieza por el primer paso; «Empezar otra torta» también.
  document.querySelectorAll('[data-personalizar]').forEach((a) => a.addEventListener('click', () => ir(0, false)));
  document.querySelector('[data-nuevo]')?.addEventListener('click', () => ir(0, false));

  ir(0, false);
}
