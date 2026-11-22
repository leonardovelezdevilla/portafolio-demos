/* Kit «sistema completo» para las demos del portafolio de Vélez De Villa.
   Modo DEMOSTRACIÓN: todo se guarda solo en el navegador de quien prueba (localStorage). No se cobra nada,
   no se piden datos de tarjeta y los comprobantes son ejemplos que no valen ante SUNAT.
   En un negocio real, lo mismo funciona con un servidor (Apps Script o Workers), una pasarela de pago
   (Culqi, Izipay o Mercado Pago) y un proveedor de facturación autorizado por SUNAT.

   Copia maestra: kit/sistema-demo.ts. Cada demo la recibe en src/kit/ con `node scripts/kit.mjs`; no la edites ahí. */

export type Tipo = 'cita' | 'reserva' | 'clase' | 'matricula' | 'visita' | 'pedido' | 'suscripcion' | 'llamada';
export type Estado = 'pendiente' | 'confirmada' | 'atendida' | 'cancelada' | 'no_vino';

export interface Config {
  id: string;            // clave corta y única por demo (se usa en localStorage)
  negocio: string;       // nombre de la marca ficticia
  prefijo: string;       // prefijo de los códigos, p. ej. «CP»
  direccion?: string;    // para el calendario
  horasCancelar?: number;
  pinDemo?: string;
  panelUrl?: string;     // ruta del panel, p. ej. «/panel/» (relativa a la base)
  nombres?: Partial<Record<Tipo, string>>; // cómo llama el negocio a cada registro (cita, reserva, pedido...)
}

export interface Nuevo {
  tipo: Tipo;
  titulo: string;        // p. ej. «Consulta veterinaria» o «Pedido de 2 productos»
  detalle?: string;      // texto corto para el panel (mascota, talla, placa...)
  nombre: string;
  cel: string;           // solo dígitos; 9 dígitos se toman como de Perú
  fecha?: string;        // YYYY-MM-DD (hora de Lima)
  inicioMin?: number;    // minutos desde las 00:00
  durMin?: number;
  monto?: number;        // total referencial en soles (IGV incluido)
  adelanto?: number;     // lo que se puede pagar en línea; si falta, se usa monto
  cantidad?: number;     // personas o lugares que ocupa (para cupos); por defecto 1
  horasCancelar?: number; // si este servicio tiene otro plazo para cancelar
  codigo?: string;       // si la demo ya generó uno, se reutiliza
}

export interface Registro extends Required<Pick<Nuevo, 'tipo' | 'titulo' | 'nombre' | 'cel'>> {
  codigo: string; clave: string; creado: number; estado: Estado;
  detalle?: string; fecha?: string; inicioMin?: number; durMin?: number; monto?: number; adelanto?: number; cantidad?: number; horasCancelar?: number;
  pago?: { monto: number; metodo: Metodo; fecha: number; id: string };
  comprobante?: { tipo: 'boleta' | 'factura'; numero: string; doc: string; rs: string; base: number; igv: number; total: number };
  notaCredito?: string; canceloCliente?: boolean;
}
type Metodo = 'tarjeta' | 'yape' | 'billetera';
interface Espera { id: string; tipo: Tipo; titulo: string; fecha: string; nombre: string; cel: string; estado: 'espera' | 'avisado' | 'quitado'; creado: number }

const METODOS: Record<Metodo, string> = { tarjeta: 'Tarjeta de crédito o débito', yape: 'Yape o Plin', billetera: 'Billetera digital' };
const ESTADOS: Record<Estado, string> = { pendiente: 'Pendiente de confirmar', confirmada: 'Confirmada', atendida: 'Atendida', cancelada: 'Cancelada', no_vino: 'No se presentó' };
const DOWL = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

let C: Required<Pick<Config, 'id' | 'negocio' | 'prefijo' | 'horasCancelar' | 'pinDemo'>> & Config;

