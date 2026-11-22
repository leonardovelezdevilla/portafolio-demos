import { TAMANOS, MENSAJE_MAX, ALERGENOS } from '../lib/config';
import { productos } from '../data/productos';
import { RECARGO_2_PISOS } from '../lib/distritos';
import {
  alergenosTorta, dosPisos, efectoPorPorcion, formatoSoles, precioDecoracion, presupuestoTorta, validarMensaje, type Seleccion,
} from '../lib/precio';
import {
  etiquetaFecha, etiquetaMin, horasDisponibles, primerDiaDisponible, proximasFechas, ultimoDiaPermitido, validarEntrega,
} from '../lib/fechas';
import { numeroPedido, validarPedido, type DatosPedido } from '../lib/validacion';
import { armarMensaje, totalesPedido, urlWhatsApp } from '../lib/whatsapp';
import { leerForm, mostrarErrores, pintarResumen as pintarResumenErrores, quitarDelResumen } from './formularios';

const form = document.querySelector<HTMLFormElement>('[data-config]');
const ok = document.querySelector<HTMLElement>('[data-confirmacion]');
if (form && ok) iniciar(form, ok);

function iniciar(form: HTMLFormElement, ok: HTMLElement) {
  const q = <T extends HTMLElement>(s: string) => form.querySelector<T>(s)!;
  const lineas = q<HTMLElement>('[data-lineas]');
  const total = q<HTMLElement>('[data-total]');
  const alerg = q<HTMLElement>('[data-alergenos]');
  const anuncio = q<HTMLElement>('[data-anuncio]');
  const barra = q<HTMLElement>('[data-total-barra]');
  const barraEnvio = q<HTMLElement>('[data-barra-envio]');
  const barraAler = q<HTMLElement>('[data-barra-aler]');
  const barraEl = q<HTMLElement>('.barra-total');
  const minTxt = q<HTMLElement>('[data-min]');
  const contador = q<HTMLElement>('[data-contador-wrap]');
  const limite = q<HTMLElement>('[data-limite]');
  const fecha = q<HTMLInputElement>('#fecha');
  const hora = q<HTMLSelectElement>('#hora');
  const bloqueDelivery = q<HTMLElement>('[data-bloque-delivery]');
  const resumenErr = q<HTMLElement>('[data-resumen-errores]');
  const ayudaFecha = q<HTMLElement>('[data-ayuda-fecha]');
  const ayudaHora = q<HTMLElement>('[data-ayuda-hora]');
  const etqFecha = q<HTMLElement>('[data-etq-fecha]');
  const etqHora = q<HTMLElement>('[data-etq-hora]');
  const avisoDelivery = q<HTMLElement>('[data-aviso-delivery]');
  const sugerencias = q<HTMLElement>('[data-sugerencias]');
  const sugBotones = q<HTMLElement>('[data-sug-botones]');
  const AYUDA_HORA = 'Mar a sáb de 9:00 a 19:00; domingo de 9:00 a 14:00.';
  let temporizador = 0;

  /** Un único anuncio a lectores de pantalla, con retardo para no repetir en cada pulsación. */
  const anunciar = (msg: string) => {
    window.clearTimeout(temporizador);
    temporizador = window.setTimeout(() => { anuncio.textContent = msg; }, 700);
  };

  const val = (n: string) => (form.elements.namedItem(n) as RadioNodeList | HTMLInputElement).value ?? '';
  const seleccion = (): Seleccion => ({
    tamano: val('tamano'),
    bizcocho: val('bizcocho'),
    relleno: val('relleno'),
    cobertura: val('cobertura'),
    decoraciones: [...form.querySelectorAll<HTMLInputElement>('input[name="decoracion"]:checked')].map((i) => i.value),
    mensaje: val('mensaje'),
  });
  const datos = (): DatosPedido => {
    const d = leerForm(form);
    return {
      nombre: d.nombre ?? '', entrega: d.entrega ?? '', distrito: d.distrito ?? '', direccion: d.direccion ?? '',
      fecha: d.fecha ?? '', hora: d.hora ?? '', mensaje: d.mensaje ?? '', notas: d.notas ?? '', acepta: d.acepta ?? '',
    };
  };
  const esDelivery = () => val('entrega') === 'delivery';

  const fila = (dt: string, dd: string) => {
    const d = document.createElement('div');
    const a = document.createElement('dt');
    const b = document.createElement('dd');
    a.textContent = dt;
    b.textContent = dd;
    d.append(a, b);
    return d;
  };

  /** Efecto de cada extra sobre el tamaño elegido (precio por porción x porciones). */
  function actualizarEfectos() {
    const t = TAMANOS.find((x) => x.id === val('tamano'))!;
    form.querySelectorAll<HTMLElement>('[data-pp]').forEach((el) => {
      const pp = Number(el.dataset.pp);
      el.textContent = pp === 0 ? 'Incluido' : `+ ${formatoSoles(efectoPorPorcion(pp, t.porciones))} en tu torta de ${t.porciones}`;
    });
    form.querySelectorAll<HTMLElement>('[data-dec]').forEach((el) => {
      el.textContent = `+ ${formatoSoles(precioDecoracion(Number(el.dataset.dec), t.pisos))}`;
    });
  }

  function pintarResumen() {
    const sel = seleccion();
    const p = presupuestoTorta(sel);
    if (!p) return;
    lineas.replaceChildren(
      ...p.lineas.map((l) => fila(`${l.etiqueta}: ${l.detalle}`, l.monto === 0 ? 'Incluido' : formatoSoles(l.monto))),
      fila('Mensaje', sel.mensaje.trim() ? `"${sel.mensaje.trim()}"` : 'Sin mensaje'),
    );
    total.textContent = formatoSoles(p.total);
    barra.textContent = formatoSoles(p.total);
    minTxt.textContent = `${p.porciones} porciones · IGV incluido · pedir con ${etiquetaMin(p.dosPisos)} de anticipación.`;
    const al = alergenosTorta(sel).map((a) => ALERGENOS[a]);
    alerg.replaceChildren(...al.map((a) => {
      const li = document.createElement('li');
      li.className = 'chip';
      li.textContent = a;
      return li;
    }));
    barraAler.textContent = `Contiene: ${al.map((a) => a.toLowerCase()).join(', ')}.`;
    pintarTotales();
    return `Total de la torta: ${formatoSoles(p.total)}. Contiene: ${al.join(', ')}.`;
  }

  function pintarTotales() {
    const t = totalesPedido(seleccion(), datos());
    if (!t) return;
    q('[data-t-torta]').textContent = formatoSoles(t.torta);
    const delivery = esDelivery();
    q('[data-t-envio]').textContent = !delivery ? 'No aplica (recojo)' : val('distrito') ? formatoSoles(t.envio) : 'Elige el distrito';
    const tt = q('[data-t-total]');
    tt.replaceChildren();
    const fuerte = document.createElement('strong');
    fuerte.textContent = formatoSoles(t.total);
    tt.append(fuerte);
    q('[data-t-adelanto]').textContent = formatoSoles(t.adelanto);
    barraEnvio.textContent = delivery && val('distrito') ? `+ delivery ${formatoSoles(t.envio)} = ${formatoSoles(t.total)}` : delivery ? '+ delivery al elegir distrito' : '';
  }

  function anunciarEntrega() {
    const t = totalesPedido(seleccion(), datos());
    if (!t) return;
    if (esDelivery() && val('distrito')) anunciar(`Delivery a ${val('distrito')}: ${formatoSoles(t.envio)}. Total del pedido: ${formatoSoles(t.total)}.`);
    else if (!esDelivery()) anunciar(`Recojo en tienda, sin costo. Total del pedido: ${formatoSoles(t.total)}.`);
  }

  function pintarFechas() {
    const ahora = new Date();
    const dp = dosPisos(val('tamano'));
    const primero = primerDiaDisponible(ahora, dp);
    fecha.min = primero;
    fecha.max = ultimoDiaPermitido(ahora);
    ayudaFecha.textContent = `Con ${etiquetaMin(dp)} de anticipación${dp ? ' (torta de 2 pisos)' : ''}. Primera fecha disponible: ${etiquetaFecha(primero)}.`;
    const delivery = esDelivery();
    etqFecha.textContent = delivery ? 'entrega' : 'recojo';
    etqHora.textContent = delivery ? 'Hora aproximada de llegada' : 'Hora de recojo';
    ayudaHora.textContent = delivery ? `${AYUDA_HORA} Te confirmamos la ventana de llegada por WhatsApp.` : AYUDA_HORA;
    avisoDelivery.textContent = dp
      ? `Fuera de estos distritos solo hay recojo en tienda. Tu torta es de 2 pisos: el delivery lleva un recargo de ${formatoSoles(RECARGO_2_PISOS)}, ya incluido en el total.`
      : `Fuera de estos distritos solo hay recojo en tienda. Torta de 2 pisos: recargo de ${formatoSoles(RECARGO_2_PISOS)} por delivery.`;
    sugBotones.replaceChildren(...proximasFechas(ahora, dp, 3).map((f) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip-fecha';
      b.textContent = etiquetaFecha(f).replace(/^(\S+) (\d+)\/(\d+)\/\d+$/, '$1 $2/$3');
      b.setAttribute('aria-label', `Elegir ${etiquetaFecha(f)}`);
      b.addEventListener('click', () => {
        fecha.value = f;
        fecha.dispatchEvent(new Event('change', { bubbles: true }));
        hora.focus();
      });
      return b;
    }));
    sugerencias.hidden = false;
    pintarHoras(false);
  }

  function pintarHoras(anunciarN: boolean) {
    const anterior = hora.value;
    if (!fecha.value) {
      hora.replaceChildren(new Option('Elige primero la fecha', ''));
      hora.disabled = true;
      return;
    }
    if (fecha.max && fecha.value > fecha.max) {
      hora.replaceChildren(new Option('Elige una fecha dentro de los 90 días', ''));
      hora.disabled = true;
      return;
    }
    const libres = horasDisponibles(fecha.value, new Date(), dosPisos(val('tamano')));
    if (!libres.length) {
      const o = new Option('Sin horas disponibles ese día', '');
      hora.replaceChildren(o);
      hora.disabled = true;
      if (anunciarN) anunciar('Ese día no hay horas disponibles. Revisa el mensaje bajo la fecha.');
      return;
    }
    hora.disabled = false;
    hora.replaceChildren(new Option('Elige una hora', ''), ...libres.map((h) => new Option(h, h)));
    if (libres.includes(anterior)) hora.value = anterior;
    if (anunciarN) anunciar(`Hay ${libres.length} horas disponibles ese día, desde las ${libres[0]}.`);
  }

  function validarFechaEnVivo() {
    const r = validarEntrega(fecha.value, '', new Date(), dosPisos(val('tamano')));
    const p = q<HTMLElement>('[data-error="fecha"]');
    if (!r.ok && r.campo === 'fecha') {
      p.textContent = r.mensaje;
      p.hidden = false;
      fecha.setAttribute('aria-invalid', 'true');
    } else {
      p.textContent = '';
      p.hidden = true;
      fecha.removeAttribute('aria-invalid');
    }
  }

  function actualizarEntrega() {
    bloqueDelivery.hidden = !esDelivery();
    pintarFechas();
    pintarTotales();
  }

  // Cambios del configurador
  form.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (['tamano', 'bizcocho', 'relleno', 'cobertura', 'decoracion'].includes(t.name)) {
      if (t.name === 'tamano') actualizarEfectos();
      const msg = pintarResumen();
      if (msg) anunciar(msg);
      if (t.name === 'tamano') {
        pintarFechas();
        if (fecha.value) validarFechaEnVivo();
      }
    }
    if (t.name === 'entrega') {
      actualizarEntrega();
      anunciarEntrega();
    }
    if (t.name === 'distrito') {
      pintarTotales();
      anunciarEntrega();
    }
    if (t.name === 'fecha') {
      pintarHoras(true);
      validarFechaEnVivo();
    }
  });

  // Mensaje con contador y aviso de límite (solo al llegar al tope)
  const msg = q<HTMLInputElement>('#mensaje');
  msg.addEventListener('input', () => {
    const n = [...msg.value].length;
    const tope = n >= MENSAJE_MAX;
    contador.textContent = tope ? `${n} de ${MENSAJE_MAX} (límite alcanzado)` : `${n} de ${MENSAJE_MAX}`;
    contador.classList.toggle('contador--max', tope);
    limite.textContent = tope ? `Límite de ${MENSAJE_MAX} caracteres alcanzado.` : '';
    const err = validarMensaje(msg.value);
    // Contenedor más pequeño que tiene el campo y su error (con los pasos, `.paso` ya no lo envuelve).
    let caja: HTMLElement | null = msg.parentElement;
    while (caja && !caja.querySelector('[data-error="mensaje"]')) caja = caja.parentElement;
    if (caja) mostrarErrores(caja, { mensaje: err ?? undefined });
    pintarResumen();
  });

  // Corrige: limpia error y línea del resumen al editar un campo
  const alEditar = (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (!t.name || t.name === 'mensaje') return;
    quitarDelResumen(resumenErr, t.name);
    const p = form.querySelector<HTMLElement>(`[data-error="${t.name}"]`);
    if (p && t.name !== 'fecha') {
      p.hidden = true;
      form.querySelectorAll(`[name="${t.name}"]`).forEach((c) => c.removeAttribute('aria-invalid'));
    }
  };
  form.addEventListener('input', alEditar);
  form.addEventListener('change', alEditar);

  // Foco no oculto por la barra fija inferior
  form.addEventListener('focusin', (e) => {
    const t = e.target as HTMLElement;
    if (barraEl.offsetParent === null || barraEl.contains(t)) return;
    const r = t.getBoundingClientRect();
    const tope = barraEl.getBoundingClientRect().top;
    if (r.bottom > tope) window.scrollBy(0, r.bottom - tope + 16);
  });
  q<HTMLAnchorElement>('[data-ver-resumen]').addEventListener('click', (e) => {
    e.preventDefault();
    const h = document.getElementById('t-resumen')!;
    h.scrollIntoView({ behavior: 'auto' });
    h.focus({ preventScroll: true });
  });

  // Precarga desde el catálogo
  function cargarBase(slug: string): boolean {
    const p = productos.find((x) => x.slug === slug);
    if (!p) return false;
    const s = p.seleccion;
    const marcar = (n: string, v: string) => {
      const el = form.querySelector<HTMLInputElement>(`input[name="${n}"][value="${v}"]`);
      if (el) el.checked = true;
    };
    marcar('tamano', s.tamano);
    marcar('bizcocho', s.bizcocho);
    marcar('relleno', s.relleno);
    marcar('cobertura', s.cobertura);
    form.querySelectorAll<HTMLInputElement>('input[name="decoracion"]').forEach((i) => { i.checked = s.decoraciones.includes(i.value); });
    actualizarEfectos();
    const resumen = pintarResumen();
    pintarFechas();
    anunciar(`Modelo ${p.nombre} cargado. ${resumen ?? ''}`);
    return true;
  }
  document.querySelectorAll<HTMLAnchorElement>('[data-personalizar]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      cargarBase(a.dataset.personalizar!);
      history.replaceState(null, '', `/?base=${a.dataset.personalizar}#configurador`);
      const h = document.getElementById('t-conf')!;
      document.getElementById('configurador')!.scrollIntoView({ behavior: 'auto' });
      h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
    });
  });
  const base = new URL(location.href).searchParams.get('base');
  if (base) cargarBase(base);

  // Envío
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const sel = seleccion();
    const d = datos();
    const errores: Record<string, string | undefined> = { ...validarPedido(d, new Date(), dosPisos(sel.tamano)) };
    const em = validarMensaje(sel.mensaje);
    if (em) errores.mensaje = em;
    const primero = mostrarErrores(form, errores);
    if (primero) {
      pintarResumenErrores(form, resumenErr, errores);
      primero.focus();
      return;
    }
    resumenErr.hidden = true;
    const ahora = new Date();
    const numero = numeroPedido(ahora);
    const url = urlWhatsApp(armarMensaje(sel, d, numero));
    const t = totalesPedido(sel, d)!;
    ok.querySelector('[data-n-pedido]')!.textContent = numero;
    ok.querySelector('[data-ok-adelanto]')!.textContent = formatoSoles(t.adelanto);
    ok.querySelector<HTMLAnchorElement>('[data-enlace-wa]')!.href = url;
    const entrega = d.entrega === 'delivery' ? `Delivery a ${d.distrito}, ${d.direccion.trim()}` : 'Recojo en tienda, Jesús María';
    ok.querySelector('[data-ok-resumen]')!.replaceChildren(
      fila('Pedido', numero),
      fila('Nombre', d.nombre.trim()),
      fila('Torta', TAMANOS.find((x) => x.id === sel.tamano)!.etiqueta),
      fila('Mensaje en la torta', sel.mensaje.trim() || 'Sin mensaje'),
      fila('Alérgenos según receta', alergenosTorta(sel).map((a) => ALERGENOS[a]).join(', ')),
      fila('Entrega', entrega),
      fila('Fecha y hora', `${etiquetaFecha(d.fecha)}, ${d.hora}${d.entrega === 'delivery' ? ' (aprox.)' : ''}. La confirmamos por WhatsApp.`),
      fila('Torta', formatoSoles(t.torta)),
      fila('Delivery', d.entrega === 'delivery' ? formatoSoles(t.envio) : 'No aplica'),
      fila('Total del pedido (IGV incluido)', formatoSoles(t.total)),
      fila('Adelanto del 50 % (política)', `${formatoSoles(t.adelanto)} por Yape o Plin. Demo: no se cobra.`),
    );
    form.hidden = true;
    ok.hidden = false;
    ok.focus();
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  const volver = (limpio: boolean) => {
    if (limpio) {
      form.reset();
      contador.textContent = `0 de ${MENSAJE_MAX}`;
      limite.textContent = '';
      mostrarErrores(form, {});
      resumenErr.hidden = true;
      actualizarEfectos();
      pintarResumen();
      actualizarEntrega();
    }
    ok.hidden = true;
    form.hidden = false;
    document.getElementById('configurador')!.scrollIntoView({ behavior: 'auto' });
    form.querySelector<HTMLElement>('input')?.focus({ preventScroll: true });
  };
  ok.querySelector('[data-editar]')!.addEventListener('click', () => volver(false));
  ok.querySelector('[data-nuevo]')!.addEventListener('click', () => volver(true));

  actualizarEfectos();
  pintarResumen(); // sin anunciar en la carga inicial
  actualizarEntrega();
}
