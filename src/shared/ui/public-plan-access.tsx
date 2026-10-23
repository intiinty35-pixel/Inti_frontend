"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { KeyRound, MessageCircle, X } from "lucide-react";

export function PublicPlanAccess({
  onSubmit,
  onOmit,
  contactHref,
  open = true,
  invalid = false,
  busy = false,
}: {
  onSubmit: (code: string) => void | Promise<void>;
  onOmit: () => void;
  contactHref: string;
  open?: boolean;
  invalid?: boolean;
  busy?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState("");
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    else if (!open && element.open) element.close();
  }, [open]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSubmit(code.trim());
  }
  return (
    <dialog
      ref={dialog}
      aria-labelledby="public-plan-access-title"
      onCancel={event => {
        event.preventDefault();
        onOmit();
      }}
      className="m-auto w-[min(440px,calc(100vw-32px))] rounded-2xl border border-slate-200 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/60"
    >
      <form onSubmit={submit} className="grid gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <KeyRound size={19} aria-hidden="true" />
            <h2 id="public-plan-access-title">Código para ver el proyecto</h2>
          </div>
          <button type="button" onClick={onOmit} aria-label="Omitir código y cerrar" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
            <X size={19} />
          </button>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          Ingresa el código que te proporcionó un asesor para ver el proyecto y
          su plano. Si no tienes uno, puedes contactarlo o continuar viendo solo
          la ubicación.
        </p>
        <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
          Código del proyecto
          <input
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={code}
            onChange={event => setCode(event.target.value.toUpperCase().replace(/[^A-F0-9]/g, "").slice(0, 18))}
            className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm"
            maxLength={18}
            minLength={18}
            pattern="[A-F0-9]{18}"
            required
            autoFocus
            aria-describedby="public-plan-code-hint"
          />
        </label>
        <p id="public-plan-code-hint" className="text-xs text-slate-500">
          El código tiene 18 caracteres. {code.length}/18
        </p>
        {invalid && <p role="alert" className="text-xs text-red-700">El código no es válido. Verifica con tu asesor e inténtalo nuevamente.</p>}
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy ? "Verificando…" : "Ver proyecto y plano"}
        </button>
        <a
          href={contactHref}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-green-600 px-4 text-sm font-bold text-green-800 hover:bg-green-50"
        >
          <MessageCircle size={17} /> No tengo código, contactar a un asesor
        </a>
        <button type="button" onClick={onOmit} className="min-h-10 text-sm font-semibold text-slate-600 underline underline-offset-4">
          Omitir y ver solo la ubicación
        </button>
      </form>
    </dialog>
  );
}
