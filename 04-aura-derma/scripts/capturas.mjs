// Capturas a 360, 768 y 1440 px: inicio, comparador con 3 tratamientos y agenda con ocupados.
// Requiere el sitio corriendo (npm run preview, puerto 4334) y Edge instalado (channel: 'msedge').
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const base = process.env.BASE_URL ?? 'http://localhost:4334';
const salida = join(dirname(fileURLToPath(import.meta.url)), '..', 'capturas');
mkdirSync(salida, { recursive: true });

const anchos = [360, 768, 1440];
const navegador = await chromium.launch({ channel: 'msedge' });
let fallos = 0;

for (const ancho of anchos) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(`${base}/`, { waitUntil: 'networkidle' });
  // Carga las imágenes diferidas recorriendo la página y deja la cabecera fija como estática para las capturas.
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
    document.querySelector('.cab').style.position = 'static';
    document.querySelector('.barra-movil').style.display = 'none';
  });
  await p.waitForLoadState('networkidle');

  const desborde = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(`${ancho}px: desborde horizontal = ${desborde}`);
  if (desborde > 0) fallos++;

  await p.screenshot({ path: join(salida, `inicio-${ancho}.png`), fullPage: true });

  // Comparador con 3 tratamientos
  const comp = p.locator('#comparador');
  await comp.scrollIntoViewIfNeeded();
  await p.check('#comp-peeling');
  await p.locator('#tratamientos').screenshot({ path: join(salida, `comparador-${ancho}.png`) });

  // Agenda: especialista, primer día con cupos, y ocupados visibles
  await p.locator('#agenda').scrollIntoViewIfNeeded();
  await p.check('#ag-esp-quispe');
  const dia = p.locator('#ag-dias input:not([aria-disabled="true"])').nth(2);
  await dia.check();
  await p.waitForSelector('#ag-horas input');
  const ocupados = await p.locator('#ag-horas input[aria-disabled="true"]').count();
  console.log(`${ancho}px: horarios ocupados/no disponibles = ${ocupados}`);
  await p.locator('#agenda').screenshot({ path: join(salida, `agenda-${ancho}.png`) });

  await ctx.close();
}
await navegador.close();
process.exit(fallos ? 1 : 0);
