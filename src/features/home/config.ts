/**
 * Fotos de fondo del hero del home. Viven en `public/home/` para no depender de
 * Cloudinary: el asset anterior (`ariz/home/hero`) devolvia 404 y dejaba la
 * cabecera sin imagen.
 *
 * Son decorativas (el hero las rotara como fondo), por eso no llevan texto
 * alternativo: el contenido accesible lo aportan el titular y el buscador.
 */
export const HOME_HERO_IMAGES = [
  "/home/1.jpg",
  "/home/2.jpg",
  "/home/3.jpg",
  "/home/4.jpg",
] as const;

/** Milisegundos entre cambios de foto de fondo del hero. */
export const HOME_HERO_INTERVAL_MS = 5000;
