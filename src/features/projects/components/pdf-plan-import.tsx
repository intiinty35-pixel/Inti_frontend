"use client";

import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

export function PdfPlanImport({ file, onImport, onClose }: { file: File; onImport: (image: File, source: { file: File; page: number }) => Promise<boolean>; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [document, setDocument] = useState<PDFDocumentProxy>();
  const [page, setPage] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    dialog.current?.showModal();
    let alive = true;
    let task: ReturnType<typeof import('pdfjs-dist')['getDocument']> | undefined;
    void (async () => {
      try {
        const pdf = await import('pdfjs-dist');
        if (!alive) return;
        pdf.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
        task = pdf.getDocument({ data: new Uint8Array(await file.arrayBuffer()), cMapUrl: '/pdfjs/cmaps/', cMapPacked: true, standardFontDataUrl: '/pdfjs/standard_fonts/', wasmUrl: '/pdfjs/wasm/' });
        task.onPassword = () => { if (alive) setError('El PDF tiene contraseña. Sube una copia sin protección.'); void task?.destroy(); };
        const loaded = await task.promise;
        if (alive) setDocument(loaded);
      } catch (cause) { if (alive) setError(cause instanceof Error ? `No se pudo abrir el PDF: ${cause.message}` : 'No se pudo abrir el PDF'); }
    })();
    return () => { alive = false; void task?.destroy(); };
  }, [file]);
  useEffect(() => {
    if (!document) return;
    let alive = true; let render: RenderTask | undefined;
    void (async () => {
      setReady(false); setRendering(true); setError('');
      try {
        const sheet = await document.getPage(page);
        if (!alive || !canvas.current) return;
        const base = sheet.getViewport({ scale: 1, rotation: (sheet.rotate + rotation) % 360 });
        const scale = Math.min(300 / 72, 6000 / Math.max(base.width, base.height), Math.sqrt(20_000_000 / (base.width * base.height)));
        const viewport = sheet.getViewport({ scale, rotation: (sheet.rotate + rotation) % 360 });
        const target = canvas.current; target.width = Math.ceil(viewport.width); target.height = Math.ceil(viewport.height);
        const context = target.getContext('2d'); if (!context) throw new Error('El navegador no permite preparar el plano');
        render = sheet.render({ canvas: target, canvasContext: context, viewport, background: '#ffffff' });
        await render.promise;
        if (alive) setReady(true);
      } catch (cause) { if (alive) setError(cause instanceof Error ? cause.message : 'No se pudo preparar esta página'); }
      finally { if (alive) setRendering(false); }
    })();
    return () => { alive = false; render?.cancel(); };
  }, [document, page, rotation]);
  async function confirm() {
    if (!ready || !canvas.current) return;
    setBusy(true); setError('');
    try {
      const blob = await new Promise<Blob>((resolve, reject) => canvas.current!.toBlob(value => value ? resolve(value) : reject(new Error('No se pudo convertir la página')), 'image/webp', 0.97));
      if (blob.size > 10 * 1024 * 1024) throw new Error('Esta página es demasiado pesada. Prueba exportarla como PDF optimizado.');
      const image = new File([blob], `${file.name.replace(/\.pdf$/i, '')}-pagina-${page}.webp`, { type: blob.type });
      if (await onImport(image, { file, page })) onClose();
      else setError('No se pudo guardar el plano. Revisa el aviso del editor e intenta de nuevo.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo importar'); }
    finally { setBusy(false); }
  }
  return <dialog ref={dialog} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} className="fixed inset-0 z-[100] m-auto w-[min(960px,95vw)] max-h-[92dvh] overflow-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl backdrop:bg-slate-900/50" aria-labelledby="pdf-plan-title">
    <h2 id="pdf-plan-title" className="text-lg font-bold">Importar plano PDF</h2><p className="mt-1 text-sm text-slate-500">{file.name} · Elige la página que contiene el plano.</p>
    <div className="my-4 flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-sm">Página<select disabled={!document || busy || rendering} value={page} onChange={event => { setReady(false); setPage(Number(event.target.value)); }} className="w-auto rounded-lg border p-2">{Array.from({ length: document?.numPages ?? 1 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select>de {document?.numPages ?? '…'}</label><button type="button" disabled={busy || rendering || !document} onClick={() => { setReady(false); setRotation(value => (value + 90) % 360); }}>Girar 90°</button><button type="button" disabled={busy || !ready || rendering} onClick={confirm}>{busy ? 'Guardando plano y PDF…' : 'Usar esta página'}</button><button type="button" disabled={busy} onClick={onClose}>Cancelar</button></div>
    {error && <p role="alert" className="my-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {(!document || rendering) && !error && <p role="status" className="p-4 text-sm">Preparando página en alta resolución…</p>}
    <div className="rounded-xl bg-slate-100 p-3"><canvas ref={canvas} className="mx-auto h-auto max-h-[60dvh] max-w-full object-contain" aria-label={`Vista previa de la página ${page}`} /></div>
  </dialog>;
}
