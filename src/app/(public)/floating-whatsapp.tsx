"use client";

import { WhatsappIcon } from "@/shared/ui";
import { buildServiceWhatsappUrl } from "@/features/services";

export function FloatingWhatsapp() {
  return (
    <a
      href={buildServiceWhatsappUrl("información general")}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp"
      title="Escríbenos por WhatsApp"
      className="fixed right-5 bottom-10 z-50 flex size-12 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[var(--shadow-pop)] transition-transform hover:scale-105 hover:bg-[#1fb857]"
    >
      <span
        aria-hidden="true"
        className="absolute -top-8 right-2 text-3xl drop-shadow-sm motion-safe:animate-bounce"
      >
        👇
      </span>
      <WhatsappIcon className="size-6" />
    </a>
  );
}
