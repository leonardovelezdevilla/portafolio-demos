# Decisiones

## Identidad
Energética pero cuidada: bosque `#12302a` (base), crema `#fbf5ec`, coral `#c23b1f` (acción) y lima `#d9f24f` (acento sobre oscuro). Red Hat Display 900 en titulares y Public Sans en texto (Hanken Grotesk se cambió porque la usa la demo 09). Motivo: una línea de pulso (SVG, estática). Sin degradados, sin bordes laterales de color, sin tarjetas idénticas: el horario es una lista por día y los programas una tabla editorial.

## Datos y lógica (`src/data`, `src/lib`)
- `clases.ts`: 6 programas (3 reformer: 8 camas; 3 funcionales: 12 puestos), 5 instructoras ficticias sin títulos, 34 clases semanales.
- **Cupos deterministas**: ocupados = f(hash FNV-1a de `idClase|fecha`, demanda por franja horaria). Misma clase y fecha, mismo resultado. Estados: «Llena», «Últimos N cupos» (≤ 3) y «N cupos libres», siempre con texto.
- **Fechas en `America/Lima`** con `Intl` (nunca la zona del navegador). Reserva con hasta 7 días de anticipación y hasta 60 min antes del inicio. Los tests inyectan la hora.
- Precios en `planes.ts`; todos incluyen IGV 18 % y se desglosan (base + IGV). Prueba S/ 35 (solo primera vez), suelta S/ 65.
- 25 tests Vitest: fechas, cupos, cierre de reservas, validación y precios.

## Formulario de reserva
Clase del horario (opciones con cupos; las llenas deshabilitadas con texto), nombre, celular peruano, primera vez, lesión sí/no, consentimiento sin marcar. **Lesiones = dato sensible**: solo sí/no, aviso de no escribir detalles por WhatsApp y el mensaje de wa.me no los incluye. Resumen de errores con foco al primer campo inválido. Se revalida al escribir/cambiar (no al salir del campo: al ocultar un error el diseño se movía entre pulsar y soltar y se perdía el clic en los radios). Termina en confirmación demo + `wa.me/51900000000?text=…`, con aviso de Meta.

## Accesibilidad y sin JS
Anillo de foco por contexto (bosque sobre claro, lima sobre oscuro). Sin animaciones. Menú móvil que cierra con Escape y al elegir enlace. Sin JS: el horario semanal se ve completo (sin cupos, con aviso) y la reserva ofrece WhatsApp directo. Primera pantalla sin opacity 0.

## Técnica
Astro estático, CSP estricta en `_headers`, `inlineStylesheets: 'never'`, caché inmutable para `/_astro/*` y `/fonts/*`, `robots.txt` con `Allow: /`, `noindex` solo en meta, 404 sin canonical. `og:image` y `og:url` relativos hasta tener dominio. Sin mapa embebido (dirección ficticia y CSP): esquema ilustrativo.
Libro de Reclamaciones con hoja completa (proveedor ficticio, consumidor, menor, bien, monto, reclamo/queja, 15 días hábiles, constancia imprimible), adaptado del de Kuro, sin casilla condicionante de tratamiento de datos.

## Revisión (UX, accesibilidad, SEO, legal)
- Fuente del cuerpo: Public Sans (Hanken Grotesk la usa la demo 09). Preload de Red Hat Display 900 y Public Sans 400.
- **Salud**: el mensaje de WhatsApp es igual para todas las personas y no incluye ni el sí/no sobre lesiones. Consentimiento de salud en casilla propia (solo si responde «Sí») y casilla de contacto aparte. Edad mínima de demo 16 años (menores con apoderado).
- **Clase de prueba solo en nivel inicial**: validada en `validarReserva` (con tests); en el select las clases no iniciales se deshabilitan al marcar «primera vez».
- **Planes**: «Pulso 12» (antes «Pulso Libre»), condiciones visibles (vigencia, clases no usadas se pierden, cancelación a 4 h por WhatsApp, devoluciones) y sección en Términos. Se quitó la tarjeta de prueba duplicada (queda la banda). Aviso de Meta y `target="_blank"` con texto para lectores en todos los enlaces wa.me.
- **Móvil**: filtros plegables con contador por chip (los chips sin resultados quedan `aria-disabled`), línea «Clase elegida … Cambiar» sobre el formulario y foco al primer campo vacío al pulsar «Reservar»; opciones del select más cortas, botón de envío a ancho completo y resumen de errores solo con enlaces.
- **Accesibilidad**: foco lima en el pie, barra móvil con color legible, `scroll-padding-bottom`, `aria-required`, ids en los primeros radios, sin landmarks extra por día, `role="list"` en listas sin viñetas, foco al primer campo en el Libro.
- **SEO/headers**: sin `Cache-Control` en `/*` (no anula el immutable), `Cross-Origin-Resource-Policy`, descripción de la home ≤ 155, JSON-LD con `image` y `url`. Pendientes bajos: fuentes de reserva con métricas ajustadas, URLs absolutas de og al tener dominio, «Quitar filtros» fijo al desplazarse.
- Libro de Reclamaciones: observaciones del proveedor, firma de demo y copia para el consumidor.

