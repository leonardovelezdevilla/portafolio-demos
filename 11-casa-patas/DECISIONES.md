# Decisiones

## Stack y reglas
- Astro estático (`trailingSlash: 'always'`, `inlineStylesheets: 'never'`), CSS propio en `src/styles/global.css`, sin Tailwind ni frameworks de UI. JS solo en islas (`src/scripts/`): guía de vacunas, reserva, horario «ahora», menú móvil y Libro de Reclamaciones. Sin JS el contenido y los precios se ven; los formularios muestran un aviso con enlace a WhatsApp.
- Fuentes: **Gabarito** (títulos, 700) + **Rethink Sans** (texto 400/600), autohospedadas. Se descartaron Literata y Nunito Sans.
- Dirección B «Barrio y foto» (elegida por el dueño): paleta piedra #eeecea, superficie #e4e1dd, papel #f7f6f4, tinta #2b2a28, acento oliva #4f5d47 (botón principal, enlaces) y rojo #a3221b solo en urgencias y errores. Planos de color, sin degradados, radio 14 px. Sin etiquetas en mayúsculas sobre los títulos y sin pies de foto: los créditos van en una línea del pie y en CREDITOS.md.
- Héroe: foto a sangre (sin copias espejadas ni parches) con caja sólida del color del fondo a la izquierda desde 1200 px; en celular, foto arriba (38svh) y texto debajo, con Reservar y horario visibles en 360×780 sobre la barra fija. Entre 768 y 1199 px la foto va arriba y el texto debajo, porque la caja taparía la cara del médico. Urgencias va en la cabecera y la barra móvil, no en el héroe.
- «Una visita en Casa Patas»: 4 capítulos con foto grande (componente Capitulo.astro), sin animaciones de scroll. Las fotos de la guía y la reserva se quitaron para no repetirlas; no se añadieron fotos nuevas (se reutilizan las 5 de Pexels). Las fotos no son enlaces, así que no hay zoom al pasar el mouse; el enlace va en el texto.
- Urgencias compacta: «Qué hacer mientras llegas» es un <details> que arranca abierto desde 900 px (src/scripts/urgencias.ts) y cerrado en celular.
- Precios por categoría con números grandes en Gabarito; ubicación con «Magdalena del Mar» como momento tipográfico (se quitó el mapa ilustrado).
- Foco en dos tonos (anillo oscuro interno + halo blanco externo) para cumplir ≥ 3:1 sobre cualquier fondo, incluido el rojo de urgencias y el verde del pie.
- og:image y og:url son rutas relativas (`/og.png`, `/`) hasta tener dominio; hay que volverlas absolutas al publicar. `robots.txt` permite todo y el `noindex` va solo en `<meta>`.
- `_headers`: CSP estricta y `Cache-Control: public, max-age=31536000, immutable` solo en `/_astro/*` y `/fonts/*`; la regla `/*` no define `Cache-Control`, así que no lo anula.
- La 404 no lleva canonical.

## Reserva de cita (`src/lib/fechas.ts`, `reserva.ts`)
- Horario: lun-sáb 9:00-20:00, dom 9:00-13:00, hora de Lima (UTC-5, sin horario de verano). Citas cada 30 min; la última empieza 30 min antes del cierre.
- Consulta y vacuna: 2 h de anticipación. Baño y peluquería: **turnos propios** (9:00, 11:30, 14:00, 16:30), solo lun-sáb, 24 h de anticipación; pide tamaño porque el precio depende de él. Cierres de ejemplo: 25-dic y 1-ene. Máximo 60 días adelante. No hay fechas pasadas.
- Urgencias fuera de la reserva: aviso rojo sobre el formulario y banda propia.
- El texto de «síntomas» es opcional, de máximo 200 caracteres y **no viaja en el mensaje de WhatsApp** (ni el celular ni el apellido). Se muestra solo en la confirmación en pantalla. Es un dato de salud animal ligado a una persona: pedir lo mínimo y advertir que no se escriban detalles clínicos por WhatsApp.
- Consentimiento: casilla sin marcar, obligatoria, con enlace a Privacidad y el aviso «Al abrir WhatsApp, tu mensaje y tu número pasan a WhatsApp (Meta)».
- Las horas ya vencidas aparecen como «no disponible» y con `disabled` (texto, no solo color). El resumen de errores mueve el foco al primer campo inválido. No hay disponibilidad simulada de otros clientes: solo se bloquea lo vencido o fuera de horario.

## Guía de vacunación y desparasitación referencial (`src/lib/vacunas.ts`)
Lógica pura con tests. Es orientativa y **debe verificarse con el médico** antes de presentarla como contenido de una clínica real.

Esquema modelado (semanas de vida; cada hito tiene una ventana):
- Perro: desparasitación interna 2-4, 5-7, 8-10, 11-13 sem; múltiple 6-8, 9-11, 12-16 sem y refuerzo a los 6-12 meses; antirrábica desde las 12 sem (ventana 12-16). La guía ya no afirma que sea «exigida por norma»: dice que suele pedirse en trámites, viajes y campañas y marca «verificar»; la obligatoriedad legal no se confirmó leyendo la norma (la revisión legal advierte que está ligada al perro, Ley 27596, y no es claro que aplique igual al gato).
- Gato: igual para desparasitación; triple felina 8-10, 12-14, 16-18 sem y refuerzo a los 6-12 meses; antirrábica desde las 12 sem.
- De por vida (sin fechas, porque dependen de la última dosis del carnet): refuerzo anual de múltiple/triple y antirrábica, desparasitación cada 3-6 meses, antiparasitario externo mensual o trimestral según producto, vacunas según riesgo (tos de las perreras; leucemia felina).
- Con edad aproximada las fechas se rotulan «aproximado». Menores de 2 semanas: sin vacunas, se deriva a consulta. Edad > 25 años o nacimiento futuro: error.

Fuentes consultadas:
1. Práctica común en Lima y guías locales, tal como se recogieron en `VETDV/INVESTIGACION.md` §3.4: https://modelo.pe/blog/vacunas-obligatorias-para-perros-y-gatos-peru/ y https://diariocorreo.pe/salud/dia-mundial-contra-la-rabia-vacunas-y-controles-que-necesitan-perros-y-gatos-noticia/ (blogs comerciales/prensa, a verificar).
2. Guías para la vacunación de perros y gatos en Perú (CONCYTEC/ALICIA, UNMSM): https://alicia.concytec.gob.pe/vufind/Record/REVUNMSM_49695385a0e94aaf49d2aec67a7b0f21 (solo registro; no se leyó el texto completo).
3. WSAVA, *2024 Guidelines for the Vaccination of Dogs and Cats*: dosis de vacunas esenciales cada 2-4 semanas con la última a las 16 semanas o más; revacunación a las 26 semanas o después. Se leyó un resumen en búsqueda, no el PDF completo: https://wsava.org/wp-content/uploads/2024/05/2024-Guidelines-for-the-Vaccination-of-Dogs-and-Cats.pdf
4. Minsa (portal gob.pe, campañas VanCan) y SENASA (requisitos de viaje): antirrábica desde los 3 meses y refuerzo anual para perros y gatos; es la única vacuna exigida por norma. Se vio mediante resultados de búsqueda de gob.pe, no se descargó la norma.
5. Un estudio de veterinarias de Santa Anita (Lima) menciona desparasitar a las 4, 8 y 12 semanas como práctica clínica (referencia secundaria).

**Verificar con el médico:** (a) las edades exactas de la primera dosis de la múltiple/triple (los textos consultados difieren entre 6 y 8 semanas); (b) el intervalo de refuerzos: la WSAVA 2024 admite revacunar a las 26 semanas y espaciar luego los refuerzos de vacunas esenciales, mientras que en Lima es común el refuerzo anual, que es lo que muestra la guía; (c) el producto y la frecuencia del antiparasitario; (d) la edad de la antirrábica; (e) no se encontró un esquema oficial de Minsa/Senasa para desparasitación de cachorros.

## Equipo, testimonios y precios
- Equipo ficticio sin números de colegiatura: los médicos llevan «CMVP visible en la clínica». Sin fotos de personas (las fotos son de stock): monogramas.
- Sin testimonios (se quitaron en la versión publicada del 20-11-2026). Sin cifras, calificaciones ni «n.º 1».
- Precios «desde S/», con IGV incluido (dicho en la sección, en la reserva y en las FAQ). Cirugías menores: «solo previa evaluación del médico».

## Libro de Reclamaciones (DS 011-2011-PCM)
Hoja con proveedor (razón social ficticia, RUC ficticio marcado, dirección) dentro de la hoja, número de hoja LR-AAAA-NNNNNN, fecha, consumidor (documento, domicilio, teléfono, correo), menor de edad con padre/madre/apoderado, bien contratado y descripción, monto, definición de reclamo y queja, detalle, pedido, plazo de 15 días hábiles, y constancia imprimible con todos los campos (CSS `@media print`). El tratamiento de datos es un aviso informativo con enlace a Privacidad, sin casilla condicionante. No envía nada.

## Pendiente fuera de la demo
Con una clínica real: dominio y URLs absolutas, números de CMVP, revisión del esquema por el médico, asesoría legal para privacidad y política de citas, y confirmar vigencia del reglamento del Libro de Reclamaciones (INVESTIGACION.md §4.3 señala modificaciones en trámite).

