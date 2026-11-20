import { chromium } from 'playwright-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const salida = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'capturas');
const base = process.env.BASE ?? 'http://localhost:4331';
const nav = await chromium.launch({ channel: 'msedge' });
let problemas = 0;
for (const [w, h] of [[320, 700], [360, 780], [768, 1024], [1440, 900]]) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h } });
  const pag = await ctx.newPage();
  const errores = [];
  pag.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  pag.on('pageerror', (e) => errores.push(String(e)));
  await pag.goto(base + '/');
  await pag.evaluate(() => document.fonts.ready);
  const desborde = await pag.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (desborde > 0) { console.log(`DESBORDE ${w}px: ${desborde}`); problemas++; }
  await pag.screenshot({ path: path.join(salida, `inicio-${w}.png`), fullPage: true });
  // interacción clave: calculadora con ingreso alto
  await pag.fill('#ingreso', '10000');
  await pag.fill('#recibos', '1');
  await pag.locator('#calculadora').screenshot({ path: path.join(salida, `calculadora-${w}.png`) });
  // precios anual
  await pag.check('#p-anual', { force: true });
  await pag.locator('#precios').screenshot({ path: path.join(salida, `precios-anual-${w}.png`) });
  if (errores.length) { console.log(`Errores ${w}:`, errores); problemas++; }
  await pag.goto(base + '/libro-reclamaciones/');
  const d2 = await pag.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (d2 > 0) { console.log(`DESBORDE libro ${w}px: ${d2}`); problemas++; }
  await pag.screenshot({ path: path.join(salida, `libro-reclamaciones-${w}.png`), fullPage: true });
  await ctx.close();
}
await nav.close();
console.log(problemas ? 'Con problemas' : 'Capturas OK, sin scroll horizontal ni errores de consola');
