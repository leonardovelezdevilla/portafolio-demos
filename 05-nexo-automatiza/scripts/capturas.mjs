// Capturas a 360, 768 y 1440 px: inicio, casos filtrados con modal, cotizador paso 2 y resultado.
// Requiere el sitio en http://localhost:4335 (npm run preview). Usa Edge instalado (sin descargar navegadores).
import { chromium } from 'playwright-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.env.BASE ?? 'http://localhost:4335';
const salida = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'capturas');
const anchos = [360, 768, 1440];
const navegador = await chromium.launch({ channel: 'msedge' });
const problemas = [];

// Recorre la página para disparar las animaciones de scroll y espera a que terminen.
async function recorrer(page) {
  await page.evaluate(() => document.fonts.ready);
  const alto = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < alto; y += 300) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.waitForFunction(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations !== Infinity).length === 0);
}

for (const w of anchos) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: w === 1440 ? 900 : 800 }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => problemas.push(`${w}: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && problemas.push(`${w}: ${m.text()}`));
  await page.goto(base + '/');
  await recorrer(page);

  const sinScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  if (!sinScroll) problemas.push(`${w}: scroll horizontal`);
  await page.screenshot({ path: path.join(salida, `${w}-inicio.png`), fullPage: true });

  // Casos filtrados + modal
  await page.locator('.chip[data-sector="salud"]').click();
  await page.locator('#casos').scrollIntoViewIfNeeded();
  await page.locator('#lista-casos .caso:not([hidden]) [data-abrir]').first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(salida, `${w}-casos-modal.png`) });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const foco = await page.evaluate(() => document.activeElement?.hasAttribute('data-abrir'));
  if (!foco) problemas.push(`${w}: el foco no volvió al botón tras Escape`);

  // Cotizador paso 2
  await page.locator('#cotizador').scrollIntoViewIfNeeded();
  await page.locator('.op:has(input[value="retail"])').click();
  await page.locator('#btn-sig').click();
  await page.locator('.op:has(input[value="whatsapp"])').click();
  await page.locator('.op:has(input[value="inventario"])').click();
  await page.locator('#cotizador').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.locator('#cotizador').screenshot({ path: path.join(salida, `${w}-cotizador-paso2.png`) });

  // Resultado
  await page.locator('#btn-sig').click();
  await page.locator('.op:has(input[value="medio"])').click();
  await page.locator('#btn-sig').click();
  await page.locator('.op:has(input[value="crm"])').click();
  await page.locator('#btn-sig').click();
  await page.locator('.op:has(input[value="prioritaria"])').click();
  await page.locator('#btn-sig').click();
  await page.waitForSelector('#resultado:not([hidden])');
  await page.waitForTimeout(300);
  await page.locator('#cotizador').screenshot({ path: path.join(salida, `${w}-cotizador-resultado.png`) });
  await page.locator('#res-consent').check();
  const wa = await page.locator('#res-wa').getAttribute('href');
  if (!wa?.startsWith('https://wa.me/51900000000?text=')) problemas.push(`${w}: enlace wa.me inválido`);
  await ctx.close();
}
await navegador.close();
console.log(problemas.length ? 'PROBLEMAS:\n' + problemas.join('\n') : 'Capturas listas, sin problemas');