// ---------- utilidades ----------
type Hijo = Node | string | null | undefined | false;
function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, unknown> = {}, ...hijos: Hijo[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'text') e.textContent = String(v);
    else if (k === 'class') e.className = String(v);
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v as EventListener);
    else if (v === true) e.setAttribute(k, '');
    else e.setAttribute(k, String(v));
  }
  for (const h of hijos) if (h !== null && h !== undefined && h !== false) e.append(h);
  return e;
}
const K = (n: string) => `kit-${C.id}-${n}`;
function load<T>(n: string, def: T): T { try { const v = JSON.parse(localStorage.getItem(K(n)) ?? 'null'); return (v ?? def) as T; } catch { return def; } }
function save(n: string, v: unknown) { try { localStorage.setItem(K(n), JSON.stringify(v)); } catch { /* modo privado: la demo sigue sin guardar */ } }
const pad = (n: number) => String(n).padStart(2, '0');
export const soles = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);
const hoyLima = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const fechaLarga = (k: string) => { const d = new Date(k + 'T12:00:00'); return `${DOWL[d.getDay()]} ${d.getDate()} de ${MES[d.getMonth()]}`; };
export const hora = (m: number) => { const h = Math.floor(m / 60), mm = m % 60, h12 = ((h + 11) % 12) + 1; return `${h12}:${pad(mm)} ${h < 12 ? 'a. m.' : 'p. m.'}`; };
const cuando = (r: { fecha?: string; inicioMin?: number }) => r.fecha ? `${fechaLarga(r.fecha)}${r.inicioMin !== undefined ? ', ' + hora(r.inicioMin) : ''}` : '';
const hex = (n: number) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (x) => x.toString(16).padStart(2, '0')).join('');
const codigoNuevo = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', b = new Uint32Array(5); crypto.getRandomValues(b); return `${C.prefijo}-${Array.from(b, (x) => A[x % A.length]).join('')}`; };
export const celIntl = (t: string) => { const d = String(t).replace(/\D/g, ''); return /^9\d{8}$/.test(d) ? '51' + d : d; };
export const celValido = (d: string) => /^519\d{8}$/.test(d) || (!d.startsWith('51') && /^[1-9]\d{7,14}$/.test(d));
export const rucValido = (r: string) => {
  if (!/^(10|15|17|20)\d{9}$/.test(r)) return false;
  const w = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]; let s = 0;
  for (let i = 0; i < 10; i++) s += Number(r[i]) * w[i];
  let d = 11 - (s % 11); if (d === 10) d = 0; if (d === 11) d = 1;
  return d === Number(r[10]);
};
const nombreDe = (t: Tipo) => C.nombres?.[t] ?? ({ cita: 'cita', reserva: 'reserva', clase: 'clase', matricula: 'matrícula', visita: 'visita', pedido: 'pedido', suscripcion: 'suscripción', llamada: 'llamada' } as const)[t];
let toastEl: HTMLElement | null = null;
const prepararToast = () => { if (!toastEl) { toastEl = el('div', { class: 'kit-toast', role: 'status', 'aria-live': 'polite' }); document.body.append(toastEl); } };
function toast(msg: string) {
  prepararToast(); if (!toastEl) return;
  toastEl.textContent = msg; toastEl.classList.add('kit-toast--on');
  clearTimeout((toastEl as unknown as { _h: number })._h);
  (toastEl as unknown as { _h: number })._h = window.setTimeout(() => toastEl?.classList.remove('kit-toast--on'), 3500);
}
const lista = (filas: [string, string][]) => { const dl = el('dl', { class: 'kit-dl' }); filas.forEach(([a, b]) => dl.append(el('dt', { text: a }), el('dd', { text: b }))); return dl; };
function dialogo(titulo: string, cuerpo: Node): HTMLDialogElement {
  const id = 'kit-d-' + hex(3);
  const d = el('dialog', { class: 'kit-dialog', 'aria-labelledby': id }, el('div', { class: 'kit-dialog__in' }, el('h2', { class: 'kit-h', id, text: titulo }), cuerpo));
  const antes = document.activeElement as HTMLElement | null;
  d.addEventListener('close', () => { d.remove(); const v = antes?.isConnected && antes !== document.body && !antes.closest('dialog:not([open])') ? antes : document.querySelector<HTMLElement>('[data-kit-volver]'); v?.focus(); });
  d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  document.body.append(d); d.showModal();
  return d;
}
const cerrar = (txt = 'Cerrar') => el('button', { type: 'button', class: 'kit-btn kit-btn--main', text: txt, onclick: (e: Event) => (e.target as HTMLElement).closest('dialog')?.close() });
/** Muestra un error ligado a su campo (aria-invalid y aria-describedby) y lleva el foco ahí. */
const fallo = (err: HTMLElement, campo: HTMLElement, msg: string) => {
  if (!err.id) err.id = 'kit-e-' + hex(3);
  err.textContent = msg;
  err.closest('form')?.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
  campo.setAttribute('aria-invalid', 'true');
  const d = (campo.getAttribute('aria-describedby') ?? '').split(' ').filter((x) => x && x !== err.id);
  campo.setAttribute('aria-describedby', [...d, err.id].join(' '));
  campo.focus();
};
const dobleToque = (btn: HTMLButtonElement, texto: string, aviso: HTMLElement | null, accion: () => void) => {
  let armado = false, t = 0;
  btn.addEventListener('click', () => {
    if (!armado) { armado = true; btn.textContent = 'Toca otra vez para confirmar'; if (aviso) aviso.textContent = 'Para confirmar, vuelve a tocar el botón.';
      t = window.setTimeout(() => { armado = false; btn.textContent = texto; if (aviso) aviso.textContent = ''; }, 4000); return; }
    clearTimeout(t); armado = false; btn.textContent = texto; accion();
  });
};

// ---------- datos ----------
const esAdelanto = (r: Registro) => r.adelanto !== undefined && (!r.monto || r.adelanto < r.monto);
const hc = (r: { horasCancelar?: number }) => r.horasCancelar ?? C.horasCancelar;
const activo = (r: Registro) => r.estado === 'pendiente' || r.estado === 'confirmada';
const registros = (): Registro[] => load<Registro[]>('registros', []);
const guardarRegistros = (v: Registro[]) => save('registros', v);
function actualizar(codigo: string, fn: (r: Registro) => void): Registro | undefined {
  const v = registros(); const r = v.find((x) => x.codigo === codigo); if (r) { fn(r); guardarRegistros(v); } avisar(); return r;
}
const correlativo = (serie: string) => { const n = load<number>('serie-' + serie, 0) + 1; save('serie-' + serie, n); return `DEMO-${serie}-${String(n).padStart(6, '0')}`; };
const emitirNotaCredito = (r: Registro) => { if (r.pago && r.comprobante && !r.notaCredito) r.notaCredito = correlativo(r.comprobante.tipo === 'factura' ? 'FC01' : 'BC01'); };
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());
export const alCambiar = (f: () => void) => { oyentes.add(f); };

/** Quita un registro recién creado que aún no se pagó (p. ej. cuando la persona vuelve a corregir sus datos). */
export function anular(codigo: string) { const v = registros(); const r = v.find((x) => x.codigo === codigo); if (r && !r.pago) { guardarRegistros(v.filter((x) => x !== r)); avisar(); } }

