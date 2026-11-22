import { edadParaReserva, generarGuia, type HitoResultado } from '../lib/vacunas';
import { etiquetaFecha } from '../lib/fechas';
import { leerForm, mostrarErrores, pintarResumen, quitarDelResumen } from './formularios';

const form = document.querySelector<HTMLFormElement>('[data-form-guia]');
if (form) {
  const res = document.querySelector<HTMLElement>('[data-resultado]')!;
  const resumenErr = form.querySelector<HTMLElement>('[data-resumen-errores]')!;
  const bloques = form.querySelectorAll<HTMLElement>('[data-modo]');
  const foto = document.querySelector<HTMLElement>('[data-guia-foto]');
  form.querySelector<HTMLInputElement>('[name="nacimiento"]')!.max = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());

  const modo = () => form.querySelector<HTMLInputElement>('[name="modo"]:checked')!.value;
  const alternar = () => bloques.forEach((b) => { b.hidden = b.dataset.modo !== modo(); });
  form.querySelectorAll('[name="modo"]').forEach((r) => r.addEventListener('change', alternar));
  alternar();

  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (!t.name) return;
    quitarDelResumen(resumenErr, t.name);
    const p = form.querySelector<HTMLElement>(`[data-error="${t.name}"]`);
    if (p) p.hidden = true;
    form.querySelectorAll(`[name="${t.name}"]`).forEach((c) => c.removeAttribute('aria-invalid'));
  });

  const li = (txt: string) => { const x = document.createElement('li'); x.textContent = txt; return x; };
  const fechaCorta = (ymd: string) => etiquetaFecha(ymd).split(' ')[1];
  const p = (clase: string, txt = '') => { const e = document.createElement('p'); e.className = clase; e.textContent = txt; return e; };
  const subtitulo = (txt: string) => { const h = document.createElement('h4'); h.className = 'hitos-titulo'; h.textContent = txt; return h; };

  const hito = (h: HitoResultado, aprox: boolean) => {
    const e = document.createElement('li');
    e.className = 'hito';
    const t = p('hito__t');
    const ins = document.createElement('span');
    ins.className = `insignia insignia--${h.estado}`;
    ins.textContent = h.estado === 'proximo' ? 'Rango próximo' : 'Rango ya pasado';
    // En el grupo «Podría tocar ahora» el encabezado ya lo dice: sin insignia repetida.
    if (h.estado === 'ahora') t.append(h.titulo); else t.append(ins, h.titulo);
    e.append(t, p('hito__d', h.detalle));
    if (h.desde && h.hasta) e.append(p('hito__f', `Rango habitual: del ${fechaCorta(h.desde)} al ${fechaCorta(h.hasta)}${aprox ? ' (aproximado)' : ''}`));
    return e;
  };

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const d = leerForm(form);
    const usaNac = d.modo === 'nacimiento';
    const r = generarGuia(
      { especie: d.especie ?? '', nacimiento: usaNac ? (d.nacimiento ?? '') || undefined : undefined, edadValor: usaNac ? undefined : d.edadValor, edadUnidad: d.edadUnidad },
      new Date(),
    );
    if (!r.ok) {
      const errores: Record<string, string> = r.campo === 'especie' ? { especie: r.error } : usaNac ? { nacimiento: r.error } : { edadValor: r.error };
      const primero = mostrarErrores(form, errores);
      pintarResumen(form, resumenErr, errores);
      res.hidden = true;
      if (foto) foto.hidden = false;
      if (primero) resumenErr.focus();
      return;
    }
    mostrarErrores(form, {});
    resumenErr.hidden = true;
    res.querySelector('[data-res-titulo]')!.textContent = `Guía referencial para tu ${r.especie}`;
    res.querySelector('[data-res-resumen]')!.replaceChildren(li(`Edad: ${r.edadTexto}${r.aproximada ? ' (aproximada)' : ''}`), li(`Etapa: ${r.etapaTexto}`));
    const lista = res.querySelector('[data-res-lista]')!;
    lista.replaceChildren();
    const plegable = (titulo: string, contenido: HTMLElement) => {
      const d = document.createElement('details');
      d.className = 'plegable';
      const sm = document.createElement('summary');
      sm.textContent = titulo;
      d.append(sm, contenido);
      return d;
    };
    const listaHitos = (hs: HitoResultado[]) => {
      const ul = document.createElement('ul');
      ul.className = 'hitos';
      hs.forEach((x) => ul.append(hito(x, r.aproximada)));
      return ul;
    };
    const ahora = r.hitos.filter((h) => h.estado === 'ahora');
    lista.append(subtitulo('Podría tocar ahora (confirma con el médico)'));
    if (ahora.length) lista.append(listaHitos(ahora));
    else lista.append(p('nota', 'Con esta edad no hay un rango habitual abierto ahora. Revisa lo que sigue.'));
    const prox = r.hitos.filter((h) => h.estado === 'proximo');
    const antes = r.hitos.filter((h) => h.estado === 'anterior');
    if (prox.length) lista.append(plegable(`Próximas (${prox.length})`, listaHitos(prox)));
    if (antes.length) lista.append(plegable(`Ya pasó el rango habitual (${antes.length}): confirma en el carnet`, listaHitos(antes)));
    const up = document.createElement('ul');
    up.className = 'hitos';
    for (const x of r.periodicos) {
      const e = document.createElement('li');
      e.className = 'hito';
      e.append(p('hito__t', x.titulo), p('hito__d', x.detalle));
      up.append(e);
    }
    lista.append(plegable('Después, de por vida', up));
    res.querySelector<HTMLElement>('[data-res-avisos]')!.textContent = r.avisos.join(' ');
    res.hidden = false;
    if (foto) foto.hidden = true;
    const ed = r.aproximada && d.edadValor ? { valor: Number(d.edadValor), unidad: d.edadUnidad } : edadParaReserva(r.edadSemanas);
    document.dispatchEvent(new CustomEvent('guia:resultado', { detail: { especie: r.especie, edadValor: String(ed.valor), edadUnidad: ed.unidad } }));
    res.focus();
  });
}
