// Capturas a 360, 768 y 1440 px: inicio, cotizador (paso 2 y resultado), reserva y seguimiento.
// Requiere el sitio en http://localhost:4338 (npm run preview). Usa Edge instalado (sin descargar navegadores).
import { chromium } from 'playwright-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.env.BASE ?? 'http://localhost:4338';
const salida = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'capturas');
const navegador = await chromium.launch({ channel: 'msedge' });
const problemas = [];

for (const w of [360, 768, 1440]) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: w === 1440 ? 900 : 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => problemas.push(`${w}: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && problemas.push(`${w}: ${m.text()}`));

  for (const ruta of ['/', '/privacidad/', '/terminos/', '/libro-reclamaciones/']) {
    await page.goto(base + ruta);
    if (!(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))) problemas.push(`${w}${ruta}: scroll horizontal`);
  }
  await page.goto(base + '/');
  await page.evaluate(() => document.fonts.ready);
  for (let y = 0; y < (await page.evaluate(() => document.documentElement.scrollHeight)); y += 400) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(40); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(salida, `${w}-inicio.png`), fullPage: true });

  // Cotizador paso 2 y resultado
  await page.locator('.op:has(input[value="suv"])').click();
  await page.locator('#cot-sig').click();
  await page.locator('#km').fill('64 500');
  await page.locator('#cotizador').scrollIntoViewIfNeeded();
  await page.locator('#cotizador').screenshot({ path: path.join(salida, `${w}-cotizador-paso2.png`) });
  await page.locator('#cot-sig').click();
  await page.locator('.op:has(input[value="aceite"])').click();
  await page.locator('.op:has(input[value="frenos"])').click();
  await page.locator('.op:has(input[value="diagnostico"])').click();
  await page.locator('#cot-sig').click();
  await page.waitForSelector('#cot-resultado:not([hidden])');
  await page.locator('#cot-consent').check();
  const wa = await page.locator('#cot-wa').getAttribute('href');
  if (!wa?.startsWith('https://wa.me/51900000000?text=')) problemas.push(`${w}: wa.me del cotizador inválido`);
  await page.locator('#cotizador').screenshot({ path: path.join(salida, `${w}-cotizador-resultado.png`) });

  // Reserva: primero con errores, luego válida
  await page.locator('#res-form button[type="submit"]').click();
  if (!(await page.evaluate(() => document.activeElement?.id === 'r-nombre'))) problemas.push(`${w}: el foco no fue al primer campo inválido`);
  await page.locator('#r-nombre').fill('Carlos');
  await page.locator('#r-cel').fill('900000000');
  await page.locator('#r-veh').selectOption('suv');
  await page.locator('#r-placa').fill('abc123');
  await page.locator('#r-serv').selectOption('frenos');
  const valores = await page.locator('#r-fecha option:not([value=""])').evaluateAll((os) => os.map((o) => o.value));
  for (const v of valores) {
    await page.locator('#r-fecha').selectOption(v);
    if (await page.locator('#r-turnos-lista input:not([aria-disabled="true"])').count()) break;
  }
  await page.locator('#r-turnos-lista input:not([aria-disabled="true"])').first().check({ force: true });
  await page.locator('#r-consent').check();
  await page.locator('#reserva').scrollIntoViewIfNeeded();
  await page.locator('#reserva').screenshot({ path: path.join(salida, `${w}-reserva.png`) });
  await page.locator('#res-form button[type="submit"]').click();
  await page.waitForSelector('#res-ok:not([hidden])');
  const wa2 = await page.locator('#res-wa').getAttribute('href');
  if (!wa2?.startsWith('https://wa.me/51900000000?text=')) problemas.push(`${w}: wa.me de la reserva inválido`);
  await page.locator('#reserva').screenshot({ path: path.join(salida, `${w}-reserva-confirmacion.png`) });

  // Seguimiento
  await page.locator('#seg-codigo').fill('tr-demo-1002');
  await page.locator('#seg-form button[type="submit"]').click();
  await page.waitForSelector('#seg-res:not([hidden])');
  await page.locator('#seguimiento').scrollIntoViewIfNeeded();
  await page.locator('#seguimiento').screenshot({ path: path.join(salida, `${w}-seguimiento.png`) });
  await ctx.close();
}
await navegador.close();
console.log(problemas.length ? 'PROBLEMAS:\n' + problemas.join('\n') : 'Capturas listas, sin problemas');
