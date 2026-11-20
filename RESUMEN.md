# Resumen del portafolio de 5 demos (20-11-2026)

Abre [index.html](index.html) para ver el panel con las cinco demos.

## Lo hecho

Cinco demos con marca ficticia, cada una en su carpeta de este repositorio. Todas en **Astro 7 estático, CSS propio y JavaScript mínimo en islas, sin Tailwind**, con fuentes de Google Fonts autohospedadas (licencia OFL incluida), íconos Lucide, mobile-first (360/768/1440 sin scroll horizontal), accesibilidad AA, `prefers-reduced-motion`, Open Graph 1200×630 generado con captura (no IA), CSP estricta en `_headers`, Privacidad, Términos y Libro de Reclamaciones de demo, y formularios que terminan en WhatsApp prellenado con consentimiento expreso.

| Demo | Caso | Interacción clave | Tipografía | Fotos |
|---|---|---|---|---|
| [01-kipuflow](01-kipuflow) | SaaS de finanzas para freelancers | Calculadora de renta de 4.ª categoría (con tests), precios mensual/anual, FAQ | Schibsted Grotesk + Onest | Ninguna (composición CSS) |
| [02-vertice-studio](02-vertice-studio) | Tienda de zapatillas | Filtro categoría + talla, vista rápida, carrito en localStorage, pedido por WhatsApp | Anton + Space Mono | 9 verificadas, sin logos de terceros |
| [03-kuro-lima](03-kuro-lima) | Restaurante nikkei | Carta filtrable, reserva de mesa y omakase con horario de Lima | Cormorant Garamond + Figtree | 6 verificadas |
| [04-aura-derma](04-aura-derma) | Clínica dermatológica | Comparador de tratamientos, agenda con ocupados simulados, datos de salud protegidos | Instrument Serif + Albert Sans | 2 verificadas |
| [05-nexo-automatiza](05-nexo-automatiza) | Agencia de automatización | Casos con filtro y modal, cotizador de 5 pasos con rango en S/ | Unbounded + Bricolage Grotesque | Ninguna (SVG propio) |

**Revisión:** cada demo pasó por 4 revisores (UX, accesibilidad, SEO/rendimiento, seguridad/legal Perú) y su constructor aplicó todo lo crítico, alto y medio. Detalle por demo en su `DECISIONES.md`.

## Decisiones

- **Astro con CSS propio** en vez de HTML suelto, por tu cambio de instrucción y para igualar velezdevilla.com (mismas opciones: `output: 'static'`, `trailingSlash: 'always'`, `inlineStylesheets: 'never'`).
- **Libro de Reclamaciones de demo en las cinco**, aunque Kipuflow y Nexo venden sobre todo a profesionales y empresas: muestra el patrón y no estorba.
- **Vértice:** se reemplazaron todas las fotos con logos legibles (Nike, Jordan, Vans y otras) para no sugerir que una tienda ficticia vende marcas reales.
- **Kipuflow y Aura:** se cambiaron fuentes muy usadas (Space Grotesk, Inter, Fraunces) por otras con más carácter. Space Grotesk además ya está en velezdevilla.com.
- **URLs de Open Graph y canonical relativas** hasta que haya dominio, y `noindex` en todas (son demos).
- Fotos solo de páginas de Unsplash/Pexels abiertas de verdad; cuando no se pudo verificar, se usó composición tipográfica en lugar de inventar créditos.

## Pendiente

- **Dominio**: al publicar, poner `site` en `astro.config.mjs` para que og:image, og:url, canonical y JSON-LD queden absolutos, y quitar `noindex`.
- **Verificar en fuente oficial**: UIT 2026 (S/ 5 500) y reglas de 4.ª categoría en Kipuflow (SUNAT respondió 403 a los agentes); plazo del Libro de Reclamaciones donde quedó como «ejemplo».
- **Pruebas manuales**: lector de pantalla real, Safari y Firefox (se probó con Edge y scripts).
- **Mejoras bajas no aplicadas** listadas en cada `DECISIONES.md` (p. ej. anterior/siguiente en el modal de Nexo, filtros fijos en móvil en Kuro).
- Kipuflow: el texto pasó de Instrument Sans a Onest (a pedido), para evitar otra fuente muy vista.
- Las cabeceras de `_headers` (CSP, caché) funcionan en Cloudflare Pages o Netlify; en GitHub Pages no se aplican.

