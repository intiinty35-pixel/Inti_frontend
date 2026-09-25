import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "narrow" | "default" | "wide";
}

const SIZES = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-7xl",
} as const;

export function Container({ size = "default", className, ...props }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", SIZES[size], className)} {...props} />
  );
}