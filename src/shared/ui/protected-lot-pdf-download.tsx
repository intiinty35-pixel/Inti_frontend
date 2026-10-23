"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { env } from "@/shared/lib/env";

export function ProtectedLotPdfDownload({
  slug,
  lotId,
  code,
  className,
}: {
  slug: string;
  lotId: string;
  code: string;
  className?: string;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `${env.apiUrl}/projects/${encodeURIComponent(slug)}/site-plan/lots/${encodeURIComponent(lotId)}/pdf`,
        { credentials: "include", headers: { "X-Site-Plan-Code": code } },
      );
      if (!response.ok) {
        let message = "No se pudo descargar la ficha del lote.";
        try {
          const body = (await response.json()) as { message?: unknown };
          if (typeof body.message === "string") message = body.message;
        } catch {}
        throw new Error(message);
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `ficha-lote-${lotId}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo descargar la ficha del lote.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button type="button" className={className} onClick={() => void download()} disabled={busy}>
        <FileDown size={17} /> {busy ? "Descargando…" : "Descargar ficha PDF"}
      </button>
      {error && <span role="alert" className="mt-2 block text-xs text-red-700">{error}</span>}
    </>
  );
}
