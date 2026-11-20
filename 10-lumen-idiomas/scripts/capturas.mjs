// Capturas a 360, 768 y 1440 px: inicio, test en curso, resultado, horarios filtrados y matrícula (adulto y menor).
// Requiere el sitio corriendo (npm run preview, puerto 4340) y Edge instalado (channel: 'msedge').
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const base = process.env.BASE_URL ?? 'http://localhost:4340';
const salida = join(dirname(fileURLToPath(import.meta.url)), '..', 'capturas');
mkdirSync(salida, { recursive: true });

const navegador = await chromium.launch({ channel: 'msedge' });
let fallos = 0;

async function desborde(p, etiqueta, ancho) {
  const d = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(`${ancho}px ${etiqueta}: desborde horizontal = ${d}`);
  if (d > 0) fallos++;
}

for (const ancho of [360, 768, 1440]) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  await p.goto(`${base}/`, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '.cab{position:static!important}' });

  // Inicio completo (con carga de imágenes diferidas)
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
  });
  await p.waitForLoadState('networkidle');
  await desborde(p, 'inicio', ancho);
  await p.screenshot({ path: join(salida, `inicio-${ancho}.png`), fullPage: true });

  // Test en curso: pregunta 3
  await p.click('#test-empezar');
  await p.check('#p0-2');
  await p.click('#test-sig');
  await p.check('#p1-1');
  await p.click('#test-sig');
  await p.check('#p2-3');
  await p.locator('#test').screenshot({ path: join(salida, `test-curso-${ancho}.png`) });

  // Completar el test y capturar el resultado
  await p.click('#test-sig');
  const marcar = [0, 1, 1, 3, 2, 0, 3, 2, 1, 2, 3]; // preguntas 4 a 12 (algunas correctas, otras no)
  const respuestas = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  void respuestas;
  const elegir = [0, 3, 0, 3, 1, 2, 0, 3, 1, 2];
  for (let i = 3; i < 12; i++) {
    await p.check(`#p${i}-${elegir[i - 3] ?? 0}`);
    await p.click('#test-sig');
  }
  void marcar;
  await p.waitForSelector('#test-res:not([hidden])');
  console.log(`${ancho}px nivel: ${await p.textContent('#res-nivel')}`);
  await desborde(p, 'resultado', ancho);
  await p.locator('#test').screenshot({ path: join(salida, `test-resultado-${ancho}.png`) });

  // Horarios filtrados desde el resultado
  await p.click('#res-horarios');
  await p.waitForTimeout(150);
  await p.locator('#horarios').scrollIntoViewIfNeeded();
  await p.selectOption('#f-pub', 'j');
  await p.locator('#horarios').screenshot({ path: join(salida, `horarios-filtrados-${ancho}.png`) });

  // Matrícula: menor de edad con apoderado y errores visibles
  await p.locator('#matricula').scrollIntoViewIfNeeded();
  await p.fill('#m-alumno', 'Sofía Paredes Vega');
  await p.fill('#m-nac', '2012-05-02');
  await p.fill('#m-correo', 'familia@ejemplo.invalid');
  await p.click('#mat-form button[type=submit]');
  await p.waitForSelector('#mat-resumen li');
  await desborde(p, 'matrícula con errores', ancho);
  await p.locator('#matricula').screenshot({ path: join(salida, `matricula-menor-errores-${ancho}.png`) });
  await p.fill('#m-apod', 'Rosa Vega Ruiz');
  await p.selectOption('#m-paren', 'Madre');
  await p.fill('#m-celapod', '912345678');
  await p.check('#m-autoriza');
  await p.selectOption('#m-horario', 'b2-jov');
  await p.check('#m-consent');
  await p.click('#mat-form button[type=submit]');
  await p.waitForSelector('#mat-conf:not([hidden])');
  console.log(`${ancho}px WhatsApp: ${(await p.getAttribute('#mat-wa', 'href')).slice(0, 60)}...`);
  await p.locator('#matricula').screenshot({ path: join(salida, `matricula-confirmacion-${ancho}.png`) });

  if (errores.length) { console.log('Errores de consola:', errores); fallos++; }
  await ctx.close();
}
await navegador.close();
process.exit(fallos ? 1 : 0);
