// Capturas a 360, 768 y 1440 px con playwright-core y el Edge instalado (sin descargar navegadores).
// Uso: levantar el sitio (npm run preview, puerto 4337) y ejecutar: node scripts/capturas.mjs
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:4337';
const salida = join(dirname(fileURLToPath(import.meta.url)), '..', 'capturas');
mkdirSync(salida, { recursive: true });

const anchos = [{ w: 360, h: 800 }, { w: 768, h: 1024 }, { w: 1440, h: 900 }];
const navegador = await chromium.launch({ channel: 'msedge' });
const problemas = [];

for (const { w, h } of anchos) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: h }, locale: 'es-PE', timezoneId: 'America/Lima', reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  p.on('console', (m) => ['error', 'warning'].includes(m.type()) && problemas.push(`[${w}] ${m.type()}: ${m.text()}`));
  p.on('pageerror', (e) => problemas.push(`[${w}] pageerror: ${e.message}`));
  const sinScroll = async (et) => {
    const r = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    if (r.sw > r.cw) problemas.push(`[${w}] scroll horizontal en ${et}: ${r.sw} > ${r.cw}`);
  };
  const paso = (i) => p.locator('.wiz-nav__btn').nth(i).click();
  const cargarTodo = async () => {
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); }
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(400);
  };

  // 1. Inicio
  await p.goto(BASE + '/');
  await p.waitForLoadState('networkidle');
  await sinScroll('inicio');
  await cargarTodo();
  await p.screenshot({ path: join(salida, `${w}-inicio.png`), fullPage: true });

  // 2. Configurador con precio: 24 porciones, red velvet, lúcuma, fondant, flores + frutas, mensaje
  await p.goto(BASE + '/#configurador');
  await p.waitForLoadState('networkidle');
  await p.locator('.wiz-nav__btn').first().waitFor();
  await p.locator('input[name="tamano"][value="24"]').evaluate((e) => e.click());
  await p.locator('input[name="bizcocho"][value="red-velvet"]').evaluate((e) => e.click());
  await p.locator('input[name="relleno"][value="lucuma"]').evaluate((e) => e.click());
  await p.locator('input[name="cobertura"][value="fondant"]').evaluate((e) => e.click());
  await p.locator('input[name="decoracion"][value="flores"]').evaluate((e) => e.click());
  await p.locator('input[name="decoracion"][value="frutas"]').evaluate((e) => e.click());
  await paso(2);
  await p.locator('#mensaje').fill('Feliz cumple, Lucía!');
  await p.waitForTimeout(300);
  console.log(`[${w}] total configurador: ${await p.locator('[data-total]').innerText()}`);
  await sinScroll('configurador');
  if (w === 360) {
    await p.locator('#mensaje').scrollIntoViewIfNeeded();
    await p.screenshot({ path: join(salida, `${w}-barra-movil.png`) });
  }
  await p.locator('#configurador').screenshot({ path: join(salida, `${w}-configurador.png`) });

  // 3. Fecha inválida: mañana (menos de 48 h) con delivery
  await paso(3);
  await p.locator('#nombre').fill('Lucía Paredes');
  await p.locator('input[name="entrega"][value="delivery"]').evaluate((e) => e.click());
  await p.locator('#distrito').selectOption('Lince');
  await p.locator('#direccion').fill('Av. Ejemplo 123, piso 2');
  const manana = await p.evaluate(() => {
    const d = new Date(Date.now() + 24 * 3600 * 1000 - 5 * 3600 * 1000);
    return d.toISOString().slice(0, 10);
  });
  await p.locator('#fecha').fill(manana);
  await p.locator('#fecha').dispatchEvent('change');
  await p.locator('button[type="submit"]').click();
  await p.waitForTimeout(300);
  await sinScroll('fecha inválida');
  await p.locator('#entrega').screenshot({ path: join(salida, `${w}-fecha-invalida.png`) });

  // 4. Pedido listo: primera fecha disponible, hora, consentimiento
  const minimo = await p.locator('#fecha').getAttribute('min');
  await p.locator('#fecha').fill(minimo);
  await p.locator('#fecha').dispatchEvent('change');
  await p.locator('#hora').selectOption({ index: 2 });
  await p.locator('input[name="acepta"]').check();
  const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 4000 }).catch(() => null), p.locator('button[type="submit"]').click()]);
  if (popup) await popup.close();
  await p.locator('[data-confirmacion]:not([hidden])').waitFor();
  await sinScroll('pedido listo');
  await p.locator('[data-confirmacion]').screenshot({ path: join(salida, `${w}-pedido-listo.png`) });

  await ctx.close();
}
await navegador.close();
if (problemas.length) { console.log('PROBLEMAS:\n' + problemas.join('\n')); process.exitCode = 1; } else console.log('Capturas listas, sin problemas.');
