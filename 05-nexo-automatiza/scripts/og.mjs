// Genera public/og.png (1200x630) desde scripts/og.html con Playwright + Edge instalado.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const navegador = await chromium.launch({ channel: 'msedge' });
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
await pagina.goto(pathToFileURL(path.join(aqui, 'og.html')).href);
await pagina.evaluate(() => document.fonts.ready);
await pagina.screenshot({ path: path.join(aqui, '..', 'public', 'og.png') });
await navegador.close();
console.log('og.png generado');
