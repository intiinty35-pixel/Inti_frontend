"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteCampaign } from "@/features/admin/api/campaigns-client";

export function DeleteCampaignButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (pending || !window.confirm(`¿Eliminar la campaña “${name}”? Se eliminarán también sus reglas y los puntos acumulados de esta campaña. Esta acción no se puede deshacer.`)) return;
    setPending(true);
    setError(null);
    try {
      await deleteCampaign(id);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar la campaña. Intenta nuevamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => void handleDelete()}
        aria-label={`Eliminar campaña ${name}`}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-card border border-error/40 text-xs font-bold text-error transition-colors hover:bg-error/10 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Trash2 className="size-3.5" aria-hidden="true" />}
        {pending ? "Eliminando..." : "Eliminar"}
      </button>
      {error && <p role="alert" className="text-xs text-error">{error}</p>}
    </div>
  );
}
