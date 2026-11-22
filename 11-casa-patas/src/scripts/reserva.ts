import { SERVICIOS_RESERVA, TAMANOS_BANO, type ServicioId } from '../lib/config';
import { etiquetaFecha, horasDelDia, horasDisponibles, motivoCierre, partesLima, primerDiaDisponible, sumarDias, ultimoDiaPermitido, validarCita, ymdValido } from '../lib/fechas';
import { armarMensaje, numeroCita, urlWhatsApp, validarCitaForm, type DatosCita } from '../lib/reserva';
import { leerForm, mostrarErrores, pintarResumen, quitarDelResumen } from './formularios';

const form = document.querySelector<HTMLFormElement>('[data-form-reserva]');
if (form) {
  const ok = document.querySelector<HTMLElement>('[data-cita-ok]')!;
  const resumenErr = form.querySelector<HTMLElement>('[data-resumen-errores]')!;
  const fecha = form.querySelector<HTMLInputElement>('[name="fecha"]')!;
  const hora = form.querySelector<HTMLSelectElement>('[name="hora"]')!;
  const bloqueTamano = form.querySelector<HTMLElement>('[data-bloque-tamano]')!;
  const errFecha = form.querySelector<HTMLElement>('[data-error="fecha"]')!;

  const servicio = () => (form.querySelector<HTMLInputElement>('[name="servicio"]:checked')?.value ?? '') as ServicioId | '';
  const fijarLimites = () => { fecha.min = partesLima(new Date()).ymd; fecha.max = ultimoDiaPermitido(new Date()); };
  fijarLimites();

  const opcion = (v: string, t: string, deshabilitada = false) => {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = t;
    o.disabled = deshabilitada;
    return o;
  };

  /** Rellena horas o turnos según servicio y fecha; lo que ya no está disponible queda con el texto «no disponible». */
  const pintarHoras = () => {
    const s = servicio();
    const f = fecha.value;
    const previa = hora.value;
    hora.replaceChildren();
    if (!s || !f || !ymdValido(f)) {
      hora.append(opcion('', !s ? 'Elige primero el servicio' : 'Elige primero la fecha'));
      return;
    }
    const todas = horasDelDia(f, s);
    if (!todas.length) {
      hora.append(opcion('', motivoCierre(f, s) ?? 'Sin horas ese día'));
      return;
    }
    const libres = new Set(horasDisponibles(f, s, new Date()));
    hora.append(opcion('', s === 'bano' ? 'Elige un turno' : 'Elige la hora'));
    for (const h of todas) hora.append(opcion(h, libres.has(h) ? (s === 'bano' ? `${h} (turno)` : h) : `${h} (no disponible)`, !libres.has(h)));
    if (libres.has(previa)) hora.value = previa;
  };

  /** Ayuda de la fecha al cambiarla: texto de error asociado al campo, sin anuncio en vivo. */
  const revisarFecha = () => {
    const s = servicio();
    if (!s || !fecha.value) return;
    const r = validarCita(fecha.value, '', s, new Date());
    if (!r.ok && r.campo === 'fecha') {
      // La sugerencia de fecha se puede aceptar con un botón en vez de obligar a reescribirla.
      const sug = / Te sugerimos el .*.$/.test(r.mensaje) ? primerDiaDisponible(s, new Date(), sumarDias(fecha.value, 1)) : '';
      errFecha.textContent = sug ? r.mensaje.replace(/ Te sugerimos el .*.$/, '') : r.mensaje;
      if (sug) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'enlace';
        b.textContent = `Usar el ${etiquetaFecha(sug)}`;
        b.addEventListener('click', () => { fecha.value = sug; quitarDelResumen(resumenErr, 'fecha'); pintarHoras(); revisarFecha(); fecha.focus(); });
        errFecha.append(' ', b);
      }
      errFecha.hidden = false;
      fecha.setAttribute('aria-invalid', 'true');
    } else {
      errFecha.hidden = true;
      fecha.removeAttribute('aria-invalid');
    }
  };

  const alternarServicio = () => {
    bloqueTamano.hidden = servicio() !== 'bano';
    pintarHoras();
    revisarFecha();
  };
  form.querySelectorAll('[name="servicio"]').forEach((r) => r.addEventListener('change', alternarServicio));
  fecha.addEventListener('change', () => { quitarDelResumen(resumenErr, 'fecha'); pintarHoras(); revisarFecha(); });

  // La guía guarda especie y edad; sus enlaces «Reservar vacunación» preseleccionan el servicio y precompletan esos datos.
  let deLaGuia: { especie: string; edadValor: string; edadUnidad: string } | null = null;
  document.addEventListener('guia:resultado', (e) => { deLaGuia = (e as CustomEvent).detail; });
  document.querySelectorAll<HTMLElement>('[data-elegir-servicio]').forEach((a) => a.addEventListener('click', () => {
    const r = form.querySelector<HTMLInputElement>(`[name="servicio"][value="${a.dataset.elegirServicio}"]`);
    if (r) { r.checked = true; alternarServicio(); }
    if (deLaGuia) {
      const esp = form.querySelector<HTMLInputElement>(`[name="especie"][value="${deLaGuia.especie}"]`);
      if (esp) esp.checked = true;
      form.querySelector<HTMLInputElement>('[name="edadValor"]')!.value = deLaGuia.edadValor;
      form.querySelector<HTMLSelectElement>('[name="edadUnidad"]')!.value = deLaGuia.edadUnidad;
    }
  }));

  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (!t.name || t.name === 'fecha') return;
    quitarDelResumen(resumenErr, t.name);
    const p = form.querySelector<HTMLElement>(`[data-error="${t.name}"]`);
    if (p) p.hidden = true;
    form.querySelectorAll(`[name="${t.name}"]`).forEach((c) => c.removeAttribute('aria-invalid'));
  });

  const fila = (k: string, v: string) => {
    const d = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = k;
    dd.textContent = v || '—';
    d.append(dt, dd);
    return d;
  };
  const unidadTxt: Record<string, string> = { semanas: 'semanas', meses: 'meses', anios: 'años' };

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const d = leerForm(form);
    const datos: DatosCita = {
      servicio: d.servicio ?? '', especie: d.especie ?? '', tamano: d.tamano ?? '', mascota: d.mascota ?? '', edadValor: d.edadValor ?? '',
      edadUnidad: d.edadUnidad ?? '', dueno: d.dueno ?? '', celular: d.celular ?? '', fecha: d.fecha ?? '', hora: d.hora ?? '',
      sintomas: d.sintomas ?? '', acepta: d.acepta ?? '',
    };
    const errores = validarCitaForm(datos, new Date());
    const primero = mostrarErrores(form, errores);
    if (primero) {
      pintarResumen(form, resumenErr, errores);
      resumenErr.focus();
      return;
    }
    resumenErr.hidden = true;
    const numero = numeroCita(new Date());
    const srv = SERVICIOS_RESERVA.find((s) => s.id === datos.servicio)!;
    const tam = TAMANOS_BANO.find((t) => t.id === datos.tamano);
    ok.querySelector('[data-numero]')!.textContent = numero;
    ok.querySelector<HTMLElement>('[data-resumen]')!.replaceChildren(
      fila('Servicio solicitado', `${srv.nombre}${tam ? `, ${tam.nombre}` : ''}`),
      fila('Mascota', `${datos.mascota.trim()}, ${datos.especie}, ${datos.edadValor} ${unidadTxt[datos.edadUnidad]} (aprox.)`),
      fila('Fecha y hora', `${etiquetaFecha(datos.fecha)}, ${datos.hora} (hora de Lima)`),
      fila('Dueño', datos.dueno.trim()),
      fila('Celular', datos.celular.trim()),
      fila('Para el médico (no se envía por WhatsApp)', datos.sintomas.trim()),
      fila('Precio de referencia', `Desde S/ ${tam ? tam.desde : srv.desde}, IGV incluido; el monto final se confirma en la clínica`),
    );
    ok.querySelector<HTMLAnchorElement>('[data-wa]')!.href = urlWhatsApp(armarMensaje(datos, numero));
    form.hidden = true;
    ok.hidden = false;
    // El panel es más alto que la pantalla: se lleva al inicio para que se vean el título y el botón de WhatsApp.
    ok.focus({ preventScroll: true });
    ok.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  ok.querySelector('[data-nueva]')!.addEventListener('click', () => {
    form.reset();
    mostrarErrores(form, {});
    resumenErr.hidden = true;
    bloqueTamano.hidden = true;
    fijarLimites();
    pintarHoras();
    ok.hidden = true;
    form.hidden = false;
    form.querySelector<HTMLElement>('input')?.focus();
  });
  pintarHoras();
}
