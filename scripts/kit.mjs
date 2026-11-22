// Copia el kit «sistema completo» (kit/) a src/kit/ de cada demo. Uso: node scripts/kit.mjs [carpeta-demo ...]
import { readdirSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const raiz = new URL('..', import.meta.url).pathname;
const demos = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(raiz).filter((d) => /^\d\d-/.test(d));
for (const d of demos) {
  if (!existsSync(join(raiz, d, 'src'))) { console.warn(`Sin src/: ${d}`); continue; }
  const dest = join(raiz, d, 'src', 'kit'); mkdirSync(dest, { recursive: true });
  for (const f of ['sistema-demo.ts', 'sistema-demo.css']) copyFileSync(join(raiz, 'kit', f), join(dest, f));
  console.log(`kit → ${d}/src/kit/`);
}
