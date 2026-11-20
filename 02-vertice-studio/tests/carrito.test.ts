import { describe, expect, it } from 'vitest';
import {
  agregar, cambiarCantidad, cargar, costoEnvio, CLAVE_STORAGE, deserializar, guardar, quitar,
  serializar, subtotal, totales, totalUnidades, type Linea,
} from '../src/lib/carrito';
import { productos } from '../src/data/productos';
import { armarMensaje, urlWhatsApp } from '../src/lib/whatsapp';
import { validarPedido, validarReclamo, numeroHoja } from '../src/lib/validacion';
import { coincide, escribirParams, filtrar, leerParams } from '../src/lib/filtros';

const cat = productos;
const nodo = productos.find((p) => p.slug === 'nodo-91')!; // S/ 249
const trama = productos.find((p) => p.slug === 'trama-run')!; // S/ 219

describe('carrito: líneas y cantidades', () => {
  it('agrega y acumula la misma talla', () => {
    let l: Linea[] = [];
    l = agregar(l, cat, 'nodo-91', 40);
    l = agregar(l, cat, 'nodo-91', 40);
    expect(l).toEqual([{ slug: 'nodo-91', talla: 40, cantidad: 2 }]);
  });
  it('tallas distintas son líneas distintas', () => {
    let l = agregar([], cat, 'nodo-91', 40);
    l = agregar(l, cat, 'nodo-91', 41);
    expect(l).toHaveLength(2);
    expect(totalUnidades(l)).toBe(2);
  });
  it('no supera el stock ni agrega tallas agotadas o inexistentes', () => {
    let l = agregar([], cat, 'nodo-91', 44, 5); // stock 1
    expect(l[0].cantidad).toBe(1);
    expect(agregar(l, cat, 'nodo-91', 42)).toEqual(l); // stock 0
    expect(agregar(l, cat, 'nodo-91', 36)).toEqual(l); // no existe
    expect(agregar(l, cat, 'no-existe', 40)).toEqual(l);
  });
  it('cambia cantidad con tope de stock y quita al llegar a 0', () => {
    let l = agregar([], cat, 'nodo-91', 40);
    l = cambiarCantidad(l, cat, 'nodo-91', 40, 99);
    expect(l[0].cantidad).toBe(5);
    l = cambiarCantidad(l, cat, 'nodo-91', 40, 0);
    expect(l).toEqual([]);
  });
  it('quitar elimina solo la línea indicada', () => {
    let l = agregar([], cat, 'nodo-91', 40);
    l = agregar(l, cat, 'trama-run', 41);
    expect(quitar(l, 'nodo-91', 40)).toEqual([{ slug: 'trama-run', talla: 41, cantidad: 1 }]);
  });
  it('no muta el arreglo original', () => {
    const l: Linea[] = [{ slug: 'nodo-91', talla: 40, cantidad: 1 }];
    agregar(l, cat, 'nodo-91', 40);
    expect(l[0].cantidad).toBe(1);
  });
});

describe('carrito: totales y envío', () => {
  const l: Linea[] = [
    { slug: 'nodo-91', talla: 40, cantidad: 2 },
    { slug: 'trama-run', talla: 41, cantidad: 1 },
  ];
  it('calcula el subtotal', () => {
    expect(subtotal(l, cat)).toBe(nodo.precio * 2 + trama.precio);
  });
  it('Lima: S/ 10 bajo S/ 299 y gratis desde S/ 299', () => {
    expect(costoEnvio('lima', 298.99)).toBe(10);
    expect(costoEnvio('lima', 299)).toBe(0);
  });
  it('provincias: S/ 25 bajo S/ 499 y gratis desde S/ 499', () => {
    expect(costoEnvio('provincias', 498)).toBe(25);
    expect(costoEnvio('provincias', 499)).toBe(0);
  });
  it('carrito vacío no cobra envío', () => {
    expect(totales([], cat, 'lima')).toEqual({ subtotal: 0, envio: 0, total: 0 });
  });
  it('total = subtotal + envío', () => {
    const solo = [{ slug: 'trama-run', talla: 41, cantidad: 1 }];
    expect(totales(solo, cat, 'lima')).toEqual({ subtotal: 219, envio: 10, total: 229 });
    expect(totales(solo, cat, 'provincias')).toEqual({ subtotal: 219, envio: 25, total: 244 });
    expect(totales(l, cat, 'lima')).toEqual({ subtotal: 717, envio: 0, total: 717 });
  });
});

