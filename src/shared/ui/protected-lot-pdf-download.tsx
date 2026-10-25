"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, FileDown, X } from "lucide-react";
import { env } from "@/shared/lib/env";
import s from "./pdf-sheet-preview.module.css";

export function ProtectedLotPdfDownload({
  slug,
  lotId,
  code,
  className,
  unitType = "lot",
}: {
  slug: string;
  lotId: string;
  code: string;
  className?: string;
  unitType?: "lot" | "apartment";
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string>();
  const dialog = useRef<HTMLDialogElement>(null);
  const filename = `ficha-${unitType === "apartment" ? "departamento" : "lote"}-${lotId}.pdf`;
  useEffect(() => {
    if (!preview) return;
    const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); window.setTimeout(() => URL.revokeObjectURL(preview), 60_000); };
  }, [preview]);
  async function download() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `${env.apiUrl}/projects/${encodeURIComponent(slug)}/site-plan/${unitType === "apartment" ? "apartments" : "lots"}/${encodeURIComponent(lotId)}/pdf`,
        { credentials: "include", headers: { "X-Site-Plan-Code": code } },
      );
      if (!response.ok) {
        let message = "No se pudo descargar la ficha.";
        try {
          const body = (await response.json()) as { message?: unknown };
          if (typeof body.message === "string") message = body.message;
        } catch {}
        throw new Error(message);
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (new TextDecoder().decode(bytes.subarray(0, 5)) !== "%PDF-") {
        throw new Error("La ficha recibida no es un PDF válido. Vuelve a intentarlo.");
      }
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      if (unitType === "apartment") { setPreview(url); return; }
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo descargar la ficha.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button type="button" className={className} onClick={() => void download()} disabled={busy}>
        {unitType === "apartment" ? <Eye size={17}/> : <FileDown size={17}/>} {busy ? "Preparando ficha…" : unitType === "apartment" ? "Ver ficha y descargar PDF" : "Descargar ficha PDF"}
      </button>
      {error && <span role="alert" className="mt-2 block text-xs text-red-700">{error}</span>}
      {preview && createPortal(<dialog ref={dialog} className={s.dialog} aria-label="Vista previa de la ficha PDF" onCancel={()=>setPreview(undefined)} onClose={()=>setPreview(undefined)}>
        <header className={s.header}><div><span>ARIZ · Ficha del inmueble</span><h2>Tu ficha está lista</h2></div><button type="button" aria-label="Cerrar vista previa" onClick={()=>setPreview(undefined)}><X size={20}/></button></header>
        <iframe className={s.document} src={`${preview}#toolbar=0`} title="Vista previa del PDF del departamento"/>
        <footer className={s.footer}><p>Revisa la ficha y guarda una copia en tu dispositivo.</p><a href={preview} target="_blank" rel="noreferrer">Abrir PDF</a><a className={s.download} href={preview} download={filename}><FileDown size={17}/>Descargar PDF</a></footer>
      </dialog>,document.body)}
    </>
  );
}
