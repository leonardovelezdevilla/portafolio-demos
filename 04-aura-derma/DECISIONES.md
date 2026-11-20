# Decisiones

- **Stack**: Astro 7 estático, CSS propio, sin Tailwind ni frameworks. JS solo en tres islas (`<script>` de componente): comparador, agenda y Libro de Reclamaciones. Sin React/Preact.
- **Identidad**: salvia, crema y blanco; Instrument Serif para títulos y Albert Sans para texto. Tono de calma: sin fotos de antes/después ni promesas de resultados; el aviso médico es visible junto al comparador.
- **Comparador**: la tabla se renderiza completa en el servidor (los 8 tratamientos); el JS solo oculta filas y limita a 3. Sin JS se ven todos. En pantallas menores a 60rem la tabla pasa a tarjetas con etiquetas `data-label`.
- **Horarios ocupados simulados** (`src/lib/horarios.ts`): para cada (fecha, especialista) se siembra mulberry32 con el hash FNV-1a de `aura-derma|AAAA-MM-DD|id`, con 38 % de probabilidad de ocupado y mínimo de 3 libres por día. Determinista, sin almacenamiento; documentado también en la propia página.
- **Zona horaria**: Lima es UTC-5 sin horario de verano, así que se calcula con desplazamiento fijo (sin depender de la zona del navegador). Se exige 60 min de anticipación el mismo día.
- **Calendario**: 14 días desde hoy; domingos cerrados; cada especialista atiende ciertos días (`src/lib/especialistas.ts`).
- **Especialistas**: nombres ficticios, sin CMP ni RNE (mención «CMP y RNE se muestran en la clínica»). Sin fotos de personas para no sugerir identidades reales; avatares con iniciales.
- **Cierre de la agenda**: confirmación demo con enlace wa.me prellenado que el usuario abre; no se redirige solo. Los datos nunca salen del navegador.
- **Consentimiento Ley 29733**: casilla obligatoria con enlace a `/privacidad/` (abre en otra pestaña, con aviso), que menciona los datos de salud como sensibles.
- **Libro de Reclamaciones**: formulario validado con número de hoja `LR-DEMO-AAAA-NNNNNN` generado en el cliente; sin envío.
- **Seguridad**: CSP estricta en `public/_headers`; no hay scripts ni estilos en línea (solo JSON-LD, que no se ejecuta). `noindex` mientras sea demo.
- **Sin mapa incrustado**: evita terceros y CSP; la ubicación es texto con dirección ficticia.
- **Fotos**: solo dos, verificadas. Se descartó una tercera (procedimiento capilar) por no encajar con la marca.

## Cambios tras la revisión (UX, accesibilidad, SEO, legal)
- **Tipografía**: Instrument Serif (títulos, solo peso 400, `font-synthesis: none`) + Albert Sans (400 y 600), autohospedadas con OFL. Reemplazan a Fraunces + Inter. `og.png` regenerado.
- **Agenda**: el primer día con cupos queda preseleccionado y se ven sus horas; enlace a WhatsApp siempre visible; campos obligatorios con `*`, leyenda y `aria-required`; botón «Continuar a WhatsApp» y confirmación «Falta un paso». Opción «Tratamiento de interés» rellenada desde el comparador. Días en 7 columnas desde 48rem.
- **No disponible = `aria-disabled`** (no `disabled`), con texto «ocupado/pasó» y contraste ≥ 4.5:1; el clic se bloquea por script y siguen en el orden de tabulación. Leyenda con ejemplo tachado.
- **Errores**: el resumen mueve el foco; sus enlaces enfocan el control; se retira cada ítem al corregirlo; sin `aria-invalid` en `fieldset`; tras «Hacer otra solicitud» el foco va al título.
- **Comparador**: tabla transpuesta (tratamientos como columnas) desde 48rem y tarjetas con `dl` en móvil (sin trucos de `display:block` sobre tablas). Al llegar a 3, las demás quedan `aria-disabled` y un mensaje justo sobre las opciones explica el motivo. Aviso médico repetido bajo la tabla; sesiones presentadas como referencia, no compromiso. Precios «desde S/» con IGV incluido (tabla, nota, FAQ, términos).
- **Legal**: aviso «no escribas diagnósticos ni detalles clínicos» (WhatsApp pertenece a Meta) en el campo y en la confirmación; consentimiento expreso con finalidad, destinatarios y revocación; el DNI ya no viaja por WhatsApp (minimización). Privacidad ampliada (flujo a Meta, consentimiento, conservación, derechos con plazos, reclamo ante la ANPD). Libro de Reclamaciones con «15 días hábiles», D.S. 011-2011-PCM, fecha, bien contratado, monto reclamado, menor de edad, espacio del proveedor, conformidad y constancia.
- **Diseño**: sin borde lateral grueso en `.aviso`; bordes de controles ≥ 3:1; especialistas con una principal y lista compacta; testimonios con una cita grande; franja «Demo de portafolio» arriba; barra fija «Reservar cita» en móvil; el menú móvil se cierra al elegir enlace y con Escape.
- **SEO**: `robots.txt` con `Allow: /`; la 404 sin canonical ni og:url; JSON-LD con `<` escapado; CSP con `object-src 'none'`; cache de `og.png` y favicon; preload de los 3 pesos; hero con ancho 1280.
- **Pendiente hasta tener dominio**: `og:image`, `og:url`, `twitter:image` y `canonical` siguen relativos (convención del portafolio); al desplegar hay que pasarlos a URL absoluta y añadir `url`/`image` al JSON-LD.
- **No aplicado**: no se añadió `Cross-Origin-Opener-Policy` (opcional, sin beneficio en una demo estática). El enlace a privacidad sigue abriéndose en otra pestaña (avisado), para no perder el formulario.