## Rediseño 2026-11
- **Dirección «Ritmo»**: deportiva y cálida, sin verde ni lima. Arena `#f2ece3`, superficie `#e6dccd`, tinta `#1b1916` y persimón `#e2552d` (texto pequeño sobre claro usa `#b73a14`; sobre tinta, `#ff8a63`; el botón es persimón con texto tinta, 4,7:1). Archivo variable (wdth 62–125): titulares en ancho 125 peso 800, texto en ancho 100. Un solo archivo woff2 con ambos ejes reemplaza a Red Hat Display y Public Sans (se quitaron de `public/fonts` y `package.json`).
- **Se conservó**: toda la lógica (`src/lib`, `src/data`, pruebas: 27 en verde), formulario con sus validaciones y consentimientos, mensaje de WhatsApp sin datos de salud, legales, Libro de Reclamaciones, CSP, textos «Ejemplo de demo/ficticio» y la línea de pulso (ahora en persimón).
- **Cambió**: héroe con foto a sangre y titular expandido (entra una vez con transform, sin opacity 0), banda con «S/ 35» como momento tipográfico, mosaico asimétrico del estudio (2 fotos + bloques «8 camas» / «12 puestos»; no hay más fotos verificadas), programas en lista, planes y paquetes como tarifas en filas (ya no tarjetas idénticas), preguntas en dos columnas, ubicación con titular grande sobre persimón. Una sola etiqueta en mayúsculas (la del héroe). La nota de «fotos ilustrativas» pasó al pie. Se quitó la barra fija inferior: el botón «Clase de prueba» vive ahora en la cabecera también en celular (56 px).
- **Horario**: desde 75 rem es una pizarra de 7 columnas (lunes a domingo) con tarjetas de igual alto. Por debajo, un día a la vez: 7 botones de día con el de hoy (hora de Lima) primero y marcado «Hoy», contador por día, y filtros de tipo y nivel plegados. Los botones usan `aria-pressed` (no `role=tab`) para no exigir flechas ni paneles; el `aria-label` dice día, «(hoy)» y número de clases. Cada fila de celular ocupa 3 líneas. Alto de la página a 360 px: de ~17 900 a ~11 000 px. La leyenda de cupos solo se muestra desde 48 rem (los textos de cupos ya son explícitos).
- **Primera vez ya no borra la clase**: si la clase elegida no es de nivel inicial, queda guardada, el select muestra «Elige una clase…» y un aviso (`role=status`) explica por qué; al volver a «No, ya he venido» la clase se restaura. «Reservar» desde el horario con prueba marcada usa el mismo aviso.
- **Verificador**: los 2 ERROR de objetivo táctil son enlaces dentro de un párrafo legal (Privacidad y Términos), exentos por WCAG 2.5.8. AVISO de contraste: texto de la cabecera detectado como «sobre degradado» por el velo del héroe; medido a mano con el texto oculto: títulos ≥ 4,3:1 (arena ≥ 8:1). Un solo preload de fuente porque el archivo variable sirve titular y cuerpo.
- **Segunda ronda (revisiones UX y legal/SEO)**: «Hoy» solo se marca si quedan clases hoy; si no, aviso «Hoy ya no quedan clases» y se arranca en el próximo día con clases (con su nombre y fecha). Cada día muestra su fecha en el encabezado y la fecha por fila solo si difiere. Pizarra: columnas con fondo parejo y encabezado tinta, tarjetas más compactas. El aviso de primera vez quedó en banda, ayuda del radio y un enlace en Planes. Con prueba y clase no inicial sale solo el aviso (no el error rojo). Resumen de errores con `scroll-margin-top`. Bajada del héroe a ancho completo hasta 62 rem. Leyenda: «Con cupos / Pocos cupos / Llena». Nota «Foto ilustrativa» junto al héroe.

- (Orquestador) Enlaces dentro de párrafos con `padding-block: .3em`: área táctil ≥ 24 px (WCAG 2.5.8) sin mover el texto; el verificador queda sin ERROR.
