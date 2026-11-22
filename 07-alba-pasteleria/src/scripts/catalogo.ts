const form = document.querySelector<HTMLFormElement>('[data-filtros]');
const grilla = document.querySelector<HTMLElement>('[data-grilla]');
const estado = document.querySelector<HTMLElement>('[data-estado]');
const vacio = document.querySelector<HTMLElement>('[data-vacio]');

if (form && grilla && estado && vacio) {
  const items = [...grilla.querySelectorAll<HTMLElement>(':scope > li')];
  const limpiar = form.querySelector<HTMLButtonElement>('[data-limpiar]')!;
  const campos = ['ocasion', 'sabor', 'porciones'] as const;

  const aplicar = (anunciar: boolean) => {
    const v = Object.fromEntries(campos.map((c) => [c, (form.elements.namedItem(c) as HTMLSelectElement).value]));
    let visibles = 0;
    for (const li of items) {
      const ok =
        (!v.ocasion || (li.dataset.ocasiones ?? '').split(' ').includes(v.ocasion)) &&
        (!v.sabor || li.dataset.sabor === v.sabor) &&
        (!v.porciones || li.dataset.rango === v.porciones);
      li.hidden = !ok;
      if (ok) visibles++;
    }
    const hay = campos.some((c) => v[c]);
    limpiar.hidden = !hay;
    vacio.hidden = visibles > 0;
    if (anunciar || hay) {
      estado.textContent = visibles === 0 ? 'No hay tortas con esos filtros.' : `Mostrando ${visibles} de ${items.length} tortas.`;
    } else {
      estado.textContent = `Mostrando las ${items.length} tortas.`;
    }
    const url = new URL(location.href);
    campos.forEach((c) => (v[c] ? url.searchParams.set(c, v[c]) : url.searchParams.delete(c)));
    history.replaceState(null, '', url);
  };

  const params = new URL(location.href).searchParams;
  campos.forEach((c) => {
    const sel = form.elements.namedItem(c) as HTMLSelectElement;
    const val = params.get(c);
    if (val && [...sel.options].some((o) => o.value === val)) sel.value = val;
  });
  aplicar(false);

  form.addEventListener('change', () => aplicar(true));
  const reset = () => {
    form.reset();
    aplicar(true);
    (form.elements.namedItem('ocasion') as HTMLElement).focus();
  };
  limpiar.addEventListener('click', reset);
  vacio.querySelector('[data-limpiar-vacio]')!.addEventListener('click', reset);
  form.addEventListener('submit', (e) => e.preventDefault());
}
