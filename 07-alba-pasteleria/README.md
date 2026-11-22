# Alba Pastelería (demo 07 del portafolio Vélez De Villa)

Pastelería ficticia de tortas a pedido en Jesús María, Lima. Muestra un **configurador de torta con precio en vivo**, catálogo filtrable con alérgenos visibles, fecha de entrega con reglas reales (48 h, 72 h para 2 pisos, lunes y feriados cerrados, hora dentro del horario, zona America/Lima), recojo o delivery por distrito y pedido por WhatsApp con consentimiento. Confirmación demo con política de adelanto del 50 % por Yape/Plin (no se cobra nada). Marca, precios, RUC y teléfono son ficticios.

## Qué incluye
- Catálogo de 7 tortas con filtros por ocasión, sabor y porciones; cada tarjeta muestra sus alérgenos y abre el configurador precargado.
- Configurador: tamaño, bizcocho, relleno, cobertura, decoración y mensaje (máx. 30 caracteres). Configurador en 4 pasos con resumen accesible con precio en S/ (IGV incluido) y alérgenos acumulados.
- Entrega: recojo gratis o delivery por distrito (12 distritos con costo; 2 pisos con recargo), fecha y hora validadas.
- Pedido por `wa.me` prellenado, con casilla de consentimiento sin marcar y aviso de Meta.
- Política de adelanto, cambio de fecha y cancelación (ejemplo) visible antes del pedido, barra fija móvil con total y alérgenos, fechas sugeridas.
- Libro de Reclamaciones de demo (D. S. 011-2011-PCM), Privacidad, Términos y 404.

## Diseño
Dirección «Vitrina» (rediseño 2026-11): héroe oscuro con la torta a sangre, catálogo en mosaico de tamaños distintos, banda frambuesa y configurador en 4 pasos con resumen fijo. Crema, cacao y frambuesa #b8324a; Gloock para titulares y Outfit para texto. Sin Tailwind, JS solo en islas.

## Capturas (360, 768 y 1440)
En `capturas/`: `*-inicio` (página completa) y `*-configurador` (paso «Acabado»), `*-fecha-invalida`, `*-pedido-listo` y `360-barra-movil`.

## Cómo correrlo
```
npm install
npm run dev        # http://localhost:4337
npm test           # Vitest: precio, fechas en America/Lima, distritos, validación
npm run build
npm run preview    # http://localhost:4337
npm run capturas   # con el preview arriba; usa Edge instalado (playwright-core)
```

Ver `DECISIONES.md` y `CREDITOS.md`. Demo de portafolio — Vélez De Villa.
