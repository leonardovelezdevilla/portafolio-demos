// Capturas a 360, 768 y 1440 px con playwright-core y el Edge instalado.
// Uso: levantar el sitio (npm run preview, puerto 4332) y ejecutar: node scripts/capturas.mjs
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:4332';
const salida = join(dirname(fileURLToPath(import.meta.url)), '..', 'capturas');
mkdirSync(salida, { recursive: true });

const anchos = [
  { w: 360, h: 800 },
  { w: 768, h: 1024 },
  { w: 1440, h: 900 },
];

const navegador = await chromium.launch({ channel: 'msedge' });
const problemas = [];

for (const { w, h } of anchos) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: h }, locale: 'es-PE', reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  p.on('console', (m) => ['error', 'warning'].includes(m.type()) && problemas.push(`[${w}] ${m.type()}: ${m.text()}`));
  p.on('pageerror', (e) => problemas.push(`[${w}] pageerror: ${e.message}`));

  const sinScroll = async (etiqueta) => {
    const r = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    if (r.sw > r.cw) problemas.push(`[${w}] scroll horizontal en ${etiqueta}: ${r.sw} > ${r.cw}`);
  };

  const cargarTodo = async () => {
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(500);
  };

  // 1. Inicio
  await p.goto(BASE + '/');
  await p.waitForLoadState('networkidle');
  await sinScroll('inicio');
  await cargarTodo();
  await p.screenshot({ path: join(salida, `${w}-inicio.png`), fullPage: true });

  // 2. Filtro aplicado (Skate + talla 41)
  await p.goto(BASE + '/?categoria=skate&talla=41#catalogo');
  await p.waitForLoadState('networkidle');
  await sinScroll('filtro');
  const estado = await p.locator('[data-estado]').innerText();
  console.log(`[${w}] estado filtro: ${estado}`);
  await p.locator('#catalogo').scrollIntoViewIfNeeded();
  await p.screenshot({ path: join(salida, `${w}-filtro.png`), fullPage: false });

  // 3. Vista rápida
  await p.goto(BASE + '/#catalogo');
  await p.waitForLoadState('networkidle');
  await p.locator('[data-vista-rapida="rafaga-air"]').click();
  await p.locator('#vista-rapida[open]').waitFor();
  await p.waitForTimeout(300);
  await p.screenshot({ path: join(salida, `${w}-vista-rapida.png`) });
  // Validación de talla obligatoria
  await p.locator('#vista-rapida button[type=submit]').click();
  const errVr = await p.locator('#vr-talla-error').innerText();
  console.log(`[${w}] error vista rápida: ${errVr}`);
  await p.locator('#vista-rapida label.opcion:has-text("41")').click();
  await p.locator('#vista-rapida button[type=submit]').click();
  await p.locator('[data-toast]:not([hidden])').waitFor();
  await p.screenshot({ path: join(salida, `${w}-aviso-agregado.png`) });

  // 4. Carrito abierto con 2 líneas y errores de formulario
  await p.locator('[data-vista-rapida="chapa-roja"]').click();
  await p.locator('#vista-rapida label.opcion:has-text("40")').click();
  await p.locator('#vista-rapida button[type=submit]').click();
  await p.locator('[data-toast-ver]').click();
  await p.locator('#carrito[open]').waitFor();
  await p.locator('#carrito [data-accion="mas"]').first().click();
  await p.waitForTimeout(200);
  await p.screenshot({ path: join(salida, `${w}-carrito.png`) });
  await p.locator('#carrito form button[type=submit]').click();
  await p.waitForTimeout(200);
  await p.locator('#carrito .carrito__cuerpo').evaluate((el) => (el.scrollTop = el.scrollHeight));
  await p.screenshot({ path: join(salida, `${w}-carrito-formulario.png`) });

  // 4b. Confirmación tras enviar el pedido
  await p.locator('#ped-nombre').fill('Ana Pérez');
  await p.locator('#ped-distrito').fill('Miraflores');
  await p.locator('#ped-referencia').fill('Av. Larco 123, frente al parque');
  await p.locator('#carrito label.opcion:has-text("Yape")').click();
  await p.locator('#carrito .check').click();
  p.context().on('page', (n) => n.close().catch(() => {}));
  await p.locator('#carrito form button[type=submit]').click();
  await p.locator('[data-confirmacion]:not([hidden])').waitFor();
  await p.waitForTimeout(200);
  await p.screenshot({ path: join(salida, `${w}-pedido-confirmacion.png`) });

  // 5. Página de producto
  await p.keyboard.press('Escape');
  await p.goto(BASE + '/producto/violeta-pro/');
  await p.waitForLoadState('networkidle');
  await sinScroll('producto');
  await cargarTodo();
  await p.screenshot({ path: join(salida, `${w}-producto.png`), fullPage: true });

  await ctx.close();
}

await navegador.close();
if (problemas.length) {
  console.log('PROBLEMAS:\n' + problemas.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Capturas listas, sin scroll horizontal ni errores de consola.');
}
