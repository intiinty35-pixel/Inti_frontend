"use client";

import { useState, type FormEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { apiClient } from "@/shared/lib/api/client";

interface MemberData {
  name: string; email: string; phone: string;
  bankAccount: string | null; yape: string | null; plin: string | null;
}
const fields = [
  ['name', 'Nombre del miembro Ariz', 'text', 120], ['email', 'Correo', 'email', 254],
  ['phone', 'Teléfono', 'tel', 30], ['bankAccount', 'Cuenta bancaria', 'text', 80],
  ['yape', 'Número de Yape', 'tel', 30], ['plin', 'Número de Plin', 'tel', 30],
] as const;

export function MemberActions({ id, name, onUpdated }: { id: string; name: string; onUpdated: () => Promise<void> }) {
  const [form, setForm] = useState<MemberData | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buttonClass = "inline-flex items-center justify-center gap-1 rounded-card border border-edge px-2 py-1.5 text-xs font-bold text-brand hover:border-brand disabled:opacity-40";

  async function edit() {
    setPending(true); setError(null);
    try {
      const member = await apiClient.get<MemberData>(`/admin/referrals/referrers/${encodeURIComponent(id)}`);
      setForm({ name: member.name, email: member.email, phone: member.phone,
        bankAccount: member.bankAccount ?? '', yape: member.yape ?? '', plin: member.plin ?? '' });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los datos.'); }
    finally { setPending(false); }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setPending(true); setError(null);
    try {
      await apiClient.patch(`/admin/referrals/referrers/${encodeURIComponent(id)}`, form);
      setForm(null); await onUpdated();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudieron guardar los datos.'); }
    finally { setPending(false); }
  }
  async function remove() {
    if (!window.confirm(`¿Eliminar a “${name}” de la lista de miembros Ariz? Su historial de referidos y puntos se conserva.`)) return;
    setPending(true); setError(null);
    try {
      await apiClient.delete(`/admin/referrals/referrers/${encodeURIComponent(id)}`);
      await onUpdated();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo eliminar al miembro.'); }
    finally { setPending(false); }
  }
  return <div className="space-y-2">
    {form ? <form onSubmit={save} className="grid min-w-64 gap-2">
      {fields.map(([key, label, type, maxLength]) => <label key={key} className="grid gap-1 text-xs font-semibold text-brand">{label}
        <input autoFocus={key === 'name'} type={type} maxLength={maxLength} required={key === 'name' || key === 'email' || key === 'phone'} disabled={pending} value={form[key] ?? ''}
          onChange={event => setForm({ ...form, [key]: event.target.value })} className="h-9 w-full rounded-card border border-edge px-2 text-sm font-normal" />
      </label>)}
      <div className="flex gap-2"><button type="submit" disabled={pending} className={buttonClass}>{pending ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" disabled={pending} onClick={() => { setForm(null); setError(null); }} className={buttonClass}>Cancelar</button></div>
    </form> : <div className="flex gap-2">
      <button type="button" disabled={pending} title="Editar datos" aria-label={`Editar datos de ${name}`} onClick={() => void edit()} className={`${buttonClass} size-8 shrink-0`}><Pencil className="size-3.5" aria-hidden="true" /></button>
      <button type="button" disabled={pending} title="Eliminar miembro Ariz" onClick={() => void remove()} aria-label={`Eliminar miembro Ariz ${name}`} className={`${buttonClass} size-8 shrink-0 text-error hover:border-error`}><Trash2 className="size-3.5" aria-hidden="true" /></button>
    </div>}
    {error && <p role="alert" className="text-xs text-error">{error}</p>}
  </div>;
}
