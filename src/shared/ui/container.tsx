import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export type ContainerSize = "narrow" | "default" | "wide" | "wide-tight" | "page" | "full";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
}

const GUTTER = "px-4 sm:px-6 lg:px-8 xl:px-10";
const GUTTER_TIGHT = "px-4 sm:px-6 lg:px-6 xl:px-8";
const GUTTER_FULL = "px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14";

/**
 * `wide-tight` llega a 1440px y `page` a 1680px: en monitores grandes el home y
 * el listado dejan de verse angostos sin estirar los parrafos a lo ancho.
 */
const SIZES: Record<ContainerSize, string> = {
  narrow: `max-w-3xl ${GUTTER}`,
  default: `max-w-5xl ${GUTTER}`,
  wide: `max-w-[90rem] ${GUTTER}`,
  "wide-tight": `max-w-[90rem] ${GUTTER_TIGHT}`,
  page: `max-w-[105rem] ${GUTTER}`,
  /** Sin tope: usa el ancho completo del viewport (detalle de propiedad). */
  full: `max-w-none ${GUTTER_FULL}`,
};

export function Container({ size = "default", className, ...props }: ContainerProps) {
  return <div className={cn("mx-auto w-full", SIZES[size], className)} {...props} />;
}
