# Convenciones técnicas comunes a las 5 demos

Complementa [BRIEF.md](BRIEF.md). Obligatorio para cada constructor.

## Stack
- **Astro ^7.4** (`output: 'static'`, `trailingSlash: 'always'`, `build.inlineStylesheets: 'never'`), igual que velezdevilla.com.
- **CSS propio** (un `src/styles/global.css` con tokens en `:root` + CSS con alcance en cada componente). **Sin Tailwind**, sin frameworks de UI.
- **JS mínimo en islas**: `<script>` de componente Astro (TypeScript, se empaqueta) solo donde haya interacción (filtros, carrito, calculadora, acordeón si no basta `<details>`, formularios). Nada de React/Vue/Preact salvo justificación escrita en DECISIONES.md. Todo debe funcionar o degradar con dignidad sin JS (contenido visible, enlaces reales).
- **Fuentes**: Google Fonts vía `@fontsource/*` (SIL OFL), copiadas a `public/fonts/` solo los pesos usados en woff2, declaradas con `@font-face` + `font-display: swap`, y el archivo OFL incluido. Nada de cargar fonts.googleapis.com.
- **Íconos**: Lucide (`lucide-static`, licencia ISC) como SVG en línea con `aria-hidden="true"` (o con título si transmite información).
- **Imágenes**: Astro `<Image>`/`<Picture>` de `astro:assets` con salida **WebP**, `loading="lazy"` y `decoding="async"` salvo la imagen principal (eager + `fetchpriority="high"`), `width`/`height` siempre, `alt` descriptivo en español.

## Fotos (Unsplash / Pexels)
- Solo fotos cuya **página en unsplash.com o pexels.com abriste de verdad** y de la que anotaste fotógrafo y URL. **Nunca inventes IDs ni fotógrafos.** Si no logras verificar una foto, usa composición tipográfica, color o ilustración CSS en su lugar.
- Descarga la imagen original a `src/assets/fotos/` (solo .jpg/.webp de images.unsplash.com o images.pexels.com), máximo ~10 fotos por demo.
- Créditos en `CREDITOS.md`: archivo, fotógrafo, URL de la página, licencia (Unsplash License / Pexels License). Nada de imágenes generadas por IA.

## Contenido y legal
- Marca ficticia; aviso discreto «Demo de portafolio — Vélez De Villa» en el pie.
- Testimonios y cifras solo con la etiqueta visible «Ejemplo de demo».
- Teléfonos de demo `51900000000` y similares; correos `@ejemplo.pe` no existen → usa `@ejemplo.invalid`; RUC `20000000001` marcado como ficticio.
- Páginas `/privacidad/` y `/terminos/` (de demo, Ley 29733) y, si vende al público, `/libro-reclamaciones/` con formulario validado que termina en confirmación demo con número de hoja (sin enviar nada).
- `404.astro` propio.

## SEO y metadatos
- `<html lang="es-PE">`, título y descripción únicos por página, canonical relativo (sin dominio todavía), Open Graph y Twitter Card con imagen **1200×630** en `public/og.png` (genérala con un HTML propio y captura de Playwright, no con IA), favicon SVG, `robots.txt`, JSON-LD acorde al negocio con datos ficticios. Sin dominio: `noindex` en `public/_headers` no; usa `<meta name="robots" content="noindex">` mientras sea demo.
- `public/_headers` con CSP estricta (`default-src 'self'; img-src 'self' data:; font-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. Si Astro inyecta estilos o scripts en línea, ajústalo con `build.inlineStylesheets: 'never'` o documenta la excepción.

## Calidad
- Mobile-first, revisado a **360, 768 y 1440 px** sin scroll horizontal; objetivos táctiles de 44 px.
- **WCAG 2.2 AA**: contraste, foco visible, labels, errores con `aria-describedby` y `role="alert"`, navegación por teclado, `prefers-reduced-motion` respetado (sin animaciones ni scroll suave).
- Formularios validados en español en el cliente, que terminan en **wa.me prellenado** (`https://wa.me/51900000000?text=...` con `encodeURIComponent`) o en confirmación demo.
- Español de Perú, precios en `S/` con `Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })`.
- Sin lorem ipsum, «TODO», enlaces rotos (`href="#"` prohibido) ni botones sin acción.

## Entregables por demo
`README.md` (para GitHub: qué muestra, decisiones de diseño, capturas, cómo correrlo), `CREDITOS.md`, `DECISIONES.md`, `capturas/` (360, 768 y 1440 de la página principal y de la interacción clave), `scripts/capturas.mjs` con `playwright-core` y el Edge instalado (`channel: 'msedge'`, sin descargar navegadores), repo git propio con commits.
