import sala from '../assets/fotos/sala-nhachill.jpg';
import dormitorio from '../assets/fotos/dorm-vakhtbovych-5998132.jpg';
import cocina from '../assets/fotos/cocina-lisaanna-19857263.jpg';
import extA from '../assets/fotos/ext-jimenez-30587187.jpg';
import extB from '../assets/fotos/ext-shox-31656143.jpg';
import extC from '../assets/fotos/ext-shum-WKK.jpg';
import extD from '../assets/fotos/ext-laflamme-90k.jpg';
import extE from '../assets/fotos/ext-gottstein-28668299.jpg';
import extF from '../assets/fotos/ext-untal3d-21284473.jpg';
import type { FotoClave } from './departamentos';

export interface Foto { src: ImageMetadata; alt: string; autor: string; sello: string; }
const fachada = 'Foto referencial de fachada; no es el proyecto';
const acabado = 'Acabados referenciales; no es este departamento';

export const FOTOS: Record<FotoClave, Foto> = {
  sala: { src: sala, alt: 'Sala luminosa con ventanales cubiertos por cortinas blancas, sofá gris, butaca de ratán y mesas de centro', autor: 'Nha Chill (Unsplash)', sello: acabado },
  dormitorio: { src: dormitorio, alt: 'Dormitorio amplio con cama matrimonial gris, butaca, cortinas largas y piso de madera clara', autor: 'Max Vakhtbovych (Pexels)', sello: acabado },
  cocina: { src: cocina, alt: 'Cocina blanca angosta con ventana al fondo y mueble de madera', autor: 'Lisa Anna (Pexels)', sello: acabado },
  'ext-a': { src: extA, alt: 'Fachada de edificio con balcones de madera llenos de plantas', autor: 'Felipe Jiménez (Pexels)', sello: fachada },
  'ext-b': { src: extB, alt: 'Edificio de departamentos blanco con balcones de madera y barandas oscuras', autor: 'SHOX ART (Pexels)', sello: fachada },
  'ext-c': { src: extC, alt: 'Detalle de fachada con balcones de lamas y ventanas amplias', autor: 'KC Shum (Unsplash)', sello: fachada },
  'ext-d': { src: extD, alt: 'Esquina de un edificio de ladrillo rojizo con ventanas, iluminada por el sol de la tarde', autor: 'Theo Laflamme (Unsplash)', sello: fachada },
  'ext-e': { src: extE, alt: 'Edificio de departamentos blanco de pocos pisos con ventanas y cielo despejado', autor: 'Nici Gottstein (Pexels)', sello: fachada },
  'ext-f': { src: extF, alt: 'Detalle de torre de departamentos con balcones de baranda metálica', autor: 'Deivis Sandoval (Pexels)', sello: fachada },
};