/** Minutos de inicio ya tomados (repetidos según la cantidad de lugares de cada registro) por registros activos de ese día (para marcar horarios ocupados en la demo). */
/** true si ese registro ya se pagó (para ocultar «Corregir datos» y no duplicarlo). */
export const estaPagado = (codigo: string) => !!registros().find((x) => x.codigo === codigo)?.pago;
export const ocupados = (fecha: string, titulo?: string) => registros().filter((r) => activo(r) && r.fecha === fecha && r.inicioMin !== undefined && (!titulo || r.titulo === titulo)).flatMap((r) => Array<number>(Math.max(1, r.cantidad ?? 1)).fill(r.inicioMin!));

/** Guarda un registro nuevo (cita, pedido, matrícula...) y lo devuelve con su código y su clave secreta. */
export function registrar(n: Nuevo): Registro {
  const r: Registro = { ...n, cel: celIntl(n.cel), nombre: n.nombre.trim().slice(0, 60), titulo: n.titulo.slice(0, 120), detalle: n.detalle?.slice(0, 200),
    codigo: n.codigo && !registros().some((x) => x.codigo === n.codigo) ? n.codigo : codigoNuevo(), clave: hex(16), creado: Date.now(), estado: 'pendiente' };
  guardarRegistros([...registros(), r]); avisar();
  return r;
}

// ---------- calendario ----------
const inicioUtc = (fecha: string, min: number) => { const [y, m, d] = fecha.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d, 5, 0) + min * 60000); }; // Lima = UTC-5 todo el año
const fUtc = (t: Date) => t.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsTxt = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const icsFold = (l: string) => { const te = new TextEncoder(); let o = '', n = 0; for (const ch of l) { const b = te.encode(ch).length; if (n + b > 74) { o += '\r\n '; n = 1; } o += ch; n += b; } return o; };
const enlaceRegistro = (r: Registro) => `${location.origin}${location.pathname}#cita=${r.codigo}.${r.clave}`;
let icsUrl = '';
function calendario(r: Registro): HTMLElement | null {
  if (!r.fecha || r.inicioMin === undefined) return null;
  const ini = inicioUtc(r.fecha, r.inicioMin), fin = new Date(ini.getTime() + (r.durMin || 60) * 60000);
  const titulo = `${r.titulo} · ${C.negocio}`, lugar = C.direccion || C.negocio;
  const det = `Código ${r.codigo}. Si no puedes ir, usa el enlace para cancelar que te dimos al reservar.`;
  const g = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({ action: 'TEMPLATE', text: titulo, dates: `${fUtc(ini)}/${fUtc(fin)}`, ctz: 'America/Lima', details: det, location: lugar });
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${C.id}//Demo//ES`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${r.codigo}@${location.hostname || 'demo'}`, `DTSTAMP:${fUtc(new Date())}`, `DTSTART:${fUtc(ini)}`, `DTEND:${fUtc(fin)}`,
    `SUMMARY:${icsTxt(titulo)}`, `LOCATION:${icsTxt(lugar)}`, `DESCRIPTION:${icsTxt(det)}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsTxt(titulo)}`, `TRIGGER:-PT${hc(r) + 1}H`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].map(icsFold).join('\r\n') + '\r\n';
  if (icsUrl) URL.revokeObjectURL(icsUrl);
  icsUrl = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  return el('div', { class: 'kit-bloque' },
    el('p', { class: 'kit-t', text: 'Guárdalo en tu calendario' }),
    el('div', { class: 'kit-btns' },
      el('a', { class: 'kit-btn', href: g, target: '_blank', rel: 'noopener noreferrer', text: 'Agregar a Google Calendar' }),
      el('a', { class: 'kit-btn', href: icsUrl, download: `${r.codigo}.ics`, text: 'Agregar a iPhone u Outlook' })));
}

