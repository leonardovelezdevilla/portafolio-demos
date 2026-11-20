import { coincide, escribirParams, leerParams, type Filtro } from '../lib/filtros';
import type { Categoria } from '../data/productos';

const raiz = document.querySelector<HTMLElement>('[data-catalogo]');

if (raiz) {
  const controles = raiz.querySelector<HTMLElement>('[data-controles]')!;
  const tarjetas = Array.from(raiz.querySelectorAll<HTMLElement>('[data-producto]'));
  const estado = raiz.querySelector<HTMLElement>('[data-estado]')!;
  const vacio = raiz.querySelector<HTMLElement>('[data-vacio-filtro]')!;
  const lista = raiz.querySelector<HTMLElement>('[data-lista]')!;
  const btnCat = Array.from(raiz.querySelectorAll<HTMLButtonElement>('[data-cat]'));
  const btnTalla = Array.from(raiz.querySelectorAll<HTMLButtonElement>('[data-talla]'));
  const btnLimpiar = raiz.querySelectorAll<HTMLButtonElement>('[data-limpiar]');
  const btnCopiar = raiz.querySelector<HTMLButtonElement>('[data-copiar]')!;
  const nombresCat: Record<string, string> = { running: 'Running', urbana: 'Urbana', skate: 'Skate', basquet: 'Básquet' };

  let filtro: Filtro = leerParams(location.search);

  const datosTarjeta = (el: HTMLElement) => {
    const tallas: Record<number, number> = {};
    (el.dataset.tallas || '').split(',').filter(Boolean).forEach((t) => (tallas[Number(t)] = 1));
    return { categoria: el.dataset.categoria as Categoria, tallas };
  };

  function aplicar(actualizarUrl: boolean) {
    let n = 0;
    tarjetas.forEach((el) => {
      const ok = coincide(datosTarjeta(el), filtro);
      el.hidden = !ok;
      if (ok) n++;
      const tt = el.querySelector<HTMLElement>('[data-tallas-texto]');
      if (tt) tt.textContent = filtro.talla ? `Talla EU ${filtro.talla}: disponible` : `Tallas EU: ${tt.dataset.lista}`;
    });
    btnCat.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.cat || '') === (filtro.categoria ?? ''))));
    btnTalla.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.talla || '') === (filtro.talla ? String(filtro.talla) : ''))));
    const partes: string[] = [];
    if (filtro.categoria) partes.push(nombresCat[filtro.categoria]);
    if (filtro.talla) partes.push(`talla EU ${filtro.talla}`);
    const desc = partes.length ? ` (${partes.join(', ')})` : '';
    estado.textContent =
      n === 0
        ? `Ningún modelo coincide${desc}.`
        : `Mostrando ${n} de ${tarjetas.length} ${tarjetas.length === 1 ? 'modelo' : 'modelos'}${desc}.`;
    vacio.hidden = n !== 0;
    lista.hidden = n === 0;
    btnLimpiar.forEach((b) => b.toggleAttribute('data-activo', Boolean(filtro.categoria || filtro.talla)));
    if (actualizarUrl) {
      try {
        history.replaceState(null, '', `${location.pathname}${escribirParams(filtro)}${location.hash}`);
      } catch {
        /* sin historial: el filtro sigue funcionando */
      }
    }
  }

  controles.hidden = false;

  btnCat.forEach((b) =>
    b.addEventListener('click', () => {
      filtro = { ...filtro, categoria: (b.dataset.cat || null) as Categoria | null };
      aplicar(true);
    }),
  );
  btnTalla.forEach((b) =>
    b.addEventListener('click', () => {
      filtro = { ...filtro, talla: b.dataset.talla ? Number(b.dataset.talla) : null };
      aplicar(true);
    }),
  );
  btnLimpiar.forEach((b) =>
    b.addEventListener('click', () => {
      filtro = { categoria: null, talla: null };
      aplicar(true);
      btnCat[0]?.focus();
    }),
  );
  btnCopiar.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}${escribirParams(filtro)}#catalogo`;
    let msg = 'Enlace copiado.';
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      msg = 'No se pudo copiar. Copia la dirección desde la barra del navegador.';
    }
    const t = raiz.querySelector<HTMLElement>('[data-copiado]')!;
    t.textContent = '';
    window.setTimeout(() => (t.textContent = msg), 30);
    window.setTimeout(() => (t.textContent = ''), 6000);
  });

  aplicar(false);
}
