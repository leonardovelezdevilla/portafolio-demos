// Recorta el borde izquierdo de la foto original de Unsplash para quitar la inscripción parcial del neumático.
// Se ejecuta una sola vez sobre el original descargado (1600x1067).
import sharp from 'sharp';
import { renameSync } from 'node:fs';
const f = 'src/assets/fotos/suspension-taller.jpg';
const { width, height } = await sharp(f).metadata();
if (width !== 1600) throw new Error('La foto ya fue recortada o no es el original de 1600 px');
await sharp(f).extract({ left: 250, top: 0, width: 1350, height }).jpeg({ quality: 88 }).toFile(f + '.tmp');
renameSync(f + '.tmp', f);
console.log('recortada');
