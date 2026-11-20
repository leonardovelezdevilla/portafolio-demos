// Genera public/og.png (1200x630) con HTML propio + Playwright (Edge instalado). Sin IA.
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const fuente = (f) => `data:font/woff2;base64,${readFileSync(join(raiz, 'public/fonts', f)).toString('base64')}`;
const html = `<!doctype html><html lang="es-PE"><head><meta charset="utf-8"><style>
@font-face{font-family:N;font-weight:600;src:url(${fuente('newsreader-latin-600-normal.woff2')})}
@font-face{font-family:N;font-weight:400;font-style:italic;src:url(${fuente('newsreader-latin-400-italic.woff2')})}
@font-face{font-family:H;font-weight:700;src:url(${fuente('atkinson-hyperlegible-latin-700-normal.woff2')})}
@font-face{font-family:H;font-weight:400;src:url(${fuente('atkinson-hyperlegible-latin-400-normal.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#fbf7ef;position:relative;overflow:hidden;font-family:H,sans-serif;color:#1b2238}
.sol{position:absolute;right:-120px;top:-140px;width:520px;height:520px;border-radius:50%;background:#f5b83d}
.w{position:relative;padding:72px 84px;height:100%;display:flex;flex-direction:column;justify-content:space-between}
.m{font:600 54px N;color:#121c3a}
h1{font:600 92px/1.02 N;color:#121c3a;max-width:860px;letter-spacing:-.015em}
h1 em{font-weight:400;color:#c8391d}
.p{font-size:28px;color:#4a5266;margin-top:22px}
.niv{display:flex;gap:12px}
.niv span{background:#121c3a;color:#fff;font-weight:700;font-size:26px;padding:6px 18px;border-radius:10px}
.t{position:absolute;right:84px;bottom:72px;border:2px solid #121c3a;border-radius:999px;padding:6px 20px;font-weight:700;font-size:20px;letter-spacing:.06em;text-transform:uppercase;background:#fbf7ef}
</style></head><body><div class="sol"></div><div class="w">
<div class="m">Lumen</div>
<div><h1>Inglés que se <em>habla</em> desde la primera clase.</h1><p class="p">Test de nivel, horarios por nivel y matrícula en Pueblo Libre.</p></div>
<div class="niv"><span>A1</span><span>A2</span><span>B1</span><span>B2</span><span>C1</span></div>
<div class="t">Demo de portafolio · Vélez De Villa</div></div></body></html>`;

const navegador = await chromium.launch({ channel: 'msedge' });
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
await pagina.setContent(html);
await pagina.evaluate(() => document.fonts.ready);
writeFileSync(join(raiz, 'public/og.png'), await pagina.screenshot({ type: 'png' }));
await navegador.close();
console.log('public/og.png generado');