// ---------- pago y comprobante simulados ----------
export function abrirPago(codigo: string, alTerminar?: (r: Registro) => void) {
  const r = registros().find((x) => x.codigo === codigo); if (!r) return;
  if (r.pago || !activo(r)) { toast(r.pago ? 'Esto ya está pagado.' : 'Este registro ya no está activo.'); return; }
  const monto = r.adelanto ?? r.monto ?? 0; if (!monto) return;
  const err = el('p', { class: 'kit-err', role: 'alert' });
  const tipo = el('select', { id: 'kit-pg-tipo' }, el('option', { value: 'boleta', text: 'Boleta' }), el('option', { value: 'factura', text: 'Factura (con RUC)' }));
  const docL = el('label', { for: 'kit-pg-doc', text: 'DNI (opcional)' });
  const doc = el('input', { type: 'text', id: 'kit-pg-doc', inputmode: 'numeric', maxlength: '11', autocomplete: 'off' });
  const rs = el('input', { type: 'text', id: 'kit-pg-rs', maxlength: '100', autocomplete: 'organization' });
  const rsBox = el('div', { class: 'kit-campo', hidden: true }, el('label', { for: 'kit-pg-rs', text: 'Razón social' }), rs);
  tipo.addEventListener('change', () => { const f = tipo.value === 'factura'; docL.textContent = f ? 'RUC (11 dígitos)' : 'DNI (opcional)'; rsBox.hidden = !f; });
  const metodos = el('fieldset', { class: 'kit-met' }, el('legend', { text: 'Medio de pago' }),
    ...(Object.entries(METODOS) as [Metodo, string][]).map(([v, t], i) => el('label', { class: 'kit-check' }, el('input', { type: 'radio', name: 'kit-metodo', value: v, checked: i === 0 }), el('span', { text: t }))));
  let d: HTMLDialogElement;
  const f = el('form', { novalidate: true },
    el('p', { class: 'kit-aviso', text: 'Demostración: no se cobra nada y no se piden datos de tarjeta.' }),
    el('p', { class: 'kit-mute', text: 'En la web real, aquí se abre la página segura de la pasarela (Culqi, Izipay o Mercado Pago). Al aprobarse el pago, un proveedor autorizado por SUNAT emite el comprobante automáticamente.' }),
    lista([['Concepto', r.titulo], [esAdelanto(r) ? 'Adelanto' : 'Total', soles(monto)], ...(esAdelanto(r) ? [['El resto', 'se paga en el local']] as [string, string][] : [])]),
    el('div', { class: 'kit-campo' }, el('label', { for: 'kit-pg-tipo', text: 'Comprobante' }), tipo),
    el('div', { class: 'kit-campo' }, docL, doc), rsBox, metodos, err,
    el('div', { class: 'kit-btns' }, el('button', { class: 'kit-btn kit-btn--main', type: 'submit', text: `Simular pago de ${soles(monto)}` }),
      el('button', { class: 'kit-btn', type: 'button', text: 'Volver', onclick: () => d.close() })));
  f.addEventListener('submit', (e) => {
    e.preventDefault(); err.textContent = '';
    const fac = tipo.value === 'factura', v = doc.value.replace(/\D/g, '');
    if (fac && !rucValido(v)) { fallo(err, doc, 'Revisa el RUC: son 11 dígitos y debe ser un RUC válido.'); return; }
    if (fac && rs.value.trim().length < 3) { fallo(err, rs, 'Escribe la razón social.'); return; }
    if (!fac && v && !/^\d{8}$/.test(v)) { fallo(err, doc, 'El DNI tiene 8 dígitos. Si prefieres, déjalo vacío.'); return; }
    const metodo = (f.querySelector<HTMLInputElement>('input[name=kit-metodo]:checked')?.value ?? 'tarjeta') as Metodo;
    const base = Math.round((monto / 1.18) * 100) / 100;
    let pagado = false;
    const x = actualizar(codigo, (y) => {
      if (y.pago || !activo(y)) return; // ya pagado o ya no activo: nunca se cobra
      y.pago = { monto, metodo, fecha: Date.now(), id: 'PAY-' + hex(4).toUpperCase() };
      y.comprobante = { tipo: fac ? 'factura' : 'boleta', numero: correlativo(fac ? 'F001' : 'B001'), doc: fac ? v : v ? '****' + v.slice(-4) : '' /* el DNI se guarda enmascarado */, rs: fac ? rs.value.trim().slice(0, 100) : '', base, igv: Math.round((monto - base) * 100) / 100, total: monto };
      if (y.estado === 'pendiente') y.estado = 'confirmada';
      pagado = true;
    });
    d.close();
    if (x && pagado) { toast('Pago aprobado (simulado). Se emitió el comprobante de ejemplo.'); alTerminar?.(x); document.querySelector<HTMLElement>('[data-kit-volver]')?.focus(); verComprobante(codigo); }
  });
  d = dialogo('Pagar en línea (simulado)', f);
  tipo.focus();
}
export function verComprobante(codigo: string) {
  const r = registros().find((x) => x.codigo === codigo); if (!r?.comprobante || !r.pago) return;
  const k = r.comprobante;
  const filas: [string, string][] = [['Emisor', `${C.negocio} (marca ficticia)`],
    ['Cliente', k.tipo === 'factura' ? `${k.rs} · RUC ${k.doc}` : `${r.nombre}${k.doc ? ' · DNI ' + k.doc : ''}`],
    ['Fecha', new Date(r.pago.fecha).toLocaleDateString('es-PE')], ['Concepto', `${r.titulo} (${r.codigo})`],
    ['Valor de venta', soles(k.base)], ['IGV (18 %)', soles(k.igv)], ['Total', soles(k.total)], ['Pagado con', METODOS[r.pago.metodo]]];
  if (r.notaCredito) filas.push(['Nota de crédito', `${r.notaCredito}: se devuelve ${soles(k.total)} (simulado)`]);
  dialogo(`${k.tipo === 'factura' ? 'Factura' : 'Boleta'} de ejemplo (no válida) ${k.numero}`, el('div', {},
    el('p', { class: 'kit-aviso', text: 'Ejemplo de demostración: no es un comprobante válido ante SUNAT.' }), lista(filas),
    el('p', { class: 'kit-mute', text: 'En la web real, el cliente recibe el PDF por correo o WhatsApp y el negocio lo ve en su panel.' }),
    el('div', { class: 'kit-btns' }, cerrar())));
}

// ---------- tarjeta para la confirmación ----------
/** Bloque para poner debajo de la confirmación: pago en línea (si hay monto), calendario (si hay fecha y hora) y enlace para cancelar. */
export function extras(r: Registro, opciones: { pagoOpcional?: boolean } = {}): HTMLElement {
  const box = el('div', { class: 'kit-extras' });
  const pintar = () => {
    const x = registros().find((y) => y.codigo === r.codigo) ?? r;
    const monto = x.adelanto ?? x.monto ?? 0;
    const partes: Hijo[] = [];
    if (x.pago && x.comprobante) partes.push(el('div', { class: 'kit-bloque' }, el('p', { class: 'kit-t', text: `Pagado: ${soles(x.pago.monto)} (simulado)` }),
      el('button', { type: 'button', class: 'kit-btn', 'data-kit-volver': true, text: `Ver ${x.comprobante.tipo} ${x.comprobante.numero}`, onclick: () => verComprobante(x.codigo) })));
    else if (monto) partes.push(el('div', { class: 'kit-bloque kit-bloque--pago' },
      el('p', { class: 'kit-t', text: esAdelanto(x) ? `Siguiente paso: paga tu adelanto y confirma tu ${nombreDe(x.tipo)}` : `Siguiente paso: paga en línea y confirma tu ${nombreDe(x.tipo)}` }),
      el('p', { class: 'kit-mute', text: esAdelanto(x) ? `Asegura tu ${nombreDe(x.tipo)} con ${soles(monto)}. Se descuenta del total y el resto se paga en el local.` : `Paga ${soles(monto)} con tarjeta, Yape o billetera digital y recibe tu comprobante electrónico.` }),
      el('button', { type: 'button', class: 'kit-btn kit-btn--main', text: `Pagar ${soles(monto)} (simulado)`, onclick: () => abrirPago(x.codigo, () => pintar()) }),
      opciones.pagoOpcional === false ? null : el('p', { class: 'kit-mute', text: 'Si prefieres pagar en el local, confirma por WhatsApp con el botón de abajo.' })));
    partes.push(calendario(x));
    if (x.fecha) partes.push(el('p', { class: 'kit-mute' }, `¿No podrás ir? `, el('a', { href: enlaceRegistro(x), text: `Cancela tu ${nombreDe(x.tipo)} con este enlace` }),
      `, hasta ${hc(x)} horas antes. En esta demo, el enlace funciona solo en este navegador.`));
    if (C.panelUrl) partes.push(el('p', { class: 'kit-mute' }, 'Así le llega al negocio: ', el('a', { href: C.panelUrl, text: `ver el panel (demo, PIN ${C.pinDemo})` })));
    box.replaceChildren(...partes.filter(Boolean) as Node[]);
  };
  pintar();
  alCambiar(() => { if (box.isConnected) pintar(); });
  return box;
}

