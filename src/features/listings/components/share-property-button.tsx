"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

export function SharePropertyButton({ title }: { title: string }) {
  const [message, setMessage] = useState("");

  async function share() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Mira esta propiedad: ${title}`, url });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setMessage("No se pudo compartir la propiedad.");
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
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
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-card border border-brand px-3 text-xs font-bold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:px-4 sm:text-sm"
      >
        <Share2 className="size-4 shrink-0" aria-hidden="true" />
        Compartir propiedad
      </button>
      <span aria-live="polite" className="text-right text-xs text-muted">
        {message}
      </span>
    </div>
  );
}
