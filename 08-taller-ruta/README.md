# Taller Ruta (demo de portafolio)

Taller mecánico ficticio en Los Olivos, Lima. Demo de Vélez De Villa. Marca, precios, cupos y códigos son de ejemplo.

## Qué muestra
- **Cotizador de mantenimiento** por pasos: vehículo, kilometraje y servicios, con rango en S/ (IGV incluido) y aviso de inspección.
- **Reserva de cita**: lunes a sábado, turnos de mañana y tarde con cupos simulados, placa peruana opcional validada, consentimiento; termina en confirmación demo y enlace `wa.me`.
- **Seguimiento de ejemplo** (recibido, diagnóstico, aprobación, reparación, listo) con códigos `TR-DEMO-1001` a `1004`.
- Garantías, preguntas frecuentes, Privacidad, Términos y Libro de Reclamaciones de demo.

## Diseño
Ficha técnica: gris concreto, tinta y amarillo señal; Big Shoulders Display, Chivo y Chivo Mono. Ver `DECISIONES.md`.

## Capturas
Carpeta `capturas/` a 360, 768 y 1440 px: inicio, cotizador (paso 2 y resultado), reserva (y confirmación) y seguimiento.

## Cómo correrlo
```
npm install
npm run dev        # http://localhost:4338
npm run build
npm test           # Vitest: rangos, placa, turnos y fechas en America/Lima
npm run preview && npm run capturas
```
Stack: Astro, CSS propio, JS mínimo en islas, sin Tailwind. Créditos en `CREDITOS.md`.
