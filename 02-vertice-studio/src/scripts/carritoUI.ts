import {
  agregar, cambiarCantidad, cargar, ENVIO, formatoSoles, guardar, quitar, stockDe, totales, totalUnidades,
  type Linea, type Zona,
} from '../lib/carrito';
import { armarMensaje, urlWhatsApp } from '../lib/whatsapp';
import { validarPedido } from '../lib/validacion';
import { abrirModal, cerrarModal, iniciarModal } from './dialogos';
import { leerForm, mostrarErrores } from './formularios';

interface ProductoTienda {
  slug: string; nombre: string; categoria: string; precio: number;
  tallas: Record<number, number>; mini: string; medio: string; alt: string;
  colores: { nombre: string; hex: string }[]; resumen: string;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const datosEl = document.getElementById('datos-tienda');
const catalogo: ProductoTienda[] = datosEl ? JSON.parse(datosEl.textContent || '[]') : [];
const dlg = document.getElementById('carrito') as HTMLDialogElement | null;

if (dlg && catalogo.length) {
  const $ = <T extends HTMLElement>(s: string) => dlg.querySelector<T>(s)!;
  const elLineas = $('[data-lineas]');
  const elVacio = $('[data-vacio]');
  const elContenido = $('[data-contenido]');
  const elConfirmacion = $('[data-confirmacion]');
  const elAnuncio = $('[data-anuncio]');
  const elAviso = $('[data-aviso-envio]');
  const elResumenErr = $('[data-resumen-errores]');
  const form = $<HTMLFormElement>('[data-form-pedido]');
  const titulo = $('#carrito-titulo');
  titulo.tabIndex = -1;
  const botones = document.querySelectorAll<HTMLElement>('[data-abrir-carrito]');
  const conteo = document.querySelectorAll<HTMLElement>('[data-conteo-carrito]');
  const conteoTexto = document.querySelectorAll<HTMLElement>('[data-conteo-texto]');
  const toast = document.querySelector<HTMLElement>('[data-toast]')!;
  const toastTexto = toast.querySelector<HTMLElement>('[data-toast-texto]')!;
  let toastTimer = 0;
  let confirmando = false;

  let lineas: Linea[] = cargar(catalogo);
  const zona = (): Zona => (dlg.querySelector<HTMLInputElement>('input[name="zona"]:checked')?.value as Zona) || 'lima';
  const anunciar = (t: string) => {
    elAnuncio.textContent = '';
    window.setTimeout(() => (elAnuncio.textContent = t), 30);
  };
  const prod = (slug: string) => catalogo.find((p) => p.slug === slug)!;
  const persistir = () => void guardar(lineas);
  const resumenTotal = () => {
    const t = totales(lineas, catalogo, zona());
    return `Subtotal ${formatoSoles(t.subtotal)}, envío ${t.envio === 0 ? 'gratis' : formatoSoles(t.envio)}, total ${formatoSoles(t.total)}.`;
  };

  function render() {
    const n = totalUnidades(lineas);
    botones.forEach((b) => (b.hidden = false));
    conteo.forEach((c) => (c.textContent = String(n)));
    conteoTexto.forEach((c) => (c.textContent = `, ${n} ${n === 1 ? 'producto' : 'productos'}`));
    elVacio.hidden = n > 0 || confirmando;
    elContenido.hidden = n === 0 || confirmando;
    elConfirmacion.hidden = !confirmando;
    elLineas.innerHTML = lineas
      .map((l) => {
        const p = prod(l.slug);
        const max = stockDe(catalogo, l.slug, l.talla);
        const k = `${l.slug}|${l.talla}`;
        return `<li class="linea">
          <img src="${esc(p.mini)}" alt="" width="72" height="90" />
          <div>
            <p class="linea__nombre">${esc(p.nombre)}</p>
            <p class="linea__meta">Talla EU ${l.talla} · ${formatoSoles(p.precio)} c/u${l.cantidad >= max ? ' · máximo en stock' : ''}</p>
            <div class="linea__acciones">
              <div class="cantidad" role="group" aria-label="Cantidad de ${esc(p.nombre)} talla ${l.talla}">
                <button type="button" data-accion="menos" data-key="${k}" aria-label="Disminuir cantidad" ${l.cantidad <= 1 ? 'disabled' : ''}>${ICONOS.menos}</button>
                <output>${l.cantidad}</output>
                <button type="button" data-accion="mas" data-key="${k}" aria-label="Aumentar cantidad" ${l.cantidad >= max ? 'disabled' : ''}>${ICONOS.mas}</button>
              </div>
              <button type="button" class="btn-texto" data-accion="quitar" data-key="${k}" aria-label="Quitar ${esc(p.nombre)} talla ${l.talla}">${ICONOS.basura} Quitar</button>
              <span class="linea__precio">${formatoSoles(p.precio * l.cantidad)}</span>
            </div>
          </div>
        </li>`;
      })
      .join('');

    const z = zona();
    const t = totales(lineas, catalogo, z);
    $('[data-subtotal]').textContent = formatoSoles(t.subtotal);
    $('[data-envio]').textContent = t.envio === 0 && t.subtotal > 0 ? 'Gratis' : formatoSoles(t.envio);
    $('[data-total]').textContent = formatoSoles(t.total);
    const falta = ENVIO[z].gratisDesde - t.subtotal;
    elAviso.textContent =
      t.subtotal === 0
        ? ''
        : falta > 0
          ? `Te faltan ${formatoSoles(falta)} para envío gratis en ${ENVIO[z].etiqueta}.`
          : `Envío gratis en ${ENVIO[z].etiqueta}.`;
    elAviso.hidden = t.subtotal === 0;
  }

  function abrir(origen?: HTMLElement | null) {
    render();
    abrirModal(dlg!, origen);
  }

  function mostrarToast(texto: string) {
    toastTexto.textContent = '';
    window.setTimeout(() => (toastTexto.textContent = texto), 30);
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => (toast.hidden = true), 8000);
  }

