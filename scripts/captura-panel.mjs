import { createRequire } from 'node:module';
const require = createRequire(new URL('../01-kipuflow/package.json', import.meta.url));
const { chromium } = require('playwright-core');
const url = new URL('../index.html', import.meta.url).href;
const b = await chromium.launch({ channel: 'msedge' });
for (const [w, h] of [[1440, 900], [360, 800]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(url);
  const ancho = await p.evaluate(() => document.documentElement.scrollWidth);
  await p.screenshot({ path: `capturas/panel-${w}.png`, fullPage: true });
  console.log(w, 'scrollWidth', ancho);
}
await b.close();
