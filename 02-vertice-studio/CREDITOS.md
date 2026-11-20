# Créditos

## Fotografías

Cada foto se descargó de la página indicada, que se abrió y verificó el 2026-11-20. Están en `src/assets/fotos/`. Licencias: [Unsplash License](https://unsplash.com/license) y [Pexels License](https://www.pexels.com/license/). Ninguna imagen es generada por IA. Se descartaron las fotos donde se veían logotipos o marcas reales (Nike/Jordan, Vans, LV, y rótulos de marcas pequeñas); las que quedan no muestran logos legibles.

| Archivo | Fotógrafo/a | Página | Licencia |
|---|---|---|---|
| `zapatillas-fondo-naranja.jpg` | Rauf Alvi | https://unsplash.com/photos/a-pair-of-sneakers-on-an-orange-background-rBLItzudueg | Unsplash |
| `rojas-lona.jpg` | Paulina Milde-Jachowska | https://unsplash.com/photos/a-pair-of-red-sneakers-with-white-laces-bJqg5g6EANs | Unsplash |
| `azul-lona-madera.jpg` | Antonino Visalli | https://unsplash.com/photos/a-pair-of-blue-sneakers-sitting-on-top-of-a-wooden-floor-JavdKoyGF28 | Unsplash |
| `blancas-hojas.jpg` | Rahul Pandit | https://www.pexels.com/photo/photo-of-person-wearing-white-sneakers-2539757/ | Pexels |
| `blancas-sol.jpg` | MART PRODUCTION | https://www.pexels.com/photo/a-person-wearing-white-shoes-and-white-socks-7880267/ | Pexels |
| `balon-violeta.jpg` | Mike (@mike-468229) | https://www.pexels.com/photo/close-up-photography-of-shoes-near-ball-1192043/ | Pexels |
| `grises-concreto.jpg` | Ushindi Namegabe | https://www.pexels.com/photo/a-person-wearing-white-sneakers-7176970/ | Pexels |
| `turquesa-cenital.jpg` | Abdullah Alsaibaie | https://www.pexels.com/photo/shoes-on-gray-background-21404807/ | Pexels |
| `negras-adoquin.jpg` | Barbara Olsen | https://www.pexels.com/photo/crop-person-in-sneakers-on-street-7869610/ | Pexels |

Son 9 fotos distintas para 12 productos: `blancas-sol` (Ráfaga Air y Trama Run), `balon-violeta` (Violeta Pro y Cancha Pro) y `blancas-hojas` (Nodo 91 y Pila Blanca) se usan dos veces con encuadres distintos, y `zapatillas-fondo-naranja` es a la vez la foto del inicio y la de Musgo Knit. Los archivos de fotos anteriores (con logos) se eliminaron.

`public/og.png` se genera con `scripts/og.html` + `scripts/og.mjs` (HTML y Playwright) usando `zapatillas-fondo-naranja.jpg` (Rauf Alvi, Unsplash).

## Tipografías (SIL OFL 1.1, autohospedadas en `public/fonts/`)

- Anton, vía `@fontsource/anton`. Licencia: `public/fonts/OFL-Anton.txt`.
- Space Mono (400 y 700), vía `@fontsource/space-mono`. Licencia: `public/fonts/OFL-SpaceMono.txt`.

## Íconos

[Lucide](https://lucide.dev) vía `lucide-static` (licencia ISC, copia en `public/licencias/LICENSE-lucide-ISC.txt`), como SVG en línea.

## Herramientas

Astro, Vitest, sharp y playwright-core (licencias MIT / Apache-2.0).
