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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Sin soporte de IntersectionObserver el contenido debe verse igual.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

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
  }, []);

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