describe('carrito: persistencia serializada', () => {
  const l: Linea[] = [{ slug: 'nodo-91', talla: 40, cantidad: 2 }];
  it('ida y vuelta', () => {
    expect(deserializar(serializar(l), cat)).toEqual(l);
  });
  it('JSON dañado, versión distinta o vacío devuelven []', () => {
    expect(deserializar('{no es json', cat)).toEqual([]);
    expect(deserializar(JSON.stringify({ v: 9, lineas: l }), cat)).toEqual([]);
    expect(deserializar(null, cat)).toEqual([]);
  });
  it('descarta líneas manipuladas y recorta al stock', () => {
    const sucio = JSON.stringify({
      v: 1,
      lineas: [
        { slug: 'nodo-91', talla: 44, cantidad: 500 },
        { slug: 'fantasma', talla: 40, cantidad: 1 },
        { slug: 'nodo-91', talla: 'x', cantidad: 1 },
        null,
      ],
    });
    expect(deserializar(sucio, cat)).toEqual([{ slug: 'nodo-91', talla: 44, cantidad: 1 }]);
  });
  it('guardar y cargar con un almacén en memoria', () => {
    const mem = new Map<string, string>();
    const almacen = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
    expect(guardar(l, almacen)).toBe(true);
    expect(mem.has(CLAVE_STORAGE)).toBe(true);
    expect(cargar(cat, almacen)).toEqual(l);
  });
  it('si el almacenamiento lanza (modo privado), no rompe', () => {
    const roto = { getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('bloqueado'); } };
    expect(guardar(l, roto)).toBe(false);
    expect(cargar(cat, roto)).toEqual([]);
  });
});

describe('mensaje de WhatsApp', () => {
  const lineas: Linea[] = [
    { slug: 'nodo-91', talla: 40, cantidad: 2 },
    { slug: 'trama-run', talla: 41, cantidad: 1 },
  ];
  const datos = { nombre: ' Ana Pérez ', distrito: 'Miraflores', referencia: 'Av. Larco 123, frente al parque', pago: 'Yape' };
  const msg = armarMensaje(datos, lineas, cat, 'lima');
  it('incluye detalle, totales y datos del cliente', () => {
    expect(msg).toContain('2 x Nodo 91 (talla EU 40) = S/ 498.00');
    expect(msg).toContain('1 x Trama Run (talla EU 41) = S/ 219.00');
    expect(msg).toContain('Subtotal: S/ 717.00');
    expect(msg).toContain('Envío Lima Metropolitana: Gratis');
    expect(msg).toContain('Total: S/ 717.00');
    expect(msg).toContain('Nombre: Ana Pérez');
    expect(msg).toContain('Distrito: Miraflores');
    expect(msg).toContain('Pago: Yape');
  });
  it('muestra el costo de envío cuando no es gratis', () => {
    const m = armarMensaje(datos, [{ slug: 'trama-run', talla: 41, cantidad: 1 }], cat, 'provincias');
    expect(m).toContain('Envío Provincias: S/ 25.00');
    expect(m).toContain('Total: S/ 244.00');
  });
  it('la URL usa wa.me con el texto codificado y se puede decodificar', () => {
    const url = urlWhatsApp(msg);
    expect(url.startsWith('https://wa.me/51900000000?text=')).toBe(true);
    expect(decodeURIComponent(url.split('?text=')[1])).toBe(msg);
    expect(url).not.toContain('\n');
  });
});

