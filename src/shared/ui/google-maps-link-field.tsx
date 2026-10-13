"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { MapIcon } from "@/shared/ui/icons";
import { resolveMapsLink, type MapsPoint } from "@/shared/lib/maps-link";

/**
 * Campo para pegar un enlace de Google Maps (o unas coordenadas) y fijar el
 * punto de la publicacion sin tener que hacer clic en el mapa.
 */
export function GoogleMapsLinkField({ onPoint }: { onPoint: (point: MapsPoint) => void }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: "ok" | "error" } | null>(null);

  async function apply() {
    if (!value.trim()) {
      setMessage({ text: "Pega primero el enlace de Google Maps.", tone: "error" });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const point = await resolveMapsLink(value);
      onPoint(point);
      setMessage({ text: "Ubicación fijada desde Google Maps. Puedes ajustar el marcador en el mapa.", tone: "ok" });
    } catch (cause) {
      setMessage({
        text: cause instanceof Error ? cause.message : "No pudimos leer ese enlace.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-card border border-edge bg-surface-muted p-3">
      <label className="block text-[13px] font-semibold text-brand" htmlFor="google-maps-link">
        Enlace de Google Maps
      </label>
      <p className="mt-0.5 text-xs text-muted">
        En Google Maps busca el lugar, pulsa «Compartir» y copia el enlace. Pégalo aquí.
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="google-maps-link"
          type="text"
          inputMode="url"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void apply();
            }
          }}
          placeholder="https://maps.app.goo.gl/..."
          className="h-10 min-w-0 flex-1 rounded-card border border-edge bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
        />
        <Button type="button" size="md" onClick={() => void apply()} disabled={busy}>
          <MapIcon className="size-4" />
          {busy ? "Leyendo..." : "Usar enlace"}
        </Button>
      </div>
      {message ? (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={`mt-2 text-xs font-semibold ${message.tone === "error" ? "text-error" : "text-success"}`}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
