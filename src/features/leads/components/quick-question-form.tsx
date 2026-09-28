"use client";

import { useState } from "react";
import { LeadForm } from "@/features/leads/components/lead-form";

const QUESTIONS = [
  "¿Sigue disponible?",
  "¿Cuándo puedo visitarlo?",
  "¿El precio es negociable?",
  "¿Aceptan mascotas?",
  "¿Tiene ascensor?",
];

export function QuickQuestionForm({ propertyId }: { propertyId: string }) {
  const [message, setMessage] = useState(QUESTIONS[0]);

  return (
    <section className="mt-8 rounded-card border border-edge bg-surface p-5">
      <h2 className="text-xl font-bold text-ink">Preguntas para la inmobiliaria</h2>
      <p className="mt-1 text-sm text-muted">Selecciona una pregunta o escribe tu consulta.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {QUESTIONS.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => setMessage(question)}
            className={`rounded-full border px-3 py-2 text-xs font-semibold ${
              message === question ? "border-brand bg-brand-soft text-brand" : "border-edge text-brand"
            }`}
          >
            {question}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <LeadForm propertyId={propertyId} source="QUICK_QUESTION" defaultMessage={message} compact />
      </div>
    </section>
  );
}
