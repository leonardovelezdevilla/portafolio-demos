// Construye las 5 demos para publicarlas en velezdevilla.com/portafolio/<demo>/
// y las deja juntas en salida/portafolio/. Uso: node scripts/publicar.mjs
import { execSync } from 'node:child_process';
import { readdirSync, statSync, readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const SITE = 'https://velezdevilla.com';
const DEMOS = {
  '01-kipuflow': 'kipuflow',
  '02-vertice-studio': 'vertice-studio',
  '03-kuro-lima': 'kuro-lima',
  '04-aura-derma': 'aura-derma',
  '05-nexo-automatiza': 'nexo-automatiza',
};
const raiz = new URL('..', import.meta.url).pathname;
const salida = join(raiz, 'salida', 'portafolio');
rmSync(join(raiz, 'salida'), { recursive: true, force: true });
mkdirSync(salida, { recursive: true });

function archivos(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? archivos(p) : [p];
  });
}

// Antepone la base a las rutas absolutas que Astro no reescribe (enlaces escritos a mano).
function reescribir(texto, base, tipo) {
  const noBase = `(?!/|${base.slice(1)})`; // ni //host ni rutas ya con base
  if (tipo === 'html') {
    texto = texto.replace(new RegExp(`((?:href|src|content|action|poster)=["'])/${noBase}`, 'g'), `$1${base}`);
    texto = texto.replace(new RegExp(`(srcset=["'][^"']*?)(^|\\s|,)/${noBase}`, 'g'), `$1$2${base}`);
    texto = texto.replace(new RegExp(`("(?:url|@id|item|image|logo|target|urlTemplate)"\\s*:\\s*")/${noBase}`, 'g'), `$1${base}`);
  }
  if (tipo === 'html' || tipo === 'css') {
    texto = texto.replace(new RegExp(`url\\((['"]?)/${noBase}`, 'g'), `url($1${base}`);
  }
  if (tipo === 'js') {
    texto = texto.replace(new RegExp(`(['"\`])/(producto/|privacidad/|terminos/|libro-reclamaciones/|cambios/|#|\\?)`, 'g'), `$1${base}$2`);
  }
  return texto;
}

for (const [carpeta, slug] of Object.entries(DEMOS)) {
  const base = `/portafolio/${slug}/`;
  const dir = join(raiz, carpeta);
  console.log(`\n== ${carpeta} → ${base}`);
  if (!existsSync(join(dir, 'node_modules'))) execSync('npm ci --no-audit --no-fund', { cwd: dir, stdio: 'inherit' });
  execSync(`npx astro build --base ${base} --site ${SITE}`, { cwd: dir, stdio: 'inherit' });
  const dist = join(dir, 'dist');
  for (const f of archivos(dist)) {
    const ext = extname(f);
    const tipo = ext === '.html' ? 'html' : ext === '.css' ? 'css' : ext === '.js' ? 'js' : null;
    if (!tipo) continue;
    const antes = readFileSync(f, 'utf8');
    const despues = reescribir(antes, base, tipo);
    if (despues !== antes) writeFileSync(f, despues);
  }
  // _headers de la demo: se fusiona en el _headers de la web principal (ver scripts/headers.mjs)
  rmSync(join(dist, '_headers'), { force: true });
  rmSync(join(dist, 'robots.txt'), { force: true });
  cpSync(dist, join(salida, slug), { recursive: true });
}
console.log(`\nListo: ${salida}`);
