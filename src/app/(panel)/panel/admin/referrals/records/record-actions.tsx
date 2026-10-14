"use client";

import { useState, type FormEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { apiClient } from "@/shared/lib/api/client";

export function RecordActions({ id, name, points, onUpdated }: {
  id: string; name: string; points: number; onUpdated: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(points));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buttonClass = "inline-flex items-center justify-center gap-1 rounded-card border border-edge px-2 py-1.5 text-xs font-bold text-brand hover:border-brand disabled:opacity-40";

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = Number(value);
    if (!value.trim() || !Number.isInteger(next) || next < 0 || next > 2147483647) {
      setError("Ingresa puntos enteros entre 0 y 2147483647."); return;
    }
    setPending(true); setError(null);
    try {
      await apiClient.patch(`/admin/referrals/records/${encodeURIComponent(id)}/points`, { points: next });
      setEditing(false); await onUpdated();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron guardar los puntos."); }
    finally { setPending(false); }
  }
  async function remove() {
    if (!window.confirm(`¿Eliminar al referido “${name}”? Se eliminarán su historial y sus puntos, incluidos los de campaña. Esta acción no se puede deshacer.`)) return;
    setPending(true); setError(null);
    try {
      await apiClient.delete(`/admin/referrals/records/${encodeURIComponent(id)}`);
      await onUpdated();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo eliminar el referido."); }
    finally { setPending(false); }
  }
  return <div className="space-y-2">
    {editing ? <form onSubmit={save} className="min-w-44 space-y-2">
      <label className="grid gap-1 text-xs font-semibold text-brand">Puntos de {name}
        <input autoFocus type="number" min={0} max={2147483647} step={1} required value={value} disabled={pending} onChange={event => setValue(event.target.value)} className="h-9 w-full rounded-card border border-edge px-2 text-sm" />
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={buttonClass}>{pending ? "Guardando..." : "Guardar"}</button>
        <button type="button" disabled={pending} onClick={() => { setEditing(false); setError(null); }} className={buttonClass}>Cancelar</button>
      </div>
    </form> : <div className="flex gap-2">
      <button type="button" disabled={pending} title="Editar puntos" aria-label={`Editar puntos de ${name}`} onClick={() => { setValue(String(points)); setError(null); setEditing(true); }} className={`${buttonClass} size-8 shrink-0`}><Pencil className="size-3.5" aria-hidden="true" /></button>
      <button type="button" disabled={pending} title="Eliminar referido" onClick={() => void remove()} aria-label={`Eliminar referido ${name}`} className={`${buttonClass} size-8 shrink-0 text-error hover:border-error`}><Trash2 className="size-3.5" aria-hidden="true" /></button>
    </div>}
    {error && <p role="alert" className="text-xs text-error">{error}</p>}
  </div>;
}
