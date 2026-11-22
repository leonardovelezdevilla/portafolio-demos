// Capturas a 360, 768 y 1440 px con playwright-core y el Edge instalado (sin descargar navegadores).
// Uso: levantar el sitio (npm run preview, puerto 4341) y ejecutar: node scripts/capturas.mjs
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:4341';
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
  const cargarTodo = async () => {
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
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

  // Para las capturas de secciones, la cabecera y la barra fijas se vuelven estáticas (si no, tapan el contenido).
  await p.addStyleTag({ content: '.cabecera,.barra-movil{position:static !important}' });

  // 2. Urgencias
  await p.locator('#urgencias').screenshot({ path: join(salida, `${w}-urgencias.png`) });

  // 3. Guía de vacunación: perro de 8 semanas
  await p.locator('input[name="especie"][value="perro"]').first().evaluate((e) => e.click());
  await p.locator('#g-edad').fill('8');
  await p.locator('#g-unidad').selectOption('semanas');
  await p.locator('[data-form-guia] button[type="submit"]').click();
  await p.waitForTimeout(300);
  await sinScroll('guía');
  await p.locator('#guia-vacunas').screenshot({ path: join(salida, `${w}-guia-vacunas.png`) });
  const foco = await p.evaluate(() => document.activeElement?.getAttribute('data-resultado') !== null);
  if (!foco) problemas.push(`[${w}] el foco no pasó al resultado de la guía`);

  // 4. Reserva con error: envío vacío
  await p.locator('[data-form-reserva] button[type="submit"]').click();
  await p.waitForTimeout(300);
  await sinScroll('reserva con error');
  await p.locator('#reserva').screenshot({ path: join(salida, `${w}-reserva-error.png`) });
  // Desde el rediseño el foco va al resumen de errores (tabindex=-1), que enlaza a cada campo.
  const alFoco = await p.evaluate(() => { const a = document.activeElement; return a?.matches('[data-resumen], [role="group"], .resumen-errores, [tabindex="-1"]') && /corregir/i.test(a.textContent || '') ? 'resumen' : a?.getAttribute('name'); });
  if (alFoco !== 'resumen') problemas.push(`[${w}] el foco debía ir al resumen de errores y fue: ${alFoco}`);

  // 5. Reserva con éxito: consulta con la última hora libre de un día dentro de 3 días
  await p.locator('[data-form-reserva] input[name="servicio"][value="consulta"]').evaluate((e) => e.click());
  await p.locator('[data-form-reserva] input[name="especie"][value="gato"]').evaluate((e) => e.click());
  await p.locator('#r-mascota').fill('Mishi');
  await p.locator('#r-edad').fill('4');
  await p.locator('#r-unidad').selectOption('meses');
  await p.locator('#r-dueno').fill('María Quispe');
  await p.locator('#r-cel').fill('987 654 321');
  const dia = await p.evaluate(() => {
    const d = new Date(Date.now() - 5 * 3600 * 1000 + 3 * 86400 * 1000);
    return d.toISOString().slice(0, 10);
  });
  await p.locator('#r-fecha').fill(dia);
  await p.locator('#r-fecha').dispatchEvent('change');
  const horaLibre = await p.locator('#r-hora option:not([disabled])').nth(3).getAttribute('value');
  await p.locator('#r-hora').selectOption(horaLibre);
  await p.locator('#r-sintomas').fill('Estornuda desde ayer');
  await p.locator('[data-form-reserva] input[name="acepta"]').check();
  await p.locator('[data-form-reserva] button[type="submit"]').click();
  await p.waitForTimeout(300);
  await sinScroll('reserva con éxito');
  const wa = await p.locator('[data-wa]').getAttribute('href');
  const texto = decodeURIComponent(wa.split('text=')[1] ?? '');
  if (/Estornuda|987/.test(texto)) problemas.push(`[${w}] el mensaje de WhatsApp lleva datos sensibles: ${texto}`);
  if (w === 360) console.log('WhatsApp:', texto);
  await p.locator('#reserva').screenshot({ path: join(salida, `${w}-reserva-exito.png`) });

  // 6. Libro de reclamaciones (revisión de scroll)
  await p.goto(BASE + '/libro-reclamaciones/');
  await sinScroll('libro de reclamaciones');
  await ctx.close();
}
await navegador.close();
if (problemas.length) { console.log('PROBLEMAS:\n' + problemas.join('\n')); process.exitCode = 1; } else console.log('Capturas listas, sin problemas.');