// ---------- enlace «Mi cita» ----------
function abrirMiRegistro() {
  const m = /^#cita=([A-Z0-9-]{4,24})\.([a-f0-9]{32})$/.exec(location.hash);
  history.replaceState(null, '', location.pathname + location.search); // el enlace secreto no queda en la barra
  const r = m ? registros().find((x) => x.codigo === m[1] && x.clave === m[2]) : undefined;
  if (!r) { dialogo('Tu reserva', el('div', {}, el('p', { class: 'kit-err', text: 'No encontramos esa reserva. En esta demo, el enlace solo funciona en el navegador donde reservaste.' }), el('div', { class: 'kit-btns' }, cerrar()))); return; }
  const msg = el('p', { class: 'kit-mute', role: 'status' });
  const cuerpo = el('div', {});
  const pintar = (x: Registro) => {
    const faltan = x.fecha && x.inicioMin !== undefined ? (inicioUtc(x.fecha, x.inicioMin).getTime() - Date.now()) / 3600000 : Infinity;
    const act = activo(x);
    const puede = act && faltan >= hc(x);
    const filas: [string, string][] = [['Código', x.codigo], ['Qué', x.titulo]];
    if (x.fecha) filas.push(['Cuándo', cuando(x)]);
    filas.push(['Estado', ESTADOS[x.estado]]);
    if (x.pago) filas.push(['Pago', `${soles(x.pago.monto)}${x.notaCredito ? ' (devuelto)' : ''}`]);
    const btns = el('div', { class: 'kit-btns' });
    if (puede) {
      const b = el('button', { type: 'button', class: 'kit-btn kit-btn--main', text: `Cancelar mi ${nombreDe(x.tipo)}` });
      dobleToque(b, b.textContent!, msg, () => {
        const ahora = registros().find((z) => z.codigo === x.codigo);
        const aun = ahora && activo(ahora) && (!ahora.fecha || ahora.inicioMin === undefined || (inicioUtc(ahora.fecha, ahora.inicioMin).getTime() - Date.now()) / 3600000 >= hc(ahora));
        if (!aun) { pintar(ahora ?? x); msg.textContent = 'Ya no se puede cancelar desde aquí. Escríbenos por WhatsApp.'; return; }
        const y = actualizar(x.codigo, (z) => { z.estado = 'cancelada'; z.canceloCliente = true; emitirNotaCredito(z); })!;
        pintar(y); cuerpo.querySelector<HTMLElement>('.kit-btns button')?.focus();
        msg.textContent = y.notaCredito ? `Listo: se canceló. Se emitió la nota de crédito ${y.notaCredito} y se devuelve tu pago (simulado).` : 'Listo: se canceló y el horario quedó libre. Gracias por avisar.';
      });
      btns.append(b);
    }
    btns.append(cerrar());
    cuerpo.replaceChildren(...[lista(filas),
      act && !puede ? el('p', { class: 'kit-mute', text: `Faltan menos de ${hc(x)} horas. Para cancelar, escríbenos por WhatsApp.` }) : null,
      msg, btns].filter(Boolean) as Node[]);
  };
  pintar(r);
  dialogo(`Tu ${nombreDe(r.tipo)}`, cuerpo);
}

