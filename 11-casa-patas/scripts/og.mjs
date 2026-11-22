// Genera public/og.png (1200x630) desde scripts/og.html con playwright-core y el Edge instalado; sharp lo reduce con paleta.
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const aqui = dirname(fileURLToPath(import.meta.url));
const navegador = await chromium.launch({ channel: 'msedge' });
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
await pagina.goto(pathToFileURL(join(aqui, 'og.html')).href);
await pagina.evaluate(() => document.fonts.ready);
const png = await pagina.screenshot();
await navegador.close();
await sharp(png).png({ palette: true, quality: 80, effort: 10, colours: 128 }).toFile(join(aqui, '..', 'public', 'og.png'));
console.log('og.png generado');
