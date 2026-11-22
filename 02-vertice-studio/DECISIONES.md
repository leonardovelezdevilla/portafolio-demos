# Decisiones

## Diseño
- **Brutalismo en blanco, negro y naranja `#ff5b14`.** Retícula de 40 px visible como fondo, bordes de 3 px, sombras duras sin desenfoque, cero redondeos. Anton (titulares condensados en mayúsculas) y Space Mono (texto y datos).
- El catálogo es una sola tabla de celdas con bordes compartidos, para que la retícula se vea también en el producto.
- El naranja nunca se usa como color de texto sobre blanco (contraste insuficiente): es fondo con texto negro.
- Foco visible: contorno negro de 3 px con halo naranja.

## Arquitectura
- Astro estático, CSS propio, sin frameworks. Las islas son `<script>` de componente en TypeScript.
- **Lógica pura en `src/lib/`** (carrito, validación, mensaje de WhatsApp, filtros) sin tocar el DOM, para probarla con Vitest (26 pruebas). Las islas solo conectan esa lógica con el DOM.
- El carrito guarda solo `{slug, talla, cantidad}`. Precios y nombres se resuelven siempre contra el catálogo, y al leer de `localStorage` se descartan líneas inválidas y se recorta al stock, así un valor manipulado no cambia precios.
- Los datos del catálogo viajan al navegador en un `<script type="application/json">` generado en el build (con miniaturas WebP optimizadas), de modo que las islas no duplican `productos.ts`.
- Eventos entre islas con `CustomEvent('vertice:agregar')`: vista rápida y página de producto no conocen el carrito.

## Accesibilidad y mejora progresiva
- Sin JS: el catálogo completo se ve, las tarjetas enlazan a `/producto/[slug]/`, la guía de tallas funciona y hay enlaces reales a WhatsApp. Los controles que necesitan JS (filtros, vista rápida, carrito, agregar) llevan `hidden` y los muestra el script.
- Vista rápida y carrito son `<dialog>` modales nativos: foco atrapado, Escape, fondo inerte. Se añade retorno de foco explícito al elemento que lo abrió (probado con Tab x30 y Escape).
- Filtros: botones con `aria-pressed`, conteo en `role="status"` `aria-live="polite"`, URL con `?categoria=skate&talla=41` (`history.replaceState`) y botón de copiar enlace.
- Errores: `aria-invalid`, mensaje con `role="alert"` y `aria-describedby`, foco al primer campo inválido.
- `prefers-reduced-motion`: sin marquesina, transiciones ni escalado.

## Reglas de negocio de demo
- Envío Lima S/ 10 (gratis desde S/ 299); provincias S/ 25 (gratis desde S/ 499). Carrito vacío no cobra envío.
- Stock por talla: no se puede agregar más que el stock ni una talla agotada.
- Colores: cada producto lista los colores de su par como información. No son variantes seleccionables porque cada una necesitaría su propia foto verificada.
- Número de WhatsApp y de hoja de reclamación ficticios (`51900000000`, `LR-AAAA-NNNNNN`). El Libro de Reclamaciones no envía nada.

## Seguridad
- `public/_headers` con CSP estricta. Se evitaron atributos `style` en el HTML (la CSP los bloquearía); los colores de muestra se asignan por CSSOM. `assetsInlineLimit: 0` y `inlineStylesheets: 'never'` para que no haya scripts ni estilos en línea.
- `<meta name="robots" content="noindex">` y `robots.txt` con Disallow mientras sea demo.

## Fotos
- Tras la revisión legal se eliminaron todas las fotos con logos o marcas reales visibles. Quedan 9 fotos verificadas (3 Unsplash, 6 Pexels) para 12 productos, repitiendo algunas con otro encuadre (ver CREDITOS.md). Los productos se renombraron y se reasignaron las categorías según lo que muestra cada foto. Hay aviso visible de que las fotos son ilustrativas.

