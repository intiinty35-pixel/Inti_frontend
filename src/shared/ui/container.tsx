import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

<<<<<<< HEAD
export type ContainerSize = "narrow" | "default" | "wide" | "wide-tight";
=======
export type ContainerSize = "narrow" | "default" | "wide" | "wide-tight" | "full";
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
}

const GUTTER = "px-4 sm:px-6 lg:px-8";
const GUTTER_TIGHT = "px-3 sm:px-5 lg:px-6";
<<<<<<< HEAD
=======
const GUTTER_FULL = "px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14";
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a

const SIZES: Record<ContainerSize, string> = {
  narrow: `max-w-3xl ${GUTTER}`,
  default: `max-w-5xl ${GUTTER}`,
  wide: `max-w-7xl ${GUTTER}`,
  "wide-tight": `max-w-7xl ${GUTTER_TIGHT}`,
<<<<<<< HEAD
=======
  /** Sin tope: usa el ancho completo del viewport (detalle de propiedad). */
  full: `max-w-none ${GUTTER_FULL}`,
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
};

export function Container({ size = "default", className, ...props }: ContainerProps) {
  return <div className={cn("mx-auto w-full", SIZES[size], className)} {...props} />;
}
