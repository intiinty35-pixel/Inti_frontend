"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/config/routes";

const WELCOME_MODAL_KEY = "ariz-welcome-modal-dismissed";

function shouldShowModal() {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(WELCOME_MODAL_KEY);
}

export function WelcomeModal() {
  const [open, setOpen] = useState(shouldShowModal);

  function handleClose() {
    localStorage.setItem(WELCOME_MODAL_KEY, "true");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Publica tu propiedad gratis"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={handleClose}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-pop)] md:flex-row">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-muted transition-colors hover:text-ink"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="flex flex-1 flex-col justify-center p-8 sm:p-10">
          <h2 className="text-2xl font-bold leading-tight text-ink sm:text-3xl">
            Tu propiedad merece llegar más lejos.
          </h2>
          <p className="mt-3 text-xl font-bold text-accent sm:text-2xl">
            Publícala gratis con Ariz.
          </p>
          <p className="mt-4 text-base text-muted sm:text-lg">
            Conectamos tu propiedad con nuevas oportunidades y potenciales compradores.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link href={ROUTES.panel.owner.newListing}>
              <Button variant="primary" size="lg" className="w-full">
                Quiero publicar mi propiedad →
              </Button>
            </Link>
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-card border border-edge bg-transparent px-6 py-3 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-ink"
            >
              Ahora no, gracias.
            </button>
          </div>
        </div>

        <div className="relative h-64 w-full shrink-0 md:h-auto md:w-1/2">
          <Image
            src="https://media.istockphoto.com/id/2245391090/es/foto/familia-jugando-con-caja-de-mudanza-en-casa-nueva.webp?a=1&b=1&s=612x612&w=0&k=20&c=0_177hCGXeWN4-DkBhr25PtKDopvuxbm4-Dmvw6JW5w="
            alt="Familia feliz en su nuevo hogar"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}
