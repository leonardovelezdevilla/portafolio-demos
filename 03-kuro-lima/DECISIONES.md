# Decisiones de diseño y técnica

## Dirección visual
- **Editorial de revista**: cabezal con ficha (cocina, barrio, horario), capitulares, columnas en la historia, numeración romana de los tiempos de la carta, puntos guía entre plato y precio, mucho aire y fotografía grande. Secciones que alternan papel, tierra y carbón.
- **Tipografía**: Cormorant Garamond (serif de alto contraste) para titulares, citas y precios; Figtree discreta para texto y controles. Autohospedadas en `public/fonts` (solo 5 + 2 pesos).
- **Color**: carbón `#16130f`, papel `#f4ede1`, tierra `#ebe1d0`, tinta `#231d16`. El dorado es solo acento y tiene dos versiones: `#c9a35a` sobre carbón y `#7a5712` sobre papel.

## Contraste (WCAG AA, calculado)
| Par | Ratio |
|---|---|
| dorado `#c9a35a` sobre carbón | 7,8 |
| dorado oscuro `#7a5712` sobre papel / tierra | 5,6 / 5,1 |
| carbón sobre dorado (botón) | 7,8 |
| texto suave `#5a4d3d` sobre papel / tierra | 7,0 / 6,3 |
| texto suave oscuro `#b9ab95` sobre carbón | 8,2 |
| error `#9b2c1f` sobre papel | 6,5 |

## Técnica
- Astro estático, CSS propio, sin Tailwind ni frameworks. JS solo en tres islas (`<script>` de componente): filtro de carta, formulario de reserva y formulario del Libro de Reclamaciones.
- **Sin JS**: la carta se ve completa (los filtros viven en un bloque `hidden` que el script muestra) y la reserva ofrece un enlace directo a WhatsApp. La clase `js` la añade `public/js-flag.js` (archivo propio por la CSP, que prohíbe scripts en línea).
- **CSP estricta** en `public/_headers`. `inlineStylesheets: 'never'` y `assetsInlineLimit: 0` evitan estilos y scripts en línea; no hay atributos `style`.
- **Zona horaria**: la «fecha de hoy» y la hora actual se calculan con `Intl.DateTimeFormat` en `America/Lima` (UTC−5, sin horario de verano) y nunca con la del navegador. La lógica pura vive en `src/lib/reserva.ts` y se prueba con Vitest inyectando la hora (`npm test`).
- **Horario**: la última reserva es 1 hora antes del cierre de cada turno (mar–sáb 15:00 y 22:00; dom 16:00), con horas cada 30 min. Si la fecha es hoy, se descartan horas ya pasadas. Máximo 90 días de anticipación (decisión propia para evitar fechas absurdas).
- **Más de 8 personas**: es un error con enlace a WhatsApp para grupos, no un bloqueo mudo. El selector ofrece «Más de 8 personas» para que el mensaje se vea.
- **Cierre del flujo**: confirmación demo en pantalla con un botón `wa.me/51900000000?text=…` codificado con `encodeURIComponent`. No se envía nada.
- **Libro de Reclamaciones**: validación completa (documento según tipo, correo, celular, textos) y constancia con número de hoja (contador en `localStorage`, con `try/catch`). Sin envío.
- **Accesibilidad**: enlace para saltar, foco visible, etiquetas, errores con `aria-describedby`, resumen con `role="alert"` que recibe el foco y enlaces a cada campo, filtros con `aria-pressed` y región `aria-live`, objetivos táctiles de 44 px, `prefers-reduced-motion` respetado (no hay animaciones).
- **Fotos**: `astro:assets` con WebP, `loading="lazy"` salvo la portada (eager + `fetchpriority="high"`). Se descartó una foto de bar con marca de cerveza visible. La foto del cocinero es de archivo y está rotulada como ilustrativa para no atribuirle la identidad del chef ficticio.
- **No se usó mapa embebido** (la CSP lo impediría y la dirección es ficticia): hay una tarjeta gráfica con referencias.
- **SEO**: JSON-LD `Restaurant` (servesCuisine, openingHours, menu, dirección ficticia), `noindex` mientras sea demo, canonical relativo, Open Graph/Twitter con `public/og.png` generado con `scripts/og.html` + Playwright.

