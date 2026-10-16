"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

interface SharePropertyButtonProps {
  title: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export function SharePropertyButton({ title, latitude, longitude, address }: SharePropertyButtonProps) {
  const [message, setMessage] = useState("");

  function buildMapsUrl(): string | null {
    if (latitude != null && longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return `https://www.google.com/maps?q=${latitude},${longitude}`;
    }
    return null;
  }

  function buildShareText(): string {
    const parts = [`Mira esta propiedad: ${title}`];
    const mapsUrl = buildMapsUrl();
    if (mapsUrl) {
      parts.push(`Ubicación: ${mapsUrl}`);
    } else if (address) {
      parts.push(`Ubicación: ${address}`);
    }
    return parts.join("\n");
  }

  async function share() {
    const url = window.location.href;
    const text = buildShareText();

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setMessage("No se pudo compartir la propiedad.");
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setMessage("Enlace copiado.");
    } catch {
      setMessage("No se pudo copiar el enlace.");
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        onClick={share}
        className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-card border border-brand px-2.5 text-[11px] font-bold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:min-h-10 sm:px-4 sm:text-xs"
      >
        <Share2 className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Compartir propiedad</span>
        <span className="sm:hidden">Compartir</span>
      </button>
      <span aria-live="polite" className="text-right text-xs text-muted">
        {message}
      </span>
    </div>
  );
}