// ---------- lista de espera ----------
const esperas = () => load<Espera[]>('espera', []).filter((x) => x.fecha >= hoyLima());
/** Botón «Anotarme en la lista de espera» para cuando un día, una clase o un horario está lleno. */
export function botonEspera(pedido: { tipo: Tipo; titulo: string; fecha: string }, texto = 'Anotarme en la lista de espera'): HTMLButtonElement {
  return el('button', { type: 'button', class: 'kit-btn', text: texto, onclick: () => abrirEspera(pedido) });
}
export function abrirEspera(pedido: { tipo: Tipo; titulo: string; fecha: string }) {
  const err = el('p', { class: 'kit-err', role: 'alert' });
  const nom = el('input', { type: 'text', id: 'kit-es-nom', maxlength: '60', autocomplete: 'name' });
  const cel = el('input', { type: 'tel', id: 'kit-es-cel', inputmode: 'tel', autocomplete: 'tel', placeholder: '987 654 321', 'aria-describedby': 'kit-es-cel-a' });
  const ok = el('input', { type: 'checkbox', id: 'kit-es-ok' });
  let d: HTMLDialogElement;
  const f = el('form', { novalidate: true },
    el('p', { class: 'kit-mute', text: `${pedido.titulo}, ${fechaLarga(pedido.fecha)}. Si se libera un lugar, te escribimos por WhatsApp. Anotarte no aparta un lugar.` }),
    el('div', { class: 'kit-campo' }, el('label', { for: 'kit-es-nom', text: 'Tu nombre' }), nom),
    el('div', { class: 'kit-campo' }, el('label', { for: 'kit-es-cel', text: 'Celular con WhatsApp' }), cel, el('p', { class: 'kit-mute', id: 'kit-es-cel-a', text: 'Si es de otro país, escríbelo con su código.' })),
    el('label', { class: 'kit-check' }, ok, el('span', { text: 'Acepto que usen mis datos solo para avisarme si se libera un lugar (se borran pasado ese día).' })),
    err,
    el('div', { class: 'kit-btns' }, el('button', { class: 'kit-btn kit-btn--main', type: 'submit', text: 'Anotarme' }), el('button', { class: 'kit-btn', type: 'button', text: 'Cerrar', onclick: () => d.close() })));
  f.addEventListener('submit', (e) => {
    e.preventDefault(); err.textContent = '';
    const n = nom.value.trim().replace(/\s+/g, ' ');
    if (n.length < 2) { fallo(err, nom, 'Escribe tu nombre.'); return; }
    const c = celIntl(cel.value);
    if (!celValido(c)) { fallo(err, cel, 'Revisa tu celular: en Perú son 9 dígitos que empiezan con 9.'); return; }
    if (!ok.checked) { fallo(err, ok, 'Marca la casilla para que podamos avisarte.'); return; }
    const v = esperas();
    const mias = v.filter((x) => x.cel === c && x.estado === 'espera');
    if (!mias.some((x) => x.fecha === pedido.fecha && x.titulo === pedido.titulo)) {
      if (mias.length >= 2) { fallo(err, cel, 'Este número ya está en la lista de espera. Escríbenos por WhatsApp.'); return; }
      v.push({ id: 'E-' + hex(3).toUpperCase(), tipo: pedido.tipo, titulo: pedido.titulo, fecha: pedido.fecha, nombre: n.slice(0, 60), cel: c, estado: 'espera', creado: Date.now() });
      save('espera', v); avisar();
    }
    f.replaceChildren(el('p', { role: 'status', text: 'Listo: estás en la lista de espera. Si se libera un lugar, te escribimos por WhatsApp.' }), el('div', { class: 'kit-btns' }, cerrar()));
    f.querySelector('button')?.focus();
  });
  d = dialogo('Lista de espera', f);
  nom.focus();
}

