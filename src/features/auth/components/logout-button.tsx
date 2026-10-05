"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { AlertIcon, XIcon } from "@/shared/ui/icons";
import { ROUTES } from "@/shared/config/routes";
import { logout } from "@/features/auth/api/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const portalTarget = typeof document === "undefined" ? null : document.body;

  async function handleLogout() {
    setLoading(true);

    try {
      await logout();
    } finally {
      router.push(ROUTES.login);
      router.refresh();
    }
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex h-8 w-full items-center justify-start gap-2 rounded-sm px-3 text-sm font-medium text-error transition-colors hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
      >
        <LogOut
          size={18}
          strokeWidth={2.5}
          className="!h-[18px] !w-[18px] shrink-0 text-error"
          aria-hidden="true"
        />
        <span>Cerrar sesión</span>
      </button>
      {confirmOpen && portalTarget
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-brand/45 p-4 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (!loading && event.target === event.currentTarget) setConfirmOpen(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape" && !loading) setConfirmOpen(false);
              }}
            >
              <section
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="logout-dialog-title"
                aria-describedby="logout-dialog-description"
                className="w-full max-w-sm overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-pop)]"
              >
                <div className="h-1.5 bg-error" aria-hidden />
                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-error/10 text-error">
                      <AlertIcon className="size-6" />
                    </span>
                    <button
                      type="button"
                      aria-label="Cancelar cierre de sesión"
                      onClick={() => setConfirmOpen(false)}
                      disabled={loading}
                      className="flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-ink disabled:opacity-50"
                    >
                      <XIcon className="size-4" />
                    </button>
                  </div>

                  <p className="mt-5 text-[10px] font-black tracking-[0.18em] text-error uppercase">
                    Confirmación de cuenta
                  </p>
                  <h2
                    id="logout-dialog-title"
                    className="mt-1 font-display text-2xl font-black tracking-tight text-brand"
                  >
                    ¿Quieres cerrar sesión?
                  </h2>
                  <p id="logout-dialog-description" className="mt-2 text-sm leading-relaxed text-muted">
                    Tu cuenta quedará desconectada en este dispositivo. Puedes volver a iniciar sesión
                    cuando quieras.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      autoFocus
                      onClick={() => setConfirmOpen(false)}
                      disabled={loading}
                      className="h-10 rounded-md border border-edge px-4 text-sm font-semibold text-brand transition-colors hover:bg-surface-muted disabled:opacity-50"
                    >
                      Seguir aquí
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      disabled={loading}
                      className="h-10 rounded-md bg-error px-4 text-sm font-bold text-white transition-colors hover:opacity-90 disabled:cursor-wait disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? "Cerrando…" : "Sí, cerrar sesión"}
                    </button>
                  </div>
                </div>
              </section>
            </div>,
            portalTarget,
          )
        : null}
    </>
  );
}
