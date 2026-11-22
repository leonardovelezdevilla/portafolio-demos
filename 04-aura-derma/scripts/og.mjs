// Genera public/og.png (1200x630) con HTML propio + Playwright (Edge instalado). Sin IA.
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const fuente = (f) => `data:font/woff2;base64,${readFileSync(join(raiz, 'public/fonts', f)).toString('base64')}`;
const html = `<!doctype html><html lang="es-PE"><head><meta charset="utf-8"><style>
@font-face{font-family:B;font-weight:400;src:url(${fuente('bodoni-moda-latin-400-normal.woff2')})}
@font-face{font-family:B;font-weight:400;font-style:italic;src:url(${fuente('bodoni-moda-latin-400-italic.woff2')})}
@font-face{font-family:M;font-weight:600;src:url(${fuente('manrope-latin-600-normal.woff2')})}
@font-face{font-family:M;font-weight:400;src:url(${fuente('manrope-latin-400-normal.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#f5f1ec;position:relative;overflow:hidden;font-family:M,sans-serif;color:#221d1a}
.w{padding:56px 72px;height:100%;display:flex;flex-direction:column;justify-content:space-between;border:1px solid #221d1a;margin:0}
.m{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid #221d1a;padding-bottom:18px;font:400 44px B}
.m em{color:#8a3324}
.m span{font:600 18px M;letter-spacing:.14em;text-transform:uppercase;color:#4f4640}
h1{font:400 118px/.98 B;letter-spacing:-.025em;max-width:1000px}
h1 em{color:#8a3324}
.p{font-size:28px;color:#4f4640;margin-top:22px}
.t{display:inline-block;background:#8a3324;color:#f5f1ec;padding:10px 22px;font-weight:600;font-size:20px;letter-spacing:.06em;text-transform:uppercase}
</style></head><body><div class="w">
<div class="m"><div>Aura <em>Derma</em></div><span>Dermatología · San Isidro, Lima</span></div>
<div><h1>Tu piel, <em>leída con calma.</em></h1><p class="p">Compara tratamientos, conoce a los especialistas y reserva tu cita.</p></div>
<div><span class="t">Demo de portafolio · Vélez De Villa</span></div></div></body></html>`;

const navegador = await chromium.launch({ channel: 'msedge' });
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
await pagina.setContent(html);
await pagina.evaluate(() => document.fonts.ready);
writeFileSync(join(raiz, 'public/og.png'), await pagina.screenshot({ type: 'png' }));
await navegador.close();
console.log('public/og.png generado');
