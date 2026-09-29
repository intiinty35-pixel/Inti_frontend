"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { HOME_HERO_IMAGES, HOME_HERO_INTERVAL_MS } from "@/features/home/config";

export interface HomeHeroBackgroundProps {
  /** Clases extra del fondo (posicionamiento, velo, etc.). */
  className?: string;
}

/**
 * Fondo del hero del home: las 4 fotos de `public/home/` en carrusel.
 *
 * Se monta como capa absoluta que cubre toda la cabecera (`-z-10`) y va
 * cambiando con un fundido de opacidad. Es solo el fondo: el titular, el
 * buscador y el velo de contraste los pinta el hero que lo contiene.
 *
 * Detalles de comportamiento:
 * - Avanza solo cada `HOME_HERO_INTERVAL_MS`, en bucle infinito.
 * - Respeta `prefers-reduced-motion`: quien pidio menos movimiento se queda en
 *   la primera foto, sin parpadeos.
 * - Las 4 fotos van apiladas con `fill` y `object-cover`, asi el fondo cubre el
 *   hero completo y no salta de tamano al cambiar de diapositiva.
 */
export function HomeHeroBackground({ className }: HomeHeroBackgroundProps) {
  const total = HOME_HERO_IMAGES.length;
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const go = useCallback(
    (delta: number) => {
      setIndex((current) => (current + delta + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => go(1), HOME_HERO_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion, go]);

  return (
    <div aria-hidden className={cn("absolute inset-0 -z-10", className)}>
      {HOME_HERO_IMAGES.map((src, position) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vw"
          priority={position === 0}
          loading={position === 0 ? "eager" : "lazy"}
          className={cn(
            "object-cover transition-opacity duration-1000 ease-out",
            position === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}
