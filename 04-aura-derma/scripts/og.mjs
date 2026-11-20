// Genera public/og.png (1200x630) con HTML propio + Playwright (Edge instalado). Sin IA.
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const fuente = (f) => `data:font/woff2;base64,${readFileSync(join(raiz, 'public/fonts', f)).toString('base64')}`;
const hoja = readFileSync(join(raiz, 'node_modules/lucide-static/icons/leaf.svg'), 'utf8')
  .replace(/<!--[\s\S]*?-->/, '')
  .replace(/class="[^"]*"/, '')
  .replace('width="24"', 'width="64"')
  .replace('height="24"', 'height="64"');

const html = `<!doctype html><html lang="es-PE"><head><meta charset="utf-8"><style>
@font-face{font-family:F;font-weight:400;src:url(${fuente('instrument-serif-latin-400-normal.woff2')})}
@font-face{font-family:I;font-weight:600;src:url(${fuente('albert-sans-latin-600-normal.woff2')})}
@font-face{font-family:I;font-weight:400;src:url(${fuente('albert-sans-latin-400-normal.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#f7f3ea;position:relative;overflow:hidden;font-family:I,sans-serif;color:#26302a}
.c1{position:absolute;right:-160px;top:-180px;width:620px;height:620px;border-radius:50%;background:#dde5d6}
.c2{position:absolute;right:120px;bottom:-230px;width:420px;height:420px;border-radius:50%;background:#a9b9a0;opacity:.55}
.w{position:relative;padding:76px 88px;height:100%;display:flex;flex-direction:column;justify-content:space-between}
.m{display:flex;align-items:center;gap:20px;font:400 52px F}
.s{width:84px;height:84px;border-radius:50%;background:#4a5f4c;color:#fff;display:grid;place-items:center}
h1{font:400 96px/1.02 F;color:#2b3a2e;max-width:800px}
.p{font-size:28px;color:#4d5a51;margin-top:22px}
.t{display:inline-block;border:2px solid #4a5f4c;color:#4a5f4c;border-radius:999px;padding:6px 20px;font-weight:600;font-size:22px;letter-spacing:.06em;text-transform:uppercase}
</style></head><body><div class="c1"></div><div class="c2"></div><div class="w">
<div class="m"><span class="s">${hoja}</span>Aura <span style="color:#4a5f4c">Derma</span></div>
<div><h1>Dermatología con calma.</h1><p class="p">Compara tratamientos, conoce a los especialistas y reserva tu cita.</p></div>
<div><span class="t">Demo de portafolio · Vélez De Villa</span></div></div></body></html>`;

const navegador = await chromium.launch({ channel: 'msedge' });
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
await pagina.setContent(html);
await pagina.evaluate(() => document.fonts.ready);
writeFileSync(join(raiz, 'public/og.png'), await pagina.screenshot({ type: 'png' }));
await navegador.close();
console.log('public/og.png generado');
