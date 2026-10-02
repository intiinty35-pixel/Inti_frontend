"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface RevealOnScrollProps {
  children: ReactNode;
  /** Retardo en ms para escalonar la aparicion de elementos hermanos. */
  delay?: number;
  className?: string;
}

/**
 * Fade-in suave al entrar en el viewport. Se implementa con el
 * `IntersectionObserver` nativo en lugar de una libreria de animacion para no
 * sumar dependencias al bundle publico.
 *
 * Si el usuario pidio menos movimiento (`prefers-reduced-motion`), el contenido
 * se muestra de inmediato y sin transicion.
 */
export function RevealOnScroll({ children, delay = 0, className }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    if (typeof IntersectionObserver === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (visible) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            // Un elemento que ya aparecio no necesita volver a observarse.
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn("ariz-reveal", visible && "ariz-reveal-visible", className)}
    >
      {children}
    </div>
  );
}
