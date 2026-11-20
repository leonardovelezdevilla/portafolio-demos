// Capturas a 360, 768 y 1440 px: inicio, carta filtrada, reserva con errores y reserva con éxito.
// Requiere el sitio sirviéndose en http://localhost:4333 (npm run preview) y Microsoft Edge instalado.
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const aqui = dirname(fileURLToPath(import.meta.url));
const salida = join(aqui, '..', 'capturas');
const BASE = process.env.BASE ?? 'http://localhost:4333';
const anchos = [360, 768, 1440];

/** Próxima fecha (a partir de 3 días) que no sea lunes, en formato AAAA-MM-DD según Lima. */
function fechaValida() {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' });
  for (let i = 3; i < 12; i++) {
    const d = new Date(Date.now() + i * 86400000);
    const s = fmt.format(d);
    const dow = new Date(`${s}T12:00:00Z`).getUTCDay();
    if (dow !== 1) return s;
  }
}

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

  // Sin scroll horizontal
  const desborde = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (desborde > 0) { problemas++; console.log(`DESBORDE horizontal a ${w}px: ${desborde}px`); }

  // Para que se carguen las imágenes diferidas en la captura completa.
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(300);
  await p.screenshot({ path: join(salida, `inicio-${w}.png`), fullPage: true });

  // La cabecera fija taparía las capturas de secciones: se vuelve estática solo para fotografiar.
  await p.addStyleTag({ content: '.cabecera{position:static!important}.barra-reserva{display:none!important}' });

  // Carta filtrada: tiempo «Tiraditos y ceviches» + «Picante»
  await p.click('button[data-tiempo="tiraditos-ceviches"]');
  await p.check('input[data-etiqueta][value="picante"]');
  await p.locator('#carta').scrollIntoViewIfNeeded();
  await p.locator('#carta').screenshot({ path: join(salida, `carta-filtrada-${w}.png`) });
  console.log(`${w}px estado carta:`, await p.textContent('[data-estado]'));

  // Reserva con errores: envío vacío
  await p.click('#form-reserva button[type="submit"]');
  await p.waitForTimeout(150);
  await p.locator('#reserva').screenshot({ path: join(salida, `reserva-errores-${w}.png`) });

  // Grupo de más de 8 personas: aviso con camino a WhatsApp
  await p.selectOption('#personas', '9');
  await p.locator('#reserva').screenshot({ path: join(salida, `reserva-grupos-${w}.png`) });
  if (!(await p.isDisabled('#form-reserva button[type="submit"]'))) { problemas++; console.log('El envío no se deshabilitó con >8 personas'); }

  // Omakase: fecha mínima = hoy + 2 días y solo 19:00 y 21:30
  await p.selectOption('#tipo', 'omakase');
  const minOm = await p.getAttribute('#fecha', 'min');
  const horasOm = await p.evaluate(() => [...document.querySelectorAll('#hora option')].map((o) => o.value).filter(Boolean));
  console.log(`${w}px omakase: min=${minOm} horas=${horasOm.join(',') || '(elige fecha)'}`);
  await p.selectOption('#tipo', 'mesa');

  // Reserva con éxito
  await p.fill('#fecha', fechaValida());
  await p.dispatchEvent('#fecha', 'change');
  await p.selectOption('#hora', '20:00');
  await p.selectOption('#personas', '4');
  await p.fill('#nombre', 'Lucía Paredes');
  await p.fill('#celular', '987 654 321');
  await p.fill('#ocasion', 'Aniversario');
  await p.fill('#alergias', 'Alergia al maní, por favor.');
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

// Comprobación rápida de páginas secundarias a 360 px
const ctx = await navegador.newContext({ viewport: { width: 360, height: 800 } });
const p = await ctx.newPage();
for (const ruta of ['/privacidad/', '/terminos/', '/libro-reclamaciones/', '/pagina-que-no-existe/']) {
  await p.goto(`${BASE}${ruta}`, { waitUntil: 'networkidle' });
  const d = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (d > 0) { problemas++; console.log(`DESBORDE en ${ruta}: ${d}px`); }
}
await p.goto(`${BASE}/libro-reclamaciones/`, { waitUntil: 'networkidle' });
await p.click('#form-reclamo button[type="submit"]');
await p.screenshot({ path: join(salida, 'libro-reclamaciones-errores-360.png'), fullPage: true });

await navegador.close();
console.log(problemas ? `Listo con ${problemas} problema(s)` : 'Capturas listas, sin problemas');
process.exit(problemas ? 1 : 0);