## Revisión (UX, accesibilidad, SEO, legal)
- **Omakase reservable** desde el formulario (selector «Qué reservar»): martes a sábado, 19:00 y 21:30, mínimo 48 h de anticipación contadas en hora de Lima, 8 asientos; el botón «Reservar omakase» preselecciona el tipo. Validado en `src/lib/reserva.ts` y probado (32 tests).
- **Grupos de más de 8**: al elegir «Más de 8 personas» aparece de inmediato un aviso con botón «Cotizar por WhatsApp» y se deshabilita el envío (ya no es un error rojo).
- **Consentimiento expreso**: casilla sin marcar, obligatoria, con enlace a Privacidad y mención a las alergias como dato sensible. La pantalla final avisa de que WhatsApp/Meta recibe los datos y de que la mesa no está confirmada hasta que el restaurante responde. Privacidad ampliada (titular, conservación, destinatarios, transferencia, ARCO).
- **Libro de Reclamaciones** con bloque del proveedor, menor de edad y representante, descripción del bien, fecha del incidente, monto, declaración/firma demo y constancia completa con leyenda del INDECOPI.
- **Formularios**: tras el primer intento solo se revalida el campo tocado y el resumen (sin `role="alert"`, con foco) se actualiza al enviar; aviso de «campos obligatorios»; aviso inmediato si la fecha es lunes.
- **Accesibilidad**: foco dorado también en el hero, el enlace de salto y la barra móvil; `scroll-padding` acorde a la cabecera de dos filas; foco a «Todos» al quitar filtros; casillas de filtro con marca ✓; sin `role="img"` en «Cómo llegar»; `aria-label` de la marca eliminado; avisos «(se abre en una pestaña nueva)».
- **Móvil**: barra fija inferior «Reservar mesa / Carta» (solo bajo 48 rem). La cabecera también conserva su botón.
- **SEO**: `robots.txt` sin Disallow (el `noindex` va en la meta), `Cache-Control` inmutable para `/_astro/*` y `/fonts/*`, 404 sin canonical ni `og:url`, `openingHoursSpecification`, `acceptsReservations: true`, preload de Figtree 400, fuente sobrante eliminada (Cormorant 500 cursiva), `width` acotado en las imágenes y `og.png` reducido a ~130 KB.
- **Diseño**: sin bordes laterales de acento (la cita usa comillas grandes; los avisos, un filete superior fino); el recuadro «Cómo llegar» ya no imita un mapa.
- **`public/js-flag.js`** es el único script bloqueante (una línea): se mantiene como archivo por la CSP `script-src 'self'`; se sirve con caché normal (revalidable), porque no lleva hash.

## No aplicado (y por qué)
- `og:image`, `og:url`, `menu`, `url` e `image` del JSON-LD siguen **relativos** hasta tener dominio (indicación del coordinador); deberán hacerse absolutos al publicar.
- Filtros fijos (sticky) en móvil y carta colapsada por tiempos: dejarían la carta menos legible y no son obligatorios; el CTA fijo inferior cubre el problema del recorrido largo.
- Testimonios con tamaños distintos y reemplazo de las fotos de ceviche: criterio de diseño de baja prioridad; las fotos siguen rotuladas por su alt real.
- Unir los pesos 400/500 de Cormorant: se usan ambos de forma distinta.
- Reflow a 320 px, zoom 200 % y lector de pantalla real: no se probaron en navegador.

## Pendiente conocido
- Sin dominio: canonical, `og:url` y `og:image` son relativos; deberán ser absolutos al publicar.
- Los testimonios y datos del restaurante son ficticios y están rotulados.

## Pulido 2026-11
- Se mantiene paleta, Cormorant + Figtree y la carta. Rama `rediseno-2026-11`, sin commit.
- Móvil (< 48 rem): la cabecera pasó de 163 px a 58 px (marca + botón «Menú» con `aria-expanded`, `aria-controls`, cierra con Escape, clic fuera o al elegir un enlace; el foco vuelve al botón). Sin JS, los enlaces quedan a la vista. El botón «Reservar» de la cabecera se oculta en móvil porque ya existe la barra inferior (63 px, algo más baja). Total 121 px ≈ 15,5 % de 780 px (antes 29 %).
- Alergias: aviso `aviso-salud` junto al campo («solo lo necesario, sin diagnósticos ni medicinas; viaja en el mensaje de WhatsApp (Meta)»), enlazado con `aria-describedby`. No se tocó `src/lib`.
- La cita del chef lleva «Ejemplo de demo» junto a la firma.
- Etiquetas en mayúsculas sobre títulos: quedó solo «La historia» en el inicio (las de Legal están una por página).
- Enlaces «Volver al inicio» de privacidad y términos a 44 px de alto. Foto del chef sin cambios (no se pudo verificar otra en Unsplash/Pexels desde aquí).
- npm test 32/32; verificador 0 ERROR (quedan AVISO de capturas/licencia y objetivos táctiles en párrafos de texto).
- Revisión (segunda ronda): a 360 la primera pantalla muestra titular y foto del nigiri (38svh); se ocultan la ficha y los 2 botones del héroe (la barra inferior ya los ofrece). La barra inferior se oculta con IntersectionObserver cuando `#reserva` o el pie están a la vista. Omakase a 1440: foto arriba, 4:5 y pegajosa (sin vacío negro). «Ejemplo de demo» bajo las cifras 8/6/24. Entrada del héroe (opacity 0,4 + translateY, una vez, apagada con reduced-motion). Menú: pasa a «Cerrar» con X, se cierra al hacer scroll, «Inicio» en páginas legales; `S/&nbsp;`; `touch-action`.
- No aplicado: fotos anchas en la carta y plano SVG de Visítanos (faltan fotos verificadas).
