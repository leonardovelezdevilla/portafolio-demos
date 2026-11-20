// Capturas a 360, 768 y 1440 px: inicio, horario filtrado, reserva con errores y reserva con éxito.
// Requiere el sitio sirviéndose en http://localhost:4336 (npm run preview) y Microsoft Edge instalado.
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const aqui = dirname(fileURLToPath(import.meta.url));
const salida = join(aqui, '..', 'capturas');
const BASE = process.env.BASE ?? 'http://localhost:4336';
const anchos = [360, 768, 1440];

const navegador = await chromium.launch({ channel: 'msedge' });
let problemas = 0;

for (const w of anchos) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: w === 1440 ? 900 : 800 }, locale: 'es-PE', timezoneId: 'America/Lima', reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);

  const desborde = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (desborde > 0) { problemas++; console.log(`DESBORDE horizontal a ${w}px: ${desborde}px`); }

  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(300);
  await p.screenshot({ path: join(salida, `inicio-${w}.png`), fullPage: true });

  // La cabecera fija taparía las capturas de secciones: se vuelve estática solo para fotografiar.
  await p.addStyleTag({ content: '.cabecera{position:static!important}.barra-movil{display:none!important}' });

  // Horario filtrado: reformer + nivel inicial
  if (!(await p.locator('[data-filtros]').evaluate((d) => d.open))) await p.click('[data-filtros] summary');
  await p.click('[data-grupo="tipo"] button[data-valor="reformer"]');
  await p.click('[data-grupo="nivel"] button[data-valor="inicial"]');
  await p.locator('#horario').scrollIntoViewIfNeeded();
  await p.locator('#horario').screenshot({ path: join(salida, `horario-filtrado-${w}.png`) });
  console.log(`${w}px estado horario:`, await p.textContent('[data-estado]'));
  await p.click('[data-limpiar]');

  // Reserva con errores: envío vacío; el foco debe ir al primer campo inválido
  await p.click('#form-reserva button[type="submit"]');
  await p.waitForTimeout(150);
  const foco = await p.evaluate(() => document.activeElement?.id);
  if (foco !== 'ocurrencia') { problemas++; console.log('El foco no fue al primer campo inválido:', foco); }
  await p.locator('#reserva').screenshot({ path: join(salida, `reserva-errores-${w}.png`) });

  // Reserva con éxito: primera clase con cupos
  await p.check('input[name="primeraVez"][value="si"]');
  const valor = await p.evaluate(() => [...document.querySelectorAll('#ocurrencia option')].find((o) => o.value && !o.disabled)?.value);
  await p.selectOption('#ocurrencia', valor);
  await p.fill('#nombre', 'Lucía Paredes');
  await p.fill('#celular', '987 654 321');
  await p.check('input[name="lesion"][value="no"]');
  await p.check('#consentimiento');
  await p.click('#form-reserva button[type="submit"]');
  await p.waitForSelector('[data-exito]:not([hidden])');
  await p.waitForTimeout(150);
  await p.locator('#reserva').screenshot({ path: join(salida, `reserva-exito-${w}.png`) });
  const wa = await p.getAttribute('[data-e-wa]', 'href');
  if (!wa.startsWith('https://wa.me/51900000000?text=')) { problemas++; console.log('wa.me incorrecto', wa); }

  if (errores.length) { problemas++; console.log(`Errores de consola a ${w}px:`, errores); }
  await ctx.close();
}

// Páginas secundarias a 360 px y comprobación de href="#"
const ctx = await navegador.newContext({ viewport: { width: 360, height: 800 } });
const p = await ctx.newPage();
for (const ruta of ['/', '/privacidad/', '/terminos/', '/libro-reclamaciones/', '/pagina-que-no-existe/']) {
  await p.goto(`${BASE}${ruta}`, { waitUntil: 'networkidle' });
  const d = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (d > 0) { problemas++; console.log(`DESBORDE en ${ruta}: ${d}px`); }
  const vacios = await p.evaluate(() => document.querySelectorAll('a[href="#"]').length);
  if (vacios) { problemas++; console.log(`href="#" en ${ruta}`); }
}
await p.goto(`${BASE}/libro-reclamaciones/`, { waitUntil: 'networkidle' });
await p.click('#form-reclamo button[type="submit"]');
await p.screenshot({ path: join(salida, 'libro-reclamaciones-errores-360.png'), fullPage: true });

await navegador.close();
console.log(problemas ? `Listo con ${problemas} problema(s)` : 'Capturas listas, sin problemas');
process.exit(problemas ? 1 : 0);
