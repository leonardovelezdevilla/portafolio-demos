# Decisiones

## Reglas tributarias de la calculadora (referencial)
Fuentes consultadas por búsqueda web (las páginas de gob.pe y personas.sunat.gob.pe devolvieron 418/403 al descargarlas, así que se verificó con los resúmenes del buscador; **pendiente de contraste manual**):
- gob.pe, «Calcular el impuesto a la renta de cuarta categoría»: https://www.gob.pe/7318
- SUNAT, trabajador independiente, declaración y pago: https://personas.sunat.gob.pe/trabajador-independiente/declaracion-pago (cita: deducción anual fija de 7 UIT para cuarta y quinta)
- SUNAT, RS 000390-2025/SUNAT (suspensión de retenciones 2026, topes S/ 4 010 mensual y S/ 48 125 anual): https://www.sunat.gob.pe/legislacion/superin/2025/000390-2025.pdf
- UIT 2026 = S/ 5 500 (DS 301-2025-EF, según prensa: Infobae, El Comercio, 17-12-2025). Constante `UIT_2026` con comentario «verificar valor oficial».

Reglas implementadas: retención de 8 % si el recibo **supera** S/ 1 500 (evaluada por recibo); deducción de 20 % de la renta bruta anual con tope de 24 UIT; luego 7 UIT; escala 8 % (≤5 UIT), 14 % (≤20), 17 % (≤35), 20 % (≤45), 30 % (>45); saldo = impuesto anual − retenciones. Simplificaciones: ingreso constante 12 meses, sin gastos por boletas (3 UIT), otras rentas ni pagos a cuenta mensuales. Hay aviso visible y tests (`npm test`).

## Otras
- Precios mensual/anual: radios estilizados (CSS `:has`), funcionan sin JS; no se usó role=switch.
- Sin fotos: ver CREDITOS.md. Las líneas de «Sin Libro de Reclamaciones» de la versión inicial quedan reemplazadas por lo anterior.
- Libro de Reclamaciones: tras la revisión se añadió `/libro-reclamaciones/` de demo (formulario validado, número de hoja, sin envío) porque la demo muestra planes con precio al público; enlazado en el pie.
- Tipografía: se cambió Space Grotesk/Inter Tight por Schibsted Grotesk + Instrument Sans (más carácter, y distintas de velezdevilla.com). Luego, a pedido, el texto pasó de Instrument Sans (también muy vista) a Onest, una sans de lectura menos común con buena legibilidad en tamaños pequeños.
- Revisión: consentimiento con casilla sin marcar, aviso de WhatsApp (Meta), IGV incluido, montos sin decimales (Intl es-PE) en toda la página, aria-live solo en un resumen sr-only con debounce, plan prellenado por `?plan=`, caché inmutable en _headers, robots sin Disallow (solo meta noindex).
- Formulario: confirmación demo + botón wa.me prellenado (número 51900000000); no se envía nada.
- CSP estricta: sin estilos en línea (`style=`) ni scripts en línea; `assetsInlineLimit: 0` para que los scripts salgan como archivos. Único `<script>` en línea es JSON-LD (no ejecutable).
- `noindex` mientras sea demo; robots.txt con Disallow.
- Sin React ni otros frameworks: scripts TypeScript de Astro (calculadora y formulario). Acordeón con `<details>`.
- Estética: vidrio sobre fondo oscuro con resplandores verde/azul; texto secundario #b4c2cf sobre vidrio oscuro (≈9:1).
