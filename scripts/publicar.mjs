// Construye las demos para publicarlas en velezdevilla.com/portafolio/<demo>/
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
  '06-pulso-studio': 'pulso-studio',
  '08-taller-ruta': 'taller-ruta',
  '09-habitat-sur': 'habitat-sur',
  '10-lumen-idiomas': 'lumen-idiomas',
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
  const noBase = `(?!/|${base.slice(1)}|portafolio/)`; // ni //host ni rutas ya con base
  if (tipo === 'html') {
    texto = texto.replace(new RegExp(`((?:href|src|content|action|poster)=["'])/${noBase}`, 'g'), `$1${base}`);
    texto = texto.replace(new RegExp(`(srcset=["'][^"']*?)(^|\\s|,)/${noBase}`, 'g'), `$1$2${base}`);
    texto = texto.replace(new RegExp(`("(?:url|@id|item|image|logo|target|urlTemplate|menu|hasMenu)"\\s*:\\s*")/${noBase}`, 'g'), `$1${base}`);
  }
  if (tipo === 'html' || tipo === 'css') {
    texto = texto.replace(new RegExp(`url\\((['"]?)/${noBase}`, 'g'), `url($1${base}`);
  }
  if (tipo === 'js') {
    texto = texto.replace(new RegExp(`(['"\`])/(producto/|departamento/|privacidad/|terminos/|libro-reclamaciones/|cambios/|#|\\?)`, 'g'), `$1${base}$2`);
  }
  if (tipo === 'html') {
    // URLs absolutas para compartir (Open Graph, canonical) y JSON-LD.
    texto = texto.replace(/((?:property|name)="(?:og:image|og:url|twitter:image)"\s+content=")\//g, `$1${SITE}/`);
    texto = texto.replace(/(content=")(\/portafolio\/[^"]*"\s+(?:property|name)="(?:og:image|og:url|twitter:image)")/g, `$1${SITE}$2`);
    texto = texto.replace(/(rel="canonical"\s+href=")\//g, `$1${SITE}/`);
    texto = texto.replace(/(href=")(\/portafolio\/[^"]*"\s+rel="canonical")/g, `$1${SITE}$2`);
    texto = texto.replace(/("(?:url|@id|image|logo|menu|hasMenu)"\s*:\s*")\/(?!\/)/g, `$1${SITE}/`);
    // Franja común: aclara que es una demo y lleva de vuelta al portafolio.
    texto = texto.replace('</head>', `<link rel="stylesheet" href="/portafolio/franja.css"></head>`);
    texto = texto.replace(/(<body[^>]*>)/, `$1<div class="vdv-franja" role="note"><span>Demo de portafolio de <a href="/">Vélez De Villa</a> · marca ficticia · los mensajes de WhatsApp llegan a Vélez De Villa</span><a class="vdv-volver" href="/demos/">← Volver a las demos</a></div>`);
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
writeFileSync(join(salida, 'franja.css'), `.vdv-franja{position:relative;z-index:2147483000;display:flex;flex-wrap:wrap;gap:.25rem 1rem;justify-content:space-between;align-items:center;padding:.5rem 1rem;background:#0F2430;color:#fff;font:500 13px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}.vdv-franja a{color:#fff;text-decoration:underline;text-underline-offset:2px}.vdv-franja a:focus-visible{outline:3px solid #9FD0E3;outline-offset:2px}.vdv-volver{font-weight:700;min-height:24px;display:inline-flex;align-items:center}@media print{.vdv-franja{display:none}}\n`);
console.log(`\nListo: ${salida}`);
