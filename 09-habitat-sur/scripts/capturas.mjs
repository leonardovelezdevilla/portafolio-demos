import { chromium } from 'playwright-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const salida = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'capturas');
const base = process.env.BASE ?? 'http://localhost:4339';
const desplazar = async (pag) => { await pag.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); }); await pag.waitForTimeout(300); };
const nav = await chromium.launch({ channel: 'msedge' });
let problemas = 0;
const rutas = ['/', '/departamentos/', '/departamento/morro-solar-502/', '/simulador/', '/libro-reclamaciones/', '/privacidad/', '/terminos/', '/nada/'];
for (const [w, h] of [[360, 780], [768, 1024], [1440, 900]]) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h } });
  const pag = await ctx.newPage();
  const errores = [];
  pag.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && errores.push(m.text()));
  pag.on('pageerror', (e) => errores.push(String(e)));
  for (const r of rutas) {
    await pag.goto(base + r);
    await pag.evaluate(() => document.fonts.ready);
    const d = await pag.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (d > 0) { console.log(`DESBORDE ${w}px ${r}: ${d}`); problemas++; }
  }
  await pag.goto(base + '/');
  await desplazar(pag);
  await pag.screenshot({ path: path.join(salida, `inicio-${w}.png`), fullPage: true });
  await pag.goto(base + '/departamentos/?distrito=Chorrillos&dormitorios=2&orden=precio-asc');
  await desplazar(pag);
  await pag.screenshot({ path: path.join(salida, `filtros-${w}.png`), fullPage: true });
  await pag.goto(base + '/departamento/morro-solar-502/');
  await desplazar(pag);
  await pag.screenshot({ path: path.join(salida, `ficha-${w}.png`), fullPage: true });
  await pag.goto(base + '/simulador/');
  await pag.locator('#sim').screenshot({ path: path.join(salida, `simulador-${w}.png`) });
  if (errores.length) { console.log(`Errores ${w}:`, errores); problemas++; }
  await ctx.close();
}
await nav.close();
console.log(problemas ? 'Con problemas' : 'Capturas OK, sin scroll horizontal ni errores de consola');
