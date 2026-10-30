import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/** Gradiente de marca: respaldo cuando el proyecto todavía no tiene imágenes en public/. */
const FALLBACK = "linear-gradient(135deg, #0b3d91 0%, #082a6b 100%)";
const OVERLAY = "linear-gradient(0deg, rgb(11 61 145 / 0.72) 0%, rgb(11 61 145 / 0) 62%)";

export interface ListingImageProps {
  src?: string;
  className?: string;
  children?: ReactNode;
}

function buildBackground(src: string | undefined): string {
  return [OVERLAY, src ? `url(${src})` : null, FALLBACK].filter(Boolean).join(", ");
}

/**
 * Portada decorativa de una card. El texto de la card ya describe la propiedad,
 * por eso la imagen va marcada como tal y no necesita texto alternativo.
 */
export function ListingImage({ src, className, children }: ListingImageProps) {
  return (
    <div
      aria-hidden
      className={cn("relative bg-cover bg-center", className)}
      style={{ backgroundImage: buildBackground(src) }}
    >
      {children}
    </div>
  );
}
