# Decisiones

- **Sin fotos**: la identidad se sostiene con tipografía expresiva y diagramas SVG; evita fotos no verificadas.
- **Sin framework de UI**: islas con `<script>` de componente Astro (TypeScript). El cotizador importa la función pura para que la misma lógica se pruebe con vitest.
- **Contenido como fuente única**: cada tarjeta de caso lleva su detalle en el HTML; con JS se oculta en la tarjeta y se clona al modal. Sin JS el detalle queda visible en la tarjeta y los controles de filtro/modal no aparecen.
- **Sin JS**: la clase `js` la pone `public/js-flag.js` (script externo, compatible con CSP) antes del primer render, así el contenido solo se oculta para animarlo si el JS corre. El cotizador sin JS muestra un enlace directo a WhatsApp.
- **Modal**: `<dialog>.showModal()` da foco atrapado (el resto queda inerte) y Escape; el retorno de foco se hace explícito. Si se cierra con «Cotizar algo parecido» no se devuelve el foco, para no saltar de vuelta a la tarjeta.
- **Movimiento**: reveal solo con opacidad y desplazamiento ≤36 px; con `prefers-reduced-motion: reduce` se anula todo (reveal, cinta, flujo del diagrama, modal). Las secciones usan `overflow-x: clip` porque el desplazamiento previo al reveal causaba scroll horizontal.
- **Precios (referenciales)**: suma de rangos por proceso e integración, multiplicada por factores de rubro, volumen y urgencia, con descuento por paquete (8 % desde 3 procesos, 12 % con 5), redondeo a S/ 50 (mínimo hacia abajo, máximo hacia arriba). Soporte mensual por proceso. Todo en `src/data/precios.ts`; aviso visible «rango referencial; la cotización final requiere diagnóstico».
- **CSP**: scripts empaquetados como archivos (`assetsInlineLimit: 0`), sin atributos `style` ni estilos en línea. El JSON-LD es un bloque de datos y no lo bloquea.
- **Libro de Reclamaciones**: Nexo vende a empresas (B2B), por lo que no sería obligatorio para consumidores finales; ante la duda se incluye una versión de demo validada que no envía datos y entrega una hoja `LR-DEMO-…`. Se anota en Términos. Conviene revisión legal si se vuelve un negocio real.
- **Datos ficticios**: teléfono 51900000000, correo `@ejemplo.invalid`, RUC 20000000001 marcado como ficticio.
- **Paleta**: papel `#f1ede3`, tinta `#12110f`, lima `#c9f23b`, brasa `#b5300c` (5,3:1 sobre papel), cobalto `#2335c9` (7,4:1).

## Tras la revisión (UX, accesibilidad, SEO, legal)
- **Cotizador de 5 pasos** (negocio, procesos, volumen, integraciones opcionales, urgencia): cada grupo con su propia leyenda; el error enfoca el campo correcto y marca `aria-invalid`. Textos: «cinco preguntas cortas», «pocos minutos».
- **Plazos coherentes**: las urgencias indican solo el plazo de construcción (3-6, 2-3, 1-2 semanas) después del diagnóstico y la propuesta; el resultado muestra el plazo y el proceso lo aclara.
- **Consentimiento y WhatsApp**: casilla obligatoria antes de que exista el enlace `wa.me`, con aviso de que mensaje y número pasan a WhatsApp/Meta y enlace a Privacidad. Montos **sin IGV**, indicado en el resultado, Términos, FAQ y JSON-LD.
- **Héroe sin esperar a JS**: sin `data-reveal` en el primer pliegue; animaciones del diagrama finitas (4,8 s, WCAG 2.2.2); en móvil el diagrama se reemplaza por lista de 4 pasos. El indicador `js` va en un script en línea con hash en la CSP (sin petición bloqueante) y con respaldo: si el módulo de reveal no arranca en 3 s, se muestra todo (`reveal-off`).
- **Foco** del panel papel en cobalto (≥3:1). `Ejemplo de demo` junto a la cifra de cada caso. Cabecera fija en todos los anchos con enlaces a Preguntas y Contacto (desde 700 px). Tarjeta destacada por mejor cifra, tarjeta CTA y un solo desplazamiento de columna a 1100 px+.
- **Libro de Reclamaciones** con los campos de la hoja (proveedor, fecha, consumidor, domicilio, documento, teléfono, bien, monto, reclamo/queja, detalle, pedido, observaciones del proveedor, consentimiento); sin cifra de plazo fija.
- Privacidad (WhatsApp/Meta, titular, conservación, ANPD), Términos (marcas de terceros, ley aplicable, plazos ilustrativos), FAQ y textos de compromiso suavizados.
- `robots.txt` sin Disallow (queda el `noindex`), `Cache-Control` inmutable en `/_astro/*` y `/fonts/*`, 404 sin canonical, `og:url`.
- **Diferido hasta tener dominio**: `og:image`, `og:url`, `canonical` y `url` del JSON-LD siguen relativos; usar `site` en `astro.config.mjs` y URL absolutas al publicar. Quitar entonces `noindex`.
- **No aplicado** (bajas): navegación anterior/siguiente en el modal, enlaces servicio-caso, realineación del proceso, reducción de fuentes a variables, ocultar el conteo con «Todos».
