"use client";

import { FormEvent, useState } from "react";
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

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/35 p-4 sm:p-6">
          <form
            onSubmit={handleNotify}
            className="my-auto w-full max-w-[min(94vw,680px)] overflow-hidden rounded-card border border-edge bg-surface text-left shadow-[var(--shadow-pop)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-edge p-4 sm:p-5">
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

            <div className="space-y-4 p-4 sm:p-5">
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-muted">
                <span>Asunto / razon</span>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  minLength={3}
                  maxLength={120}
                  required
                  className="h-11 w-full rounded-card border border-edge bg-canvas px-3 text-sm font-semibold normal-case tracking-normal text-ink outline-none focus:border-brand"
                />
              </label>

              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-muted">
                <span>Mensaje</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  minLength={10}
                  maxLength={2000}
                  required
                  rows={5}
                  className="h-40 w-full resize-none rounded-card border border-edge bg-canvas px-3 py-3 text-sm font-semibold leading-6 normal-case tracking-normal text-ink outline-none focus:border-brand sm:h-44"
                />
              </label>

              {error ? <p className="mt-3 text-sm font-bold text-error">{error}</p> : null}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)} className="w-full">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Enviando..." : "Enviar correo"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
