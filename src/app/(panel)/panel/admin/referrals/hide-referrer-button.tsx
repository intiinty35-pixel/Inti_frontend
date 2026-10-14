"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

/** Icono de eliminar de la tarjeta de un miembro: lo oculta de la lista sin perder su historial. */
export function HideReferrerButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!confirm(`¿Eliminar a ${name} de la lista? Su historial de referidos y puntos se conserva.`)) return;
    setPending(true);
    try {
      const response = await fetch(`/api/admin/referrals/referrers/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("No se pudo eliminar");
      router.refresh();
    } catch {
      alert("No se pudo eliminar al miembro. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={`Eliminar a ${name}`}
      title="Eliminar de la lista"
      disabled={pending}
      onClick={() => void handleClick()}
      className="absolute right-2 top-3.5 z-10 flex size-8 items-center justify-center rounded-full bg-surface/90 text-muted shadow-sm transition-colors hover:bg-error/10 hover:text-error disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </button>
  );
}