## Cambios por la revisión (UX, accesibilidad, SEO, legal)
- Pedido: casilla de consentimiento sin marcar con aviso de que wa.me entrega los datos a WhatsApp (Meta); panel de confirmación tras enviar con enlace de respaldo si se bloquea la ventana, y opciones de volver o vaciar el carrito.
- Al agregar ya no se abre el carrito: aparece un aviso con «Ver carrito», para no perder el contexto del filtro.
- Stock: la tarjeta lista las tallas disponibles una a una; la vista rápida y la ficha muestran «Agotada» y «Últ. N» como texto visible, y la vista rápida preselecciona la talla filtrada.
- Libro de Reclamaciones completo (proveedor ficticio, menor de edad con apoderado, descripción del bien, observaciones del proveedor, consentimiento), constancia con todos los campos y botón de imprimir o guardar PDF. Acceso visible en el pie y en el carrito. Privacidad con titular ficticio, destinatarios (WhatsApp/Meta), conservación y correo ARCO ficticio. Política de cambios con arrepentimiento (plazos de ejemplo). IGV incluido y costos de envío visibles en ficha y carrito.
- Accesibilidad: la cinta animada tiene botón de pausa (WCAG 2.2.2) y desaparece con reduced-motion; totales anunciados al cambiar cantidades y zona; botón del carrito con nombre accesible; botón «menos» deshabilitado en 1.
- SEO/seguridad: robots.txt sin Disallow (el noindex va en meta), Cache-Control inmutable para /_astro/*, la 404 sin canonical ni og:url, solo el hero con fetchpriority alta, og:type product en fichas, url en Offer, og.png recomprimido (~100 KB), COOP y upgrade-insecure-requests, licencia de Lucide incluida, RUC ficticio no válido (20000000000).

## No aplicado (a propósito)
- og:image, og:url, canonical y la imagen del JSON-LD siguen relativos hasta que haya dominio (poner `site` en astro.config.mjs).
- Se mantuvo la franja de datos del inicio (la revisión UX sugería quitar una de las dos repeticiones) y la cinta, con pausa.
- La CSP no se verificó en GitHub Pages: `_headers` solo lo respetan Cloudflare Pages y Netlify.
- Sin una guía de tallas por modelo ni conversión US/UK.

## Pendientes / límites conocidos
- Sin dominio: canonical y og:image son relativos. Al publicar hay que ponerlos absolutos (`site` en `astro.config.mjs`).
- Los datos de talla en cm de la guía son referenciales.
- Probado en Edge (Chromium). Sin pruebas en Safari/Firefox.

## Pulido 2026-11
- Se mantiene identidad (Anton + Space Mono, naranja/negro, bordes y sombras duras). Rama `rediseno-2026-11`, sin commit.
- Cabecera a 360: de 99 px a 55 px. Solo queda la fila logo + carrito fija; los 3 enlaces (Catálogo, Cómo comprar, Tallas) pasan a una tira `nav-movil` normal bajo la cabecera, que se va con el scroll. `scroll-padding-top` bajó a 76 px.
- Fotos: «Violeta Pro» ya no encuadra el balón (recorte a la derecha, alt sin balón); «Cancha Pro» conserva zapatilla + balón porque es de básquet. No se pudo abrir Unsplash/Pexels desde aquí (401), así que no se añadieron fotos nuevas; siguen 9 fotos para 12 modelos (CREDITOS.md sin cambios).
- Migas y enlace «Cambios y devoluciones» de la ficha: 44 px de alto. `a.tarjeta__foto` con `aria-label` del producto. `h2#vr-titulo` nace con texto «Vista rápida».
- «Cómo comprar»: se quitó 01/02/03; ahora palabras grandes ELIGE / ARMA / ENVÍA (la del medio contorneada).
- Etiquetas en mayúsculas: se quitaron las de la ficha, la vista rápida (categoría pasa a texto simple tras el título) y «Pedido armado» del carrito. Queda la del héroe (y las de 404 y Libro, que son páginas aparte).
- Sin cambios en `src/lib` ni `tests/`. npm test 27/27; verificador 0 ERROR.
- Revisión (segunda ronda): héroe en una pantalla (h1, foto con 30svh en celular, texto y botones debajo; en ≥700 px dos columnas con `min-height` de pantalla); se quitó la franja de 4 datos y la cinta quedó con 3 mensajes. Entrada del héroe una vez (opacity desde 0,4 + translateY, apagada con reduced-motion).
- Fotos repetidas: el orden de `productos.ts` se cambió para que ningún par con la misma foto quede contiguo (en 2, 3 y 4 columnas), y la ficha ya no recomienda un modelo con su misma foto. **Faltan 3 fotos nuevas verificables** (Nodo 91/Pila Blanca, Ráfaga Air/Trama Run, Violeta Pro/Cancha Pro): las consigue Leonardo.
- Colores de la ficha y vista rápida como texto («Colores: Blanco · Negro»); «Guía de tallas» en blanco; botón de tarjeta «Ver»; JSON-LD con horario; meta description ≤ 155; `touch-action` y `overscroll-behavior`. «ARMA» ya va en naranja sólido.
- No aplicado: tarjeta ancha/jerarquía en el catálogo y resumen de tallas en la tarjeta (la lista la reescribe el JS del filtro).
