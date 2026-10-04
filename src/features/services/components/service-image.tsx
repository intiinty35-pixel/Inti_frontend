"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { SERVICE_IMAGE_FALLBACK } from "@/features/services/config";

export interface ServiceImageProps {
  src: string;
  alt: string;
  /** Clases de tamaño/redondeo. Debe incluir altura: una imagen sin alto no se ve. */
  className?: string;
  /** Estilo extra aplicado al elemento de imagen. */
  imgClassName?: string;
  /** La foto principal del hero carga eager para no perder el primer pintado. */
  priority?: boolean;
  /** Evita usar una variante optimizada almacenada en caché. */
  unoptimized?: boolean;
}

/**
 * Foto de servicio con respaldo y `object-fit: cover`.
 *
 * El contenedor es `relative` con altura definida y pinta el degradado azul
 * marino de marca como fondo; la imagen lo cubre con `fill`. Si la URL falla
 * (404, red caida o Cloudinary de baja) el `onError` oculta la imagen y queda el
 * degradado: nunca un hueco vacio. Se usa `next/image` para aprovechar la
 * optimizacion automatica y el lazy loading nativo.
 */
export function ServiceImage({
  src,
  alt,
  className,
  imgClassName,
  priority = false,
  unoptimized = false,
}: ServiceImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={cn("relative block overflow-hidden", className)}
      style={{ backgroundImage: SERVICE_IMAGE_FALLBACK }}
    >
      {!failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          unoptimized={unoptimized}
          onError={() => setFailed(true)}
          className={cn("object-cover", imgClassName)}
        />
      ) : null}
    </span>
  );
}
