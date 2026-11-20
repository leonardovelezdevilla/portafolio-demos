import type { ImageMetadata } from 'astro';

const modulos = import.meta.glob<{ default: ImageMetadata }>('../assets/fotos/*.jpg', { eager: true });

export function foto(clave: string): ImageMetadata {
  const m = modulos[`../assets/fotos/${clave}.jpg`];
  if (!m) throw new Error(`Foto no encontrada: ${clave}`);
  return m.default;
}
