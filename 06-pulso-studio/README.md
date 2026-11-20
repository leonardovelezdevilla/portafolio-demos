# Pulso Studio (demo de portafolio)

Estudio ficticio de pilates reformer y funcional en Surco, Lima. Demo de Vélez De Villa: **marca, instructoras, dirección, RUC, precios y cupos son ficticios**.

## Qué muestra
- Horario semanal con filtros por tipo, nivel y día, y cupos simulados (Llena / Últimos N cupos).
- Reserva de clase validada (celular peruano, primera vez con prueba a S/ 35, lesión como dato sensible, consentimiento) que termina en confirmación demo y WhatsApp prellenado.
- Planes mensuales y paquetes en S/ con IGV indicado, FAQ, ubicación ficticia, Privacidad, Términos y Libro de Reclamaciones de demo.

## Stack
Astro (estático), CSS propio, JS mínimo en islas, Vitest. Red Hat Display y Public Sans autohospedadas, íconos Lucide.

## Correr
```
npm install
npm run dev        # http://localhost:4336
npm test
npm run build && npm run preview
npm run capturas   # requiere preview en 4336 y Edge instalado
```

## Capturas
En `capturas/`: inicio, horario filtrado, reserva con errores y con éxito, a 360, 768 y 1440 px.

Ver `DECISIONES.md` y `CREDITOS.md`.
