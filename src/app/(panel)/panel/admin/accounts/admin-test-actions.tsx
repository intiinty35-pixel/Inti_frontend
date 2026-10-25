"use client";

import { FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Bell, PauseCircle, Trash2, X } from "lucide-react";
import { Button, ConfirmDialog } from "@/shared/ui";
import {
  AdminRequestError,
  deleteProfessionalAccount,
  deleteProject,
  deleteProperty,
  notifyProfessional,
} from "@/features/admin/api/client";

export type DeleteTargetKind = "account" | "property" | "project";

export interface DeleteTarget {
  kind: DeleteTargetKind;
  id: string;
}

interface AdminTestActionsProps {
  label: string;
  notifyId?: string;
  deleteTarget?: DeleteTarget;
}

const DELETE_CONFIRM_COPY: Record<DeleteTargetKind, { title: (label: string) => string; description: string }> = {
  account: {
    title: (label) => `¿Eliminar la cuenta de ${label}?`,
    description:
      "Se desactiva el acceso a la cuenta y se eliminan (de forma lógica) todas sus propiedades y proyectos publicados. No se borra ningún dato de la base.",
  },
  property: {
    title: (label) => `¿Eliminar la propiedad "${label}"?`,
    description: "Deja de aparecer en el portal y en el panel del dueño. No se borra de la base.",
  },
  project: {
    title: (label) => `¿Eliminar el proyecto "${label}"?`,
    description: "Deja de aparecer en el portal y en el panel del dueño. No se borra de la base.",
  },
};

async function callDelete(target: DeleteTarget): Promise<void> {
  if (target.kind === "account") return deleteProfessionalAccount(target.id);
  if (target.kind === "property") return deleteProperty(target.id);
  return deleteProject(target.id);
}

export function AdminTestActions({ label, notifyId, deleteTarget }: AdminTestActionsProps) {
  const router = useRouter();
  const [state, setState] = useState<"active" | "paused" | "deleted" | "notified" | "error">("active");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
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

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleteError("");
    setDeleting(true);
    try {
      await callDelete(deleteTarget);
      setState("deleted");
      setConfirmDeleteOpen(false);
      router.refresh();
    } catch (cause) {
      setDeleteError(cause instanceof AdminRequestError ? cause.messages.join(" ") : "No se pudo eliminar.");
    } finally {
      setDeleting(false);
    }
  }

  if (state === "deleted") {
    return <span className="text-xs font-black text-error">Eliminado</span>;
  }

  const deleteCopy = deleteTarget ? DELETE_CONFIRM_COPY[deleteTarget.kind] : null;

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
      <Button
        size="xs"
        variant="danger"
        className="px-3 whitespace-nowrap"
        title={`Eliminar ${label}`}
        disabled={!deleteTarget}
        onClick={() => setConfirmDeleteOpen(true)}
      >
        <Trash2 className="size-3.5" />
        Eliminar
      </Button>

      {deleteCopy ? (
        <ConfirmDialog
          open={confirmDeleteOpen}
          title={deleteCopy.title(label)}
          description={deleteError || deleteCopy.description}
          confirmLabel={deleting ? "Eliminando..." : "Eliminar"}
          variant="danger"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteOpen(false)}
        />
      ) : null}

      {open && typeof document !== "undefined"
        ? createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink p-3 sm:p-6">
          <form
            onSubmit={handleNotify}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notify-dialog-title"
            aria-describedby="notify-dialog-description"
            className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-edge bg-surface text-left shadow-[var(--shadow-pop)] sm:max-h-[calc(100dvh-3rem)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-edge bg-canvas p-4 sm:p-6">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-brand">
                  <Bell className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                    Notificación por correo
                  </p>
                  <h2 id="notify-dialog-title" className="mt-1 break-words text-lg font-bold leading-snug text-brand sm:text-xl">
                    Notificar usuario
                  </h2>
                  <p id="notify-dialog-description" className="mt-1 break-words text-sm text-muted">
                    {label}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-edge bg-surface text-muted transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="min-h-0 space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-6">
              <label className="grid gap-2 text-sm font-semibold text-ink">
                <span>Asunto / razón</span>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  minLength={3}
                  maxLength={120}
                  required
                  className="h-12 w-full rounded-xl border border-edge bg-surface px-3 text-base font-normal text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-ink">
                <span>Mensaje</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  minLength={10}
                  maxLength={2000}
                  required
                  rows={5}
                  className="min-h-36 w-full resize-y rounded-xl border border-edge bg-surface px-3 py-3 text-base font-normal leading-6 text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 sm:min-h-40"
                />
              </label>

              {error ? <p role="alert" className="rounded-xl border border-error/20 bg-error/5 px-3 py-2 text-sm font-semibold text-error">{error}</p> : null}

              <div className="flex flex-col-reverse gap-2 border-t border-edge pt-4 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)} className="h-11 w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="h-11 w-full sm:min-w-36 sm:w-auto">
                  {loading ? "Enviando..." : "Enviar correo"}
                </Button>
              </div>
            </div>
          </form>
        </div>,
        document.body,
      )
        : null}
    </div>
  );
}