## Cambios tras la revisión (UX, accesibilidad, SEO, legal)
- **Sin atributos `style=`**: la CSP (`style-src 'self'`) los bloquea; todo pasó a clases en `global.css` (`.foto--*`, `.fila--edad`, `.urgencias ...`). `dist/` no contiene ningún `style=`.
- **Urgencias**: aviso de horario visible al inicio de la banda; botón «Llamar» (`tel:`, número ficticio) además de WhatsApp; si la clínica está cerrada (hora de Lima, `horario.ts`) aparece un aviso adicional y el botón pasa a «Escribirnos (respondemos al abrir)» con mensaje de consulta, no de «voy en camino». Primeros auxilios sin asumir el sexo de la mascota y sin recomendar mover con manta: «muévela lo mínimo y con apoyo firme». El acceso a Urgencias de la cabecera aparece desde 640 px y la barra móvil (hasta 767 px) tiene Reservar, Urgencias (a la banda) y Llamar; así no hay hueco entre 768 y 959 px.
- **Guía**: aviso corto sobre el formulario y completo solo en el resultado; etiquetas de rango («Podría tocar ahora (confirma con el médico)», «Rango habitual»); lo ya pasado, lo próximo y lo periódico van en `<details>` cerrados; el botón de reservar queda arriba del resultado y precompleta especie y edad en la reserva. El resultado es `role="region"` con encabezado y recibe el foco.
- **Errores**: los resúmenes ya no son `role="alert"` (no se reanuncian al corregir); el foco va al primer campo inválido y cada campo se describe con `aria-describedby`. Radios y selects obligatorios llevan `required`. Se quitaron los `outline: none` de los contenedores enfocables.
- **Reserva**: el botón dice «Preparar mensaje de cita» y la confirmación «Falta un paso: envía tu solicitud por WhatsApp» con «Código de tu solicitud (demo)»; el mensaje dice «solicitar una cita».
- **Legal**: política sin penalidad por cancelación tardía o inasistencia y con recargo de baño aceptado antes de empezar; privacidad con transferencia internacional y lista de lo que haría un negocio real (RNPDP, conservación, encargados); nombres del equipo ficticios sin «Dr./Dra.»; número de WhatsApp rotulado «ficticio»; la FAQ distingue consulta sin cita y baño solo con turno.
- **SEO**: JSON-LD con `hasOfferCatalog` y `priceRange`; descripciones de portada y privacidad ≤ 155 caracteres; fotos verticales con `widths` 480/720/960. `image`, `url`, og:image y og:url siguen relativos hasta tener dominio (completarlos al publicar). No se aplicó el preload de la imagen del hero ni se quitó Literata 400 (ahorro de ~20 KB; opcional).
- **Pendiente al publicar**: `Strict-Transport-Security` en `_headers` (solo con dominio propio y HTTPS) y revisar que `+51 900 000 000` no pertenezca a una línea real (la demo lo rotula como ficticio).

## Correcciones tras la revisión del rediseño
- Reserva con éxito: `reserva.ts` ahora hace `ok.focus({ preventScroll: true })` + `scrollIntoView({ block: 'start' })` (sin animación con `prefers-reduced-motion`), y los botones de WhatsApp van sobre el resumen. Es un cambio mínimo en la isla, sin tocar `src/lib`.
- Errores de formulario: el foco va al resumen (`tabindex=-1`), que lleva a cada campo. La sugerencia de fecha por cierre ahora es un botón «Usar el …».
- Guía: sin insignia repetida en «Podría tocar ahora» y sin mayúsculas; el aviso completo va debajo del resultado (arriba solo el corto). La etapa «mayor» queda pendiente (lógica de `vacunas.ts`).
- Menú móvil oculto desde el HTML (sin salto) y, sin JS, un `<noscript>` con los enlaces; se cierra con el CTA de Urgencias; `overscroll-behavior: contain`.
- Urgencias: `<details>` ya viene abierto en el HTML y el JS lo pliega solo en celular; con el aviso de cerrado se oculta el de horario.
- Precios: columnas según cantidad de ítems (3, 4, 5) y sin huérfanos; `S/` con espacio duro. og.png con paleta (< 300 KB) y sin viuda. Favicon en la paleta nueva. Nota «Fotos ilustrativas de Pexels» bajo «Una visita». Borrada la fuente Gabarito 600 sin uso.

## Versión publicada (velezdevilla.com/portafolio/casa-patas/)
- Se mantienen las decisiones de la publicación del 20-11-2026: el WhatsApp llega al número del estudio (`TELEFONO_DEMO`), no hay botón «Llamar» ni testimonios, y la franja común de demo la añade `scripts/publicar.mjs` del portafolio.