  function agregarAlCarrito(slug: string, talla: number) {
    const antes = totalUnidades(lineas);
    lineas = agregar(lineas, catalogo, slug, talla, 1);
    persistir();
    confirmando = false;
    render();
    const p = prod(slug);
    const agregado = totalUnidades(lineas) > antes;
    mostrarToast(
      agregado
        ? `${p.nombre}, talla ${talla}, agregado. Llevas ${totalUnidades(lineas)} en el carrito.`
        : `No hay más stock de ${p.nombre} en talla ${talla}.`,
    );
  }

  const ICONOS = {
    mas: '<svg class="icono" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
    menos: '<svg class="icono" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"/></svg>',
    basura: '<svg class="icono" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  };

  iniciarModal(dlg);

  botones.forEach((b) => b.addEventListener('click', () => abrir(b)));
  dlg.querySelectorAll('[data-cerrar-carrito]').forEach((b) => b.addEventListener('click', () => cerrarModal(dlg)));
  toast.querySelector('[data-toast-ver]')!.addEventListener('click', () => {
    toast.hidden = true;
    abrir(toast.querySelector<HTMLElement>('[data-toast-ver]'));
  });
  toast.querySelector('[data-toast-cerrar]')!.addEventListener('click', () => (toast.hidden = true));

  dlg.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-accion]');
    if (!b) return;
    const [slug, t] = b.dataset.key!.split('|');
    const talla = Number(t);
    const actual = lineas.find((l) => l.slug === slug && l.talla === talla);
    if (!actual) return;
    const p = prod(slug);
    if (b.dataset.accion === 'mas') lineas = cambiarCantidad(lineas, catalogo, slug, talla, actual.cantidad + 1);
    if (b.dataset.accion === 'menos') lineas = cambiarCantidad(lineas, catalogo, slug, talla, actual.cantidad - 1);
    if (b.dataset.accion === 'quitar') lineas = quitar(lineas, slug, talla);
    persistir();
    render();
    const quedo = lineas.find((l) => l.slug === slug && l.talla === talla);
    if (!quedo) {
      anunciar(`${p.nombre}, talla ${talla}, quitado del carrito. ${lineas.length ? resumenTotal() : 'El carrito quedó vacío.'}`);
      (lineas.length ? dlg.querySelector<HTMLElement>('[data-accion="mas"]') : titulo)?.focus();
    } else {
      anunciar(`${p.nombre}, talla ${talla}: ${quedo.cantidad} ${quedo.cantidad === 1 ? 'unidad' : 'unidades'}. ${resumenTotal()}`);
      let destino = dlg.querySelector<HTMLElement>(`[data-accion="${b.dataset.accion}"][data-key="${b.dataset.key}"]:not([disabled])`);
      destino ??= dlg.querySelector<HTMLElement>(`[data-accion="mas"][data-key="${b.dataset.key}"]:not([disabled])`) ?? dlg.querySelector<HTMLElement>(`[data-accion="quitar"][data-key="${b.dataset.key}"]`);
      destino?.focus();
    }
  });

  dlg.querySelectorAll('input[name="zona"]').forEach((r) =>
    r.addEventListener('change', () => {
      render();
      anunciar(`Envío a ${ENVIO[zona()].etiqueta}. ${resumenTotal()}`);
    }),
  );

  // Limpia el error de un campo al corregirlo.
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name) {
      const p = form.querySelector<HTMLElement>(`[data-error="${t.name}"]`);
      if (p) {
        p.hidden = true;
        form.querySelectorAll(`[name="${t.name}"]`).forEach((c) => c.removeAttribute('aria-invalid'));
      }
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!lineas.length) {
      anunciar('Tu carrito está vacío.');
      return;
    }
    const datos = leerForm(form);
    const errores = validarPedido({
      nombre: datos.nombre ?? '', distrito: datos.distrito ?? '', referencia: datos.referencia ?? '',
      pago: datos.pago ?? '', acepta: datos.acepta ?? '',
    });
    const primero = mostrarErrores(form, errores);
    const n = Object.keys(errores).length;
    elResumenErr.hidden = n === 0;
    elResumenErr.textContent = n ? `Revisa ${n} ${n === 1 ? 'campo' : 'campos'} antes de enviar el pedido.` : '';
    if (primero) {
      primero.focus();
      return;
    }
    const url = urlWhatsApp(
      armarMensaje({ nombre: datos.nombre, distrito: datos.distrito, referencia: datos.referencia, pago: datos.pago }, lineas, catalogo, zona()),
    );
    $<HTMLAnchorElement>('[data-enlace-wa]').href = url;
    window.open(url, '_blank', 'noopener');
    confirmando = true;
    render();
    elConfirmacion.focus();
  });

  $('[data-volver-carrito]').addEventListener('click', () => {
    confirmando = false;
    render();
    titulo.focus();
  });
  $('[data-vaciar]').addEventListener('click', () => {
    lineas = [];
    persistir();
    confirmando = false;
    form.reset();
    render();
    anunciar('Carrito vaciado.');
    titulo.focus();
  });

  document.addEventListener('vertice:agregar', (e) => {
    const d = (e as CustomEvent<{ slug: string; talla: number }>).detail;
    agregarAlCarrito(d.slug, d.talla);
  });

  // Sincroniza entre pestañas.
  window.addEventListener('storage', (e) => {
    if (e.key === null || e.key.startsWith('vertice-carrito')) {
      lineas = cargar(catalogo);
      render();
    }
  });

  render();
}
