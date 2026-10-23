"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Pencil, X } from "lucide-react";
import s from "./site-plan.module.css";

export function DiscardDrawingDialog({ onDecision }: { onDecision: (discard: boolean) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    cancel.current?.focus();
    return () => element?.close();
  }, []);

  return createPortal(
    <dialog ref={dialog} className={s.discardDialog} aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`} onCancel={event => { event.preventDefault(); onDecision(false); }}
      onClick={event => { if (event.target === event.currentTarget) {
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onDecision(false);
      } }}>
      <button type="button" className={s.discardClose} aria-label="Seguir editando" onClick={() => onDecision(false)}><X size={18} /></button>
      <div className={s.discardIcon}><Pencil size={23} aria-hidden="true" /></div>
      <h2 id={`${id}-title`}>Tienes un dibujo en edición</h2>
      <p id={`${id}-description`}>Si continúas, se descartarán los cambios de la forma que tienes abierta. Puedes seguir editando para guardarlos.</p>
      <div className={s.discardHint}>Los elementos ya guardados en el borrador se conservan.</div>
      <div className={s.discardActions}>
        <button ref={cancel} type="button" onClick={() => onDecision(false)}>Seguir editando</button>
        <button type="button" className={s.discardConfirm} onClick={() => onDecision(true)}>Descartar cambios</button>
      </div>
    </dialog>, document.body,
  );
}
