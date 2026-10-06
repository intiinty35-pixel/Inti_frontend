"use client";

import { useState } from "react";
import { Bell, PauseCircle, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui";
import { AdminRequestError, notifyProfessional } from "@/features/admin/api/client";

interface AdminTestActionsProps {
  label: string;
  notifyId?: string;
}

export function AdminTestActions({ label, notifyId }: AdminTestActionsProps) {
  const [state, setState] = useState<"active" | "paused" | "deleted" | "notified" | "error">("active");
  const [loading, setLoading] = useState(false);

  async function handleNotify() {
    if (!notifyId) {
      setState("notified");
      return;
    }

    setLoading(true);
    try {
      await notifyProfessional(notifyId);
      setState("notified");
    } catch (error) {
      setState("error");
      if (error instanceof AdminRequestError) {
        console.error(error.messages.join(" "));
      } else {
        console.error(error);
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
        onClick={() => void handleNotify()}
      >
        <Bell className="size-3.5" />
        {loading ? "Enviando..." : state === "notified" ? "Notificacion enviada" : state === "error" ? "Error correo" : "Notificar"}
      </Button>
      <Button size="xs" variant="danger" className="px-3 whitespace-nowrap" title={`Eliminar ${label}`} onClick={() => setState("deleted")}>
        <Trash2 className="size-3.5" />
        Eliminar
      </Button>
    </div>
  );
}
