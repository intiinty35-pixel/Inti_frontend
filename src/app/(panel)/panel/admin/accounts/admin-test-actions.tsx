"use client";

import { FormEvent, useState } from "react";
import { Bell, PauseCircle, Trash2, X } from "lucide-react";
import { Button } from "@/shared/ui";
import { AdminRequestError, notifyProfessional } from "@/features/admin/api/client";

interface AdminTestActionsProps {
  label: string;
  notifyId?: string;
}

export function AdminTestActions({ label, notifyId }: AdminTestActionsProps) {
  const [state, setState] = useState<"active" | "paused" | "deleted" | "notified" | "error">("active");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("Notificacion administrativa de ARIZ");
  const [message, setMessage] = useState(
    "Estamos revisando tu cuenta y tus publicaciones para mantener la calidad de la plataforma. Por favor ingresa a tu panel de ARIZ y corrige la informacion indicada.",
  );
  const [error, setError] = useState("");

  async function handleNotify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!notifyId) {
      setError("Esta fila no tiene un destinatario conectado al correo.");
      return;
    }

    setLoading(true);
    try {
      await notifyProfessional(notifyId, {
        subject: subject.trim(),
        message: message.trim(),
      });
      setState("notified");
      setOpen(false);
    } catch (cause) {
      setState("error");
      if (cause instanceof AdminRequestError) {
        setError(cause.messages.join(" "));
      } else {
        setError("No se pudo enviar la notificacion.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (state === "deleted") {
    return <span className="text-xs font-black text-error">Eliminado en prueba</span>;
  }

  return (
    <div className="flex min-w-max items-center gap-3 whitespace-nowrap">
      <Button
        size="xs"
        variant={state === "paused" ? "primary" : "secondary"}
        className="px-3 whitespace-nowrap"
        title={`Pausar ${label}`}
        onClick={() => setState(state === "paused" ? "active" : "paused")}
      >
        <PauseCircle className="size-3.5" />
        {state === "paused" ? "Pausado" : "Pausar"}
      </Button>
      <Button
        size="xs"
        variant={state === "notified" ? "primary" : "secondary"}
        className="px-3 whitespace-nowrap"
        title={`Notificar ${label}`}
        disabled={loading}
        onClick={() => setOpen(true)}
      >
        <Bell className="size-3.5" />
        {loading
          ? "Enviando..."
          : state === "notified"
            ? "Notificacion enviada"
            : state === "error"
              ? "Error correo"
              : "Notificar"}
      </Button>
      <Button size="xs" variant="danger" className="px-3 whitespace-nowrap" title={`Eliminar ${label}`} onClick={() => setState("deleted")}>
        <Trash2 className="size-3.5" />
        Eliminar
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/35 p-3 sm:p-4">
          <form
            onSubmit={handleNotify}
            className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-card border border-edge bg-surface text-left shadow-[var(--shadow-pop)] sm:max-h-[calc(100dvh-2rem)]"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-edge p-4 sm:p-5">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
                  Notificar usuario
                </p>
                <h2 className="mt-1 truncate text-lg font-black text-brand sm:text-xl">{label}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 shrink-0 items-center justify-center rounded-card border border-edge text-muted transition-colors hover:text-ink"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <label className="block text-xs font-black uppercase tracking-[0.12em] text-muted">
                Asunto
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  minLength={3}
                  maxLength={120}
                  required
                  className="mt-2 h-10 w-full rounded-card border border-edge bg-canvas px-3 text-sm font-semibold text-ink outline-none focus:border-brand"
                />
              </label>

              <label className="mt-4 block text-xs font-black uppercase tracking-[0.12em] text-muted">
                Mensaje
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  minLength={10}
                  maxLength={2000}
                  required
                  rows={6}
                  className="mt-2 max-h-[42dvh] min-h-36 w-full resize-y rounded-card border border-edge bg-canvas px-3 py-2 text-sm font-semibold leading-6 text-ink outline-none focus:border-brand"
                />
              </label>

              {error ? <p className="mt-3 text-sm font-bold text-error">{error}</p> : null}
            </div>

            <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-edge p-4 sm:p-5">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar correo"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
