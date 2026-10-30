"use client";

import { useCallback, useState, type KeyboardEvent, type ReactNode } from "react";
import { CameraIcon, ChevronDownIcon } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";

interface PropertyPhotoGalleryProps {
  images: string[];
  title: string;
  /** Alto del hero: el detalle publico usa pantallas anchas y necesita mas aire. */
  className?: string;
  /** Contenido superpuesto (precio, badges, migas de pan). */
  children?: ReactNode;
}

const FALLBACK = "linear-gradient(135deg, #0b3d91 0%, #082a6b 100%)";

function background(image?: string) {
  return [image ? `url(${image})` : null, FALLBACK].filter(Boolean).join(", ");
}

/**
 * Galeria del detalle. Vive en cliente porque las miniaturas y las flechas
 * cambian la foto activa: sin estado local, hacer clic no haria nada.
 */
export function PropertyPhotoGallery({
  images,
  title,
  className = "h-[360px] sm:h-[520px]",
  children,
}: PropertyPhotoGalleryProps) {
  const total = images.length;
  const [active, setActive] = useState(0);

  const go = useCallback(
    (next: number) => {
      if (total === 0) return;
      setActive((next + total) % total);
    },
    [total],
  );

  /* Flechas del teclado: solo cuando el foco esta dentro de la galeria. */
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(active + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(active - 1);
      }
    },
    [active, go],
  );

  const cover = total > 0 ? images[active] : undefined;

  return (
    <section
      aria-label={`Fotos de ${title}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "group relative box-border w-full max-w-full overflow-hidden rounded-card border border-edge bg-brand outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
    >
      {/* Imagen activa. La `key` remonta el nodo y da el fundido al cambiar. */}
      <div
        key={active}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: background(cover) }}
      />

      {children}

      <button
        type="button"
        className="absolute top-3.5 right-3.5 flex h-8 items-center gap-1.5 rounded-card bg-surface/95 px-2.5 text-[11px] font-bold text-brand shadow-[var(--shadow-card)] backdrop-blur transition-colors hover:bg-surface sm:top-4 sm:right-4 sm:h-9 sm:gap-2 sm:px-3.5 sm:text-xs"
        aria-label="Ver todas las fotos"
      >
        <CameraIcon className="size-3.5 sm:size-4" />
        <span className="hidden sm:inline">Ver todas las fotos</span>
        <span className="font-black text-muted">
          {active + 1}/{total || 1}
        </span>
      </button>

      {/* Flechas: en pantallas tactiles sobran, el gesto natural son las
          miniaturas; en escritorio dan el control que antes no existia. */}
      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Foto anterior"
            className="absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/95 text-brand shadow-[var(--shadow-card)] backdrop-blur transition-colors hover:bg-surface sm:flex"
          >
            <ChevronDownIcon className="size-5 rotate-90" />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Foto siguiente"
            className="absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/95 text-brand shadow-[var(--shadow-card)] backdrop-blur transition-colors hover:bg-surface sm:flex"
          >
            <ChevronDownIcon className="size-5 -rotate-90" />
          </button>
        </>
      ) : null}

      {/* Tira de miniaturas: borde inferior de la foto, alineada a la izquierda.
          La activa se marca con anillo dorado para saber cual se esta viendo. */}
      {total > 1 ? (
        <div className="absolute inset-x-3.5 bottom-3.5 flex gap-2 overflow-x-auto pb-1 sm:inset-x-4 sm:right-auto sm:bottom-4">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver foto ${index + 1} de ${total}`}
              aria-current={index === active}
              className={cn(
                "h-14 w-20 shrink-0 overflow-hidden rounded-card border bg-cover bg-center shadow-[var(--shadow-card)] transition-transform hover:scale-[1.04] sm:h-16 sm:w-24",
                index === active
                  ? "border-accent ring-2 ring-accent"
                  : "border-white/60 opacity-80 hover:opacity-100",
              )}
              style={{ backgroundImage: background(image) }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

