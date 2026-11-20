# Decisiones

- **Identidad**: arquitectónica y luminosa: papel cálido, tinta azul pizarra y terracota; bordes de 2 px, ángulos rectos, sombras duras, numeración de pasos. Fuentes Familjen Grotesk + Hanken Grotesk (fuera de la lista prohibida).
- **Stack**: Astro estático, CSS propio, JS solo en islas (filtros, galería, simulador, agenda, libro). Sin frameworks.
- **Listado**: las 10 tarjetas se generan en el build y el filtro solo las oculta/ordena, así que sin JS se ven todas. Filtros y orden viven en la URL (`?distrito=...&dormitorios=...`), con parámetros inválidos ignorados. Lógica pura en `src/lib/filtros.ts`.
- **Moneda**: precios en S/ como precio total de ejemplo (se avisa que no se desglosa IGV ni gastos notariales y registrales). US$ referencial con tipo de cambio fijo de demo S/ 3,75, anotado en la interfaz y en `src/data/departamentos.ts`.
- **Simulador**: método francés con TEA convertida a tasa mensual efectiva; inicial mínima 10 %; plazo 5-30 años enteros; TEA 1-40 % con 10 % de ejemplo editable. La TCEA no se calcula (depende de seguros y comisiones de cada entidad) y se dice. Aviso grande no ocultable sobre el formulario. Fondo MiVivienda solo como mención informativa, sin requisitos ni montos. El resultado se actualiza al escribir pero solo se anuncia a lectores de pantalla al confirmar un campo.
- **Agenda**: día desde mañana hasta 45 días, lunes a sábado, sábados solo mañana; casilla de consentimiento sin marcar; aviso de WhatsApp (Meta); termina en un enlace `wa.me` a `51900000000` con mensaje codificado. Resumen de errores (sin role alert) que lleva el foco al primer campo inválido; franjas no disponibles realmente deshabilitadas con texto.
- **Galería**: sin JS son cuatro fotos apiladas; con JS carrusel con botones, miniaturas, contador, flechas/Inicio/Fin y anuncio solo al cambiar.
- **Plano**: SVG generado por código según dormitorios y baños, marcado como esquema no a escala.
- **Fotos**: nueve verificadas (6 fachadas y 3 interiores). Cada proyecto tiene su fachada; en el segundo departamento del proyecto la portada es un interior distinto. Cada ficha lleva 3 fotos con sello visible «Foto referencial de fachada» o «Acabados referenciales». No se hallaron fachadas verificadas de Lima: se usaron fachadas neutras y se evita sugerir lo contrario.
- **Geografía**: distritos del sur (Chorrillos, Lurín, San Juan de Miraflores, Villa El Salvador, Villa María del Triunfo). Zonas rotuladas «sector de ejemplo» y sin afirmaciones de cercanía.
- **Datos referenciales**: la ficha lleva una salvedad sobre áreas, entrega y equipamiento. La cuota inicial mínima de 10 % y el rango de plazo se declaran valores de ejemplo.
- **Libro de Reclamaciones**: hoja completa DS 011-2011-PCM con constancia imprimible; sin casilla de autorización condicionante.
- **Pendiente de dominio**: `og:image`, `og:url` y canonical son relativos hasta tener dominio; `noindex` solo en meta.
- **JSON-LD**: cada ficha emite `Offer` (PEN, disponibilidad) con el `Apartment` ficticio dentro.
- **Libro**: correlativo de ejemplo fijo, firma, observaciones/acciones del proveedor y fecha de comunicación de la respuesta.
- **No aplicado**: mapa ilustrado de distritos y línea de tiempo vertical (UX 2 y 12, baja prioridad; se resolvió con lista de distritos enlazada); plano variado por proyecto.
