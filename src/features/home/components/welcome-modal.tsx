"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/config/routes";
import { ReferralModal } from "@/features/referrals/components/referral-modal";

const PROPERTY_MODAL_KEY = "ariz-welcome-modal-dismissed";
const CLUB_MODAL_KEY = "ariz-club-welcome-modal-dismissed";
const WELCOME_MODAL_EVENT = "ariz-welcome-modal-change";

function subscribeToModalDismissal(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(WELCOME_MODAL_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(WELCOME_MODAL_EVENT, onStoreChange);
  };
}

function getModalSnapshot() {
  return [
    localStorage.getItem(PROPERTY_MODAL_KEY) ? "1" : "0",
    localStorage.getItem(CLUB_MODAL_KEY) ? "1" : "0",
  ].join(":");
}

function getServerModalSnapshot() {
  return "1:1";
}

export function WelcomeModal() {
  const [hidePropertyModal, setHidePropertyModal] = useState(false);
  const [hideClubModal, setHideClubModal] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const snapshot = useSyncExternalStore(
    subscribeToModalDismissal,
    getModalSnapshot,
    getServerModalSnapshot,
  );

  const [propertyDismissed, clubDismissed] = snapshot.split(":").map((value) => value === "1");
  const showPropertyModal = !propertyDismissed && !hidePropertyModal;
  const showClubModal = !showPropertyModal && !clubDismissed && !hideClubModal;

  function notifyDismissalChange() {
    window.dispatchEvent(new Event(WELCOME_MODAL_EVENT));
  }

  function closePropertyModal() {
    localStorage.setItem(PROPERTY_MODAL_KEY, "true");
    setHidePropertyModal(true);
    notifyDismissalChange();
  }

  function closeClubModal() {
    localStorage.setItem(CLUB_MODAL_KEY, "true");
    setHideClubModal(true);
    notifyDismissalChange();
  }

  function joinClub() {
    localStorage.setItem(CLUB_MODAL_KEY, "true");
    setHideClubModal(true);
    setReferralOpen(true);
    notifyDismissalChange();
  }

  if (!showPropertyModal && !showClubModal && !referralOpen) return null;

  return (
    <>
      {showPropertyModal ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Publica tu propiedad gratis"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={closePropertyModal}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative flex w-full max-w-3xl flex-col max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-card border border-edge bg-surface shadow-[var(--shadow-pop)] md:flex-row">
            <button
              type="button"
              onClick={closePropertyModal}
              className="absolute top-4 right-4 z-10 text-muted transition-colors hover:text-ink"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="flex flex-1 flex-col justify-center p-8 sm:p-10">
              <h2 className="text-2xl leading-tight font-bold text-ink sm:text-3xl">
                Tu propiedad merece llegar más lejos.
              </h2>
              <p className="mt-3 text-xl font-bold text-accent sm:text-2xl">
                Publícala gratis con Inti.
              </p>
              <p className="mt-4 text-base text-muted sm:text-lg">
                Conectamos tu propiedad con nuevas oportunidades y potenciales compradores.
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <Link href={ROUTES.panel.owner.newListing} onClick={closePropertyModal}>
                  <Button variant="primary" size="lg" className="w-full">
                    Quiero publicar mi propiedad →
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={closePropertyModal}
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
      ) : null}

      {showClubModal ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Únete al Inti Club"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-4"
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={closeClubModal}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative flex w-full max-w-4xl flex-col max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-card border border-brand/20 bg-surface shadow-[var(--shadow-pop)] md:flex-row">
            <button
              type="button"
              onClick={closeClubModal}
              className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/85 text-brand shadow-[var(--shadow-card)] transition-colors hover:bg-accent hover:text-brand"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="flex flex-1 flex-col justify-center bg-brand p-7 text-white sm:p-10">
              <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
                Inti Club
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight font-black sm:text-4xl">
                Únete al club de ariz proyectos. Refiere, gana, acumula y disfruta.
              </h2>
              <p className="mt-4 text-sm leading-6 font-semibold text-white/85 sm:text-base">
                Únete, comparte oportunidades inmobiliarias y acumula puntos por tus referidos.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={joinClub}
                  className="h-12 rounded-card border border-accent bg-accent px-5 text-sm font-black text-brand shadow-[0_12px_28px_rgb(0_0_0_/_0.22)] transition-colors hover:bg-[#d99a00]"
                >
                  Únete al Inti Club
                </button>
                <button
                  type="button"
                  onClick={closeClubModal}
                  className="h-12 rounded-card border border-white/35 bg-white/10 px-5 text-sm font-black text-white transition-colors hover:bg-white/20"
                >
                  Después
                </button>
              </div>
            </div>

            <div className="relative h-72 w-full shrink-0 md:h-auto md:w-[42%]">
              <Image
                src="/web_v/modal.png"
                alt="Persona revisando recompensas y oportunidades"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 42vw"
                priority
              />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      ) : null}

      <ReferralModal open={referralOpen} onClose={() => setReferralOpen(false)} />
    </>
  );
}