describe('validación en español', () => {
  it('pedido válido no tiene errores', () => {
    expect(validarPedido({ nombre: 'Ana Pérez', distrito: 'Surco', referencia: 'Jr. Lima 456 piso 2', pago: 'Plin', acepta: 'si' })).toEqual({});
  });
  it('pedido vacío devuelve mensajes en español', () => {
    const e = validarPedido({ nombre: '', distrito: '', referencia: '', pago: '', acepta: '' });
    expect(e.acepta).toBeTruthy();
    expect(e.nombre).toBe('Escribe tu nombre.');
    expect(e.distrito).toBeTruthy();
    expect(e.referencia).toBeTruthy();
    expect(e.pago).toBe('Elige un método de pago.');
  });
  it('rechaza nombres con números y pagos no permitidos', () => {
    const e = validarPedido({ nombre: 'A1', distrito: 'Surco', referencia: 'Jr. Lima 456', pago: 'Bitcoin', acepta: 'si' });
    expect(e.nombre).toBeTruthy();
    expect(e.pago).toBeTruthy();
  });
  it('reclamo: DNI, celular y correo', () => {
    const base = {
      nombre: 'Luis Quispe Rojas', dni: '12345678', email: 'luis@ejemplo.invalid', telefono: '900000000',
      domicilio: 'Av. Siempre Viva 742', menor: '', apoderado: '', bien: 'producto', descripcionBien: 'Chapa Roja talla 41', acepta: 'si', monto: '249.90', tipo: 'reclamo',
      detalle: 'La talla recibida no corresponde a la pedida.', pedido: 'Cambio de talla',
    };
    expect(validarReclamo(base)).toEqual({});
    const e = validarReclamo({ ...base, dni: '123', email: 'x', telefono: '800000000', detalle: 'corto' });
    expect(Object.keys(e).sort()).toEqual(['detalle', 'dni', 'email', 'telefono']);
  });
  it('reclamo: menor de edad exige apoderado y descripción del bien', () => {
    const base = { nombre: 'Luis Quispe Rojas', dni: '12345678', email: 'luis@ejemplo.invalid', telefono: '900000000', domicilio: 'Av. Siempre Viva 742', menor: 'si', apoderado: '', bien: 'producto', descripcionBien: '', acepta: 'si', monto: '', tipo: 'queja', detalle: 'La atención por WhatsApp fue muy lenta.', pedido: 'Una disculpa y seguimiento' };
    expect(Object.keys(validarReclamo(base)).sort()).toEqual(['apoderado', 'descripcionBien']);
  });
  it('número de hoja con formato y año', () => {
    expect(numeroHoja(new Date('2026-05-01T00:00:00Z'), () => 0.000042)).toBe('LR-2026-000042');
  });
});

describe('filtros', () => {
  it('por categoría y talla con stock', () => {
    const f = filtrar(productos, { categoria: 'skate', talla: null });
    expect(f.map((p) => p.slug).sort()).toEqual(['chapa-roja', 'lona-azul']);
    expect(coincide(nodo, { categoria: null, talla: 42 })).toBe(false); // talla 42 sin stock
    expect(coincide(nodo, { categoria: 'urbana', talla: 40 })).toBe(true);
  });
  it('parámetros de URL ida y vuelta y descarte de valores inválidos', () => {
    expect(escribirParams({ categoria: 'running', talla: 41 })).toBe('?categoria=running&talla=41');
    expect(escribirParams({ categoria: null, talla: null })).toBe('');
    expect(leerParams('?categoria=skate&talla=40')).toEqual({ categoria: 'skate', talla: 40 });
    expect(leerParams('?categoria=zzz&talla=99')).toEqual({ categoria: null, talla: null });
  });
});
