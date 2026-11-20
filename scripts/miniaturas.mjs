// Recorta la parte superior de la captura de escritorio de cada demo y la guarda como WebP liviano.
import { createRequire } from 'node:module';
const require = createRequire(new URL('../01-kipuflow/package.json', import.meta.url));
const sharp = require('sharp');
const demos = [
  ['01-kipuflow', 'capturas/inicio-1440.png'],
  ['02-vertice-studio', 'capturas/1440-inicio.png'],
  ['03-kuro-lima', 'capturas/inicio-1440.png'],
  ['04-aura-derma', 'capturas/inicio-1440.png'],
  ['05-nexo-automatiza', 'capturas/1440-inicio.png'],
];
for (const [dir, archivo] of demos) {
  const entrada = new URL(`../${dir}/${archivo}`, import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
  const salida = new URL(`../miniaturas/${dir}.webp`, import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
  const meta = await sharp(entrada).metadata();
  const alto = Math.min(meta.height, Math.round(meta.width * 0.625));
  await sharp(entrada).extract({ left: 0, top: 0, width: meta.width, height: alto }).resize(960).webp({ quality: 78 }).toFile(salida);
  console.log(dir, meta.width + 'x' + meta.height);
}
