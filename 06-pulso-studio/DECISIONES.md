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
