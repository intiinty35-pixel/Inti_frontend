"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { WhatsappIcon } from "@/shared/ui/icons";

const QUESTIONS = [
  "¿Sigue disponible?",
  "¿Cuándo puedo visitarlo?",
  "¿El precio es negociable?",
  "¿Aceptan mascotas?",
  "¿Tiene ascensor?",
];

export interface QuickQuestionsProps {
  propertyTitle: string;
  agentName: string;
  /** Solo digitos, con codigo de pais (ej. 51999999999). */
  whatsappDigits?: string;
}

function QuestionModal({
  question,
  propertyTitle,
  agentName,
  whatsappDigits,
  onClose,
}: QuickQuestionsProps & { question: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const href = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hola, vi "${propertyTitle}" en ARIZ. ${question}`)}`
    : undefined;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-question-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-surface p-7 text-center shadow-2xl"
      >
        <div className="mx-auto flex items-center justify-center gap-3">
          <span className="flex size-14 items-center justify-center rounded-full bg-brand font-display text-xl font-black text-accent">
            {agentName.charAt(0).toUpperCase()}
          </span>
          <span className="flex size-9 items-center justify-center rounded-full bg-[#25d366] text-white">
            <WhatsappIcon className="size-5" />
          </span>
        </div>

        <h3 id="quick-question-title" className="mt-4 text-lg font-bold text-ink">
          Mejor pregúntale por WhatsApp
        </h3>
        <p className="mt-1.5 text-sm text-muted">
          Escríbele directo a <strong className="text-ink">{agentName}</strong> y recibe una respuesta más rápida.
        </p>

        <p className="mt-4 rounded-xl border border-edge bg-surface-muted px-4 py-3 text-sm font-semibold text-ink">
          {question}
        </p>

        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25d366] text-base font-bold text-white transition-colors hover:bg-[#1fb857]"
          >
            Escribir por WhatsApp
            <WhatsappIcon className="size-5 shrink-0" />
          </a>
        ) : (
          <p className="mt-5 rounded-xl border border-edge p-3 text-xs text-muted">
            El anunciante aún no registró un número de WhatsApp. Usa el formulario de contacto.
          </p>
        )}

        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="mt-3 h-11 w-full rounded-xl text-sm font-bold text-ink transition-colors hover:bg-surface-muted"
        >
          Cancelar
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function QuickQuestions(props: QuickQuestionsProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section className="mt-9">
      <h2 className="font-display text-xl font-black tracking-tight text-brand lg:text-2xl">
        Preguntas para la inmobiliaria
      </h2>
      <p className="mt-1.5 text-sm text-muted">Selecciona una pregunta y contáctalos directo.</p>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {QUESTIONS.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => setSelected(question)}
            className="rounded-full border border-edge bg-surface px-4 py-2 text-[13px] font-bold text-brand transition-colors hover:border-brand hover:bg-brand-soft"
          >
            {question}
          </button>
        ))}
      </div>

      {selected ? <QuestionModal {...props} question={selected} onClose={() => setSelected(null)} /> : null}
    </section>
  );
}