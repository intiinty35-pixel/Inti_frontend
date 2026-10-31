"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { HOME_HERO_IMAGES, HOME_HERO_INTERVAL_MS } from "@/features/home/config";

export interface HomeHeroBackgroundProps {
  /** Clases extra del fondo (posicionamiento, velo, etc.). */
  className?: string;
  /**
   * Índice de la imagen activa. Cuando se proviene, el fondo se sincroniza con
   * el padre (se desactiva el intervalo interno y se usa este índice para
   * decidir qué foto mostrar con opacidad total).
   */
  activeIndex?: number;
}

/**
 * Fondo del hero del home: las 4 fotos de `public/home/` en carrusel.
 *
 * Se monta como capa absoluta que cubre toda la cabecera (`-z-10`) y va
 * cambiando con un fundido de opacidad. Es solo el fondo: el titular, el
 * buscador y el velo de contraste los pinta el hero que lo contiene.
 *
 * Detalles de comportamiento:
 * - Avanza solo cada `HOME_HERO_INTERVAL_MS`, en bucle infinito (a menos que
 *   se pase `activeIndex`, en cuyo caso el padre controla el índice).
 * - Respeta `prefers-reduced-motion`: quien pidio menos movimiento se queda en
 *   la primera foto, sin parpadeos.
 * - Las 4 fotos van apiladas con `fill` y `object-cover`, asi el fondo cubre el
 *   hero completo y no salta de tamano al cambiar de diapositiva.
 */
export function HomeHeroBackground({ className, activeIndex }: HomeHeroBackgroundProps) {
  const total = HOME_HERO_IMAGES.length;
  const [internalIndex, setInternalIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const index = activeIndex ?? internalIndex;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const go = useCallback(
    (delta: number) => {
      setInternalIndex((current) => (current + delta + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (activeIndex != null || reduceMotion) return;
    const timer = window.setInterval(() => go(1), HOME_HERO_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [activeIndex, reduceMotion, go]);

  return (
    <div aria-hidden className={cn("absolute inset-0 -z-10 overflow-hidden bg-[#14181f]", className)}>
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
            "object-cover object-center",
            position === index ? "hero-image-arrive opacity-100" : "translate-x-3 scale-[1.02] opacity-0",
          )}
        />
      ))}
    </div>
  );
}