// ---------- panel del negocio ----------
/** Panel con PIN de demo: registros por día, pagos y comprobantes, lista de espera, clientes y reporte del mes. */
export function panel(raiz: HTMLElement) {
  const OK = K('pin-ok');
  const dentro = () => { try { return sessionStorage.getItem(OK) === '1'; } catch { return false; } };
  const pinErr = el('p', { class: 'kit-err', role: 'alert' });
  const pin = el('input', { type: 'password', id: 'kit-pin', inputmode: 'numeric', maxlength: '12', autocomplete: 'off' });
  const formPin = el('form', { class: 'kit-card kit-pin', novalidate: true },
    el('div', { class: 'kit-campo' }, el('label', { for: 'kit-pin', text: `PIN de la demo: ${C.pinDemo}` }), pin), pinErr,
    el('button', { class: 'kit-btn kit-btn--main', type: 'submit', text: 'Entrar al panel' }));
  formPin.addEventListener('submit', (e) => {
    e.preventDefault();
    const lock = load<{ fallos: number; hasta: number }>('pin-lock', { fallos: 0, hasta: 0 });
    if (Date.now() < lock.hasta) { fallo(pinErr, pin, `Demasiados intentos. Espera ${Math.ceil((lock.hasta - Date.now()) / 1000)} segundos.`); return; }
    if (pin.value === C.pinDemo) { save('pin-lock', { fallos: 0, hasta: 0 }); try { sessionStorage.setItem(OK, '1'); } catch { /* */ } pin.value = ''; pintar(); raiz.querySelector<HTMLElement>('#kit-agenda-h')?.focus(); }
    else { lock.fallos++; if (lock.fallos >= 5) { lock.fallos = 0; lock.hasta = Date.now() + 60000; } save('pin-lock', lock); fallo(pinErr, pin, 'PIN incorrecto.'); }
  });
  let filtro = 'todos';
  let dia = hoyLima();
  const estado = el('p', { class: 'kit-mute', role: 'status' });
  const pintar = (foco?: string) => {
    if (!dentro()) { raiz.replaceChildren(formPin); return; }
    const todos = registros();
    const fechas = [...new Set(todos.filter((r) => r.fecha).map((r) => r.fecha!))].sort();
    const selDia = el('select', { id: 'kit-dia' }, el('option', { value: 'todos', text: 'Todos los días' }),
      ...[...new Set([hoyLima(), ...fechas])].sort().map((f) => el('option', { value: f, text: (f === hoyLima() ? 'Hoy, ' : '') + fechaLarga(f) })));
    selDia.value = filtro === 'todos' ? 'todos' : dia;
    selDia.addEventListener('change', () => { filtro = selDia.value === 'todos' ? 'todos' : 'dia'; dia = selDia.value === 'todos' ? dia : selDia.value; pintar('#kit-dia'); });
    const vis = todos.filter((r) => filtro === 'todos' || r.fecha === dia).sort((a, b) => (a.fecha ?? '9').localeCompare(b.fecha ?? '9') || (a.inicioMin ?? 0) - (b.inicioMin ?? 0) || b.creado - a.creado);
    const ul = el('ul', { class: 'kit-lista' });
    vis.forEach((r) => {
      const acts = el('div', { class: 'kit-btns' });
      const accion = (txt: string, fn: () => void) => acts.append(el('button', { type: 'button', class: 'kit-btn kit-btn--sm', text: txt, onclick: fn }));
      const cambiar = (estado: Estado) => { actualizar(r.codigo, (y) => { y.estado = estado; if (estado === 'cancelada') emitirNotaCredito(y); }); pintar(`[data-fila="${r.codigo}"] button`); toast('Actualizado.'); };
      if (r.estado === 'pendiente') accion(`Confirmar (${r.nombre})`, () => cambiar('confirmada'));
      if (r.estado === 'confirmada') accion(`${r.tipo === 'pedido' ? 'Marcar entregado' : r.tipo === 'matricula' ? 'Marcar matriculado' : r.tipo === 'suscripcion' ? 'Marcar cuenta activa' : r.tipo === 'llamada' ? 'Marcar llamada hecha' : 'Marcar atendido'} (${r.nombre})`, () => cambiar('atendida'));
      if (r.comprobante) accion(`Ver ${r.comprobante.tipo} ${r.comprobante.numero}`, () => verComprobante(r.codigo));
      if (r.estado === 'pendiente' || r.estado === 'confirmada') {
        if (r.cel) accion('Recordar por WhatsApp (demo)', () => mensajeWa(`Hola ${r.nombre.split(' ')[0]}, te recordamos tu ${nombreDe(r.tipo)} en ${C.negocio}: ${r.titulo}${r.fecha ? ', ' + cuando(r) : ''}. Código ${r.codigo}. Si no puedes ir, avísanos por aquí.`));
        const b = el('button', { type: 'button', class: 'kit-btn kit-btn--sm', text: 'Cancelar' });
        dobleToque(b, 'Cancelar', estado, () => cambiar('cancelada')); acts.append(b);
      }
      ul.append(el('li', { 'data-fila': r.codigo },
        el('span', { class: 'kit-lista__t', text: r.fecha ? (r.inicioMin !== undefined ? hora(r.inicioMin) : fechaLarga(r.fecha)) : nombreDe(r.tipo) }),
        el('div', {}, el('b', { text: r.nombre }), ' ', el('span', { class: 'kit-pill', text: ESTADOS[r.estado] }),
          r.pago ? el('span', { class: 'kit-pill', text: r.notaCredito ? 'Pago devuelto (simulado)' : `Pagó ${soles(r.pago.monto)} (simulado)` }) : null,
          r.canceloCliente ? el('span', { class: 'kit-pill', text: 'Canceló el cliente' }) : null,
          el('p', { class: 'kit-mute', text: [r.titulo, r.detalle, filtro === 'todos' && r.fecha ? fechaLarga(r.fecha) : null, r.cel ? `+${r.cel}` : null, r.codigo].filter(Boolean).join(' · ') }), acts)));
    });
    if (!vis.length) ul.append(el('li', {}, el('span', { class: 'kit-lista__t', text: '—' }), el('p', { class: 'kit-mute', text: 'Todavía no hay registros hechos desde la web. Haz una prueba en la página principal.' })));
    // lista de espera
    const es = esperas().filter((x) => x.estado !== 'quitado' && (filtro === 'todos' || x.fecha === dia));
    const ule = el('ul', { class: 'kit-lista' });
    es.forEach((x) => {
      const quitar = el('button', { type: 'button', class: 'kit-btn kit-btn--sm', text: `Quitar a ${x.nombre}` });
      dobleToque(quitar, `Quitar a ${x.nombre}`, estado, () => { const v = load<Espera[]>('espera', []); const y = v.find((z) => z.id === x.id); if (y) y.estado = 'quitado'; save('espera', v); pintar('#kit-espera-h'); toast('Quitado de la lista de espera.'); });
      ule.append(el('li', {}, el('span', { class: 'kit-lista__t', text: x.estado === 'avisado' ? 'Avisado' : 'En espera' }),
        el('div', {}, el('b', { text: x.nombre }), el('p', { class: 'kit-mute', text: `${x.titulo} · ${fechaLarga(x.fecha)} · +${x.cel}` }),
          el('div', { class: 'kit-btns' }, el('button', { type: 'button', class: 'kit-btn kit-btn--sm', text: `Avisar a ${x.nombre} (demo)`, onclick: () => {
            mensajeWa(`Hola ${x.nombre.split(' ')[0]}, te escribimos de ${C.negocio}: se liberó un lugar para ${x.titulo.toLowerCase()} el ${fechaLarga(x.fecha)}. Puedes reservarlo en nuestra web o respondernos por aquí.`);
            const v = load<Espera[]>('espera', []); const y = v.find((z) => z.id === x.id); if (y) y.estado = 'avisado'; save('espera', v); pintar('#kit-espera-h'); } }), quitar))));
    });
    if (!es.length) ule.append(el('li', {}, el('span', { class: 'kit-lista__t', text: '—' }), el('p', { class: 'kit-mute', text: 'Nadie en lista de espera. Se anotan cuando algo se llena.' })));
    // clientes
    const porCel = new Map<string, { nombre: string; n: number; atendidas: number; ultima: number; pagado: number }>();
    todos.forEach((r) => { const clave = r.cel || r.nombre.toLowerCase(); const v = porCel.get(clave) ?? { nombre: r.nombre, n: 0, atendidas: 0, ultima: 0, pagado: 0 };
      v.nombre = r.nombre; v.n++; if (r.estado === 'atendida') v.atendidas++; v.ultima = Math.max(v.ultima, r.creado); if (r.pago && !r.notaCredito) v.pagado += r.pago.monto; porCel.set(clave, v); });
    const ulc = el('ul', { class: 'kit-lista' });
    [...porCel.entries()].sort((a, b) => b[1].ultima - a[1].ultima).slice(0, 10).forEach(([cel, v]) => ulc.append(el('li', {},
      el('span', { class: 'kit-lista__t', text: `${v.n} ${v.n === 1 ? 'registro' : 'registros'}` }),
      el('div', {}, el('b', { text: v.nombre }), el('p', { class: 'kit-mute', text: [/^\d+$/.test(cel) ? `+${cel}` : null, `${v.atendidas} atendidos`, v.pagado ? `pagó ${soles(v.pagado)}` : null].filter(Boolean).join(' · ') })))));
    if (!porCel.size) ulc.append(el('li', {}, el('span', { class: 'kit-lista__t', text: '—' }), el('p', { class: 'kit-mute', text: 'Aún no hay clientes.' })));
    // reporte del mes
    const mes = hoyLima().slice(0, 7);
    const mesDe = (t: number) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit' }).format(new Date(t));
    const delMes = todos.filter((r) => mesDe(r.creado) === mes); // registros hechos este mes
    const cuenta = (f: (r: Registro) => boolean) => String(delMes.filter(f).length);
    const pagosMes = todos.filter((r) => r.pago && mesDe(r.pago.fecha) === mes);
    const cobrado = pagosMes.filter((r) => !r.notaCredito).reduce((a, r) => a + r.pago!.monto, 0);
    const devuelto = pagosMes.filter((r) => r.notaCredito).reduce((a, r) => a + r.pago!.monto, 0);
    const nombreMes = new Date(mes + '-15T12:00:00').toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
    const salir = el('button', { type: 'button', class: 'kit-btn', text: 'Salir del panel', onclick: () => { try { sessionStorage.removeItem(OK); } catch { /* */ } pintar(); pin.focus(); } });
    const borrar = el('button', { type: 'button', class: 'kit-btn', text: 'Borrar los datos de prueba' });
    dobleToque(borrar, 'Borrar los datos de prueba', estado, () => { try { Object.keys(localStorage).filter((k) => k.startsWith(K(''))).forEach((k) => localStorage.removeItem(k)); } catch { /* */ } avisar(); pintar('#kit-agenda-h'); toast('Datos de prueba borrados.'); });
    raiz.replaceChildren(estado,
      el('div', { class: 'kit-card' }, el('div', { class: 'kit-fila' }, el('h2', { class: 'kit-h', id: 'kit-agenda-h', tabindex: '-1', text: 'Registros' }),
        el('div', { class: 'kit-campo' }, el('label', { for: 'kit-dia', text: 'Día' }), selDia)), ul),
      el('div', { class: 'kit-grid' },
        el('div', { class: 'kit-card' }, el('h2', { class: 'kit-h', id: 'kit-espera-h', tabindex: '-1', text: 'Lista de espera' }), ule),
        el('div', { class: 'kit-card' }, el('h2', { class: 'kit-h', text: `Reporte de ${nombreMes}` }), lista([
          ['Registros hechos este mes', String(delMes.length)], ['Confirmados', cuenta((r) => r.estado === 'confirmada')], ['Atendidos', cuenta((r) => r.estado === 'atendida')],
          ['Cancelados', `${cuenta((r) => r.estado === 'cancelada')} (${cuenta((r) => !!r.canceloCliente)} por el cliente)`],
          ['Cobrado en línea (neto)', soles(cobrado)], ['Devoluciones', soles(devuelto)]]), el('p', { class: 'kit-mute', text: 'Pagos y comprobantes simulados en esta demo.' })),
        el('div', { class: 'kit-card kit-ancho' }, el('h2', { class: 'kit-h', text: 'Clientes' }), el('p', { class: 'kit-mute', text: 'Se arma solo con cada registro. En la web real queda en la base de datos del negocio.' }), ulc)),
      el('div', { class: 'kit-card' }, el('h2', { class: 'kit-h', text: 'Datos de prueba' }), el('p', { class: 'kit-mute', text: 'Todo lo que hiciste en esta demo está solo en tu navegador.' }), el('div', { class: 'kit-btns' }, borrar, salir)));
    if (foco) (raiz.querySelector<HTMLElement>(foco) ?? raiz.querySelector<HTMLElement>('#kit-agenda-h'))?.focus();
  };
  alCambiar(() => pintar());
  pintar();
}
function mensajeWa(texto: string) {
  dialogo('Mensaje de WhatsApp (demo)', el('div', {},
    el('p', { class: 'kit-mute', text: 'En la web real, este botón abre WhatsApp con el mensaje listo. Aquí solo lo mostramos, porque los clientes de la demo no existen.' }),
    el('div', { class: 'kit-wa', text: texto }), el('div', { class: 'kit-btns' }, cerrar())));
}

/** Oculta una barra fija (p. ej. «Reservar» en el celular) mientras se ve el formulario o la confirmación, para que no compita con el botón del formulario. */
export function ocultarBarraEn(barra: HTMLElement | null, zonas: (HTMLElement | null)[]) {
  if (!barra || !('IntersectionObserver' in window)) return;
  const visibles = new Set<Element>();
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target)));
    barra.classList.toggle('kit-oculta', visibles.size > 0);
  }, { threshold: 0 });
  zonas.forEach((z) => z && io.observe(z));
}

/** Llamar al cargar cada página (si se llama más de una vez, solo cuenta la primera). */
let iniciado = false;
export function iniciar(cfg: Config) {
  if (iniciado) return; // puede llamarse desde varios componentes de la misma página
  iniciado = true;
  C = { horasCancelar: 2, pinDemo: '2468', ...cfg };
  prepararToast();
  const ruta = () => { if (location.hash.startsWith('#cita=')) abrirMiRegistro(); };
  window.addEventListener('hashchange', ruta);
  ruta();
  // los datos de lista de espera de días pasados se borran
  save('espera', esperas());
}
