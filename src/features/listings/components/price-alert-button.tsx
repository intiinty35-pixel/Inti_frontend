"use client";

import { useState } from "react";
import { SparkleIcon } from "@/shared/ui/icons";
import { apiClient, ApiError } from "@/shared/lib/api/client";

export function PriceAlertButton({ propertyId }: { propertyId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "auth" | "error">("idle");

  async function createAlert() {
    setStatus("loading");
    try {
      await apiClient.post("/alerts/price", { propertyId });
      setStatus("sent");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setStatus("auth");
        return;
      }
      setStatus("error");
    }
  }

  return (
    <div className="grid gap-2 sm:justify-self-end">
      <button
        type="button"
        onClick={createAlert}
        disabled={status === "loading" || status === "sent"}
        className="flex h-11 items-center justify-center gap-2 rounded-card border border-edge px-5 text-sm font-bold text-brand transition-colors hover:border-brand disabled:pointer-events-none disabled:opacity-60"
      >
        <SparkleIcon className="size-4" />
        {status === "loading" ? "Guardando..." : status === "sent" ? "Aviso creado" : "Avísame si baja de precio"}
      </button>
      {status === "auth" ? (
        <p className="text-xs font-semibold text-muted">Inicia sesión para crear este aviso.</p>
      ) : null}
      {status === "error" ? (
        <p className="text-xs font-semibold text-error">No pudimos crear el aviso. Inténtalo nuevamente.</p>
      ) : null}
    </div>
  );
}
