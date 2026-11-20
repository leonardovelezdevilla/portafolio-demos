# Lumen · academia de inglés (demo de portafolio)

Demo ficticia de Vélez De Villa: academia de inglés en Pueblo Libre para jóvenes y adultos. Astro estático, CSS propio y JS mínimo en islas.

## Qué muestra

- **Test de nivel** de 12 preguntas propias (gramática y vocabulario), una por pantalla, con «Pregunta N de 12», progreso, botón para volver y resultado A1 a C1 referencial.
- **Horarios por nivel** con filtros (nivel, modalidad, turno, ocultar sin vacantes) y vacantes simuladas de forma determinista: «N vacantes», «Últimas N» y «Sin vacantes».
- **Matrícula** validada: si el alumno es menor de edad exige los datos del padre, madre o apoderado; termina en una confirmación de demo y un enlace a `wa.me` prellenado.
- Precios por ciclo en S/ con IGV incluido y materiales aparte, docentes ficticios, Privacidad, Términos y Libro de Reclamaciones de demo.

## Capturas

`capturas/` (360, 768 y 1440): `inicio`, `test-curso`, `test-resultado`, `horarios-filtrados`, `matricula-menor-errores` y `matricula-confirmacion`.

## Correrlo

```bash
npm install
npm run dev        # http://localhost:4340
npm test           # Vitest: puntaje y nivel, vacantes, validación de menor de edad
npm run build
npm run preview    # puerto 4340
npm run capturas   # requiere el preview y Edge instalado
npm run og         # regenera public/og.png
```

Lógica pura en `src/lib` (`test-nivel.ts`, `vacantes.ts`, `matricula.ts`, `fechas.ts`) y datos en `src/data`. Ver `DECISIONES.md` y `CREDITOS.md`.

Todo es ficticio: no se envía ni se guarda ningún dato.
