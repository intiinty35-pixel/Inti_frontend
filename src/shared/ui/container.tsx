import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export type ContainerSize = "narrow" | "default" | "wide" | "wide-tight" | "full";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
}

const GUTTER = "px-4 sm:px-6 lg:px-8";
const GUTTER_TIGHT = "px-3 sm:px-5 lg:px-6";
const GUTTER_FULL = "px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14";

const SIZES: Record<ContainerSize, string> = {
  narrow: `max-w-3xl ${GUTTER}`,
  default: `max-w-5xl ${GUTTER}`,
  wide: `max-w-7xl ${GUTTER}`,
  "wide-tight": `max-w-7xl ${GUTTER_TIGHT}`,
  /** Sin tope: usa el ancho completo del viewport (detalle de propiedad). */
  full: `max-w-none ${GUTTER_FULL}`,
};

export function Container({ size = "default", className, ...props }: ContainerProps) {
  return <div className={cn("mx-auto w-full", SIZES[size], className)} {...props} />;
}
