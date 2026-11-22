# Habitat Sur (demo de portafolio)

Inmobiliaria ficticia de departamentos en Chorrillos y Lima Sur, hecha para el portafolio de Vélez De Villa. Marca, proyectos, precios y teléfonos son ficticios.

## Qué muestra
- Inicio largo: héroe con fachada a sangre, proyectos con su plano SVG, cómo se calcula la cuota (ejemplo calculado al construir), distritos con foto y agenda de visita.
- Listado de 10 departamentos con filtros accesibles (distrito, dormitorios, precio, área, etapa, orden) y URL compartible.
- Ficha por ruta `/departamento/[slug]/` con galería accesible, características y plano esquemático en SVG.
- Simulador de crédito hipotecario **referencial** (método francés, TEA editable, inicial mínima 10 %, TCEA no calculada, aviso de que no es oferta). Menciona Fondo MiVivienda solo como información.
- Agenda de visita que termina en `wa.me` prellenado, con consentimiento y aviso de WhatsApp.
- Privacidad, términos, Libro de Reclamaciones completo y 404.

## Capturas
Carpeta `capturas/` (360, 768 y 1440): inicio, filtros, ficha y simulador.

## Correr
```
npm install
npm run dev      # http://localhost:4339
npm test         # Vitest: cuota francesa, filtros, validaciones
npm run build
npm run capturas # con el preview en 4339 y Edge instalado
```
Stack: Astro, CSS propio, JS en islas. Ver DECISIONES.md y CREDITOS.md.

Dirección visual «Arquitectura»: piedra, tinta y bronce; Libre Caslon Display + Geologica.
