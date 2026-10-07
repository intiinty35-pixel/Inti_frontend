"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Pencil, Plus, Trash2, XCircle } from "lucide-react";
import {
  createInvestmentType,
  deleteInvestmentType,
  updateInvestmentType,
} from "@/features/investment-opportunities/api/client";
import type { InvestmentType, InvestmentTypeInput } from "@/features/investment-opportunities/types";

const emptyInput: InvestmentTypeInput = {
  name: "",
  description: "",
  isActive: true,
  sortOrder: 0,
};

const inputClass =
  "h-10 w-full rounded-card border border-edge bg-white px-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15";

export function InvestmentTypeAdmin({ types }: { types: InvestmentType[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InvestmentTypeInput>(emptyInput);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function edit(type: InvestmentType) {
    setEditingId(type.id);
    setForm({
      name: type.name,
      description: type.description ?? "",
      isActive: type.isActive,
      sortOrder: type.sortOrder,
    });
    setError("");
  }

  function reset() {
    setEditingId(null);
    setForm(emptyInput);
    setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (editingId) {
        await updateInvestmentType(editingId, form);
      } else {
        await createInvestmentType(form);
      }
      reset();
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el tipo.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(type: InvestmentType) {
    if (!window.confirm(`Eliminar el tipo "${type.name}"?`)) return;
    setBusy(true);
    setError("");
    try {
      await deleteInvestmentType(type.id);
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el tipo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
      <form onSubmit={save} className="rounded-card border border-edge bg-surface p-4 shadow-[var(--shadow-card)]">
        <h2 className="font-display text-xl font-black text-brand">
          {editingId ? "Editar tipo" : "Nuevo tipo"}
        </h2>
        <p className="mt-1 text-sm font-semibold text-muted">
          Estos tipos se usan al crear oportunidades y pueden mostrarse en /inversiones.
        </p>

        <div className="mt-4 grid gap-3">
          <label className="text-sm font-bold text-ink">
            Nombre
            <input
              className={`${inputClass} mt-1.5`}
              value={form.name}
              maxLength={100}
              required
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label className="text-sm font-bold text-ink">
            Descripción
            <textarea
              className="mt-1.5 min-h-24 w-full rounded-card border border-edge bg-white p-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              value={form.description ?? ""}
              maxLength={220}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <label className="text-sm font-bold text-ink">
            Orden
            <input
              className={`${inputClass} mt-1.5`}
              type="number"
              step="1"
              value={form.sortOrder}
              onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-ink">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
            />
            Activo
          </label>
        </div>

        {error ? <p className="mt-3 rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {editingId ? (
            <button type="button" onClick={reset} className="h-10 rounded-card border border-edge px-4 text-sm font-bold text-ink">
              Cancelar
            </button>
          ) : null}
          <button disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-card bg-brand px-4 text-sm font-black text-on-brand disabled:opacity-60">
            <Plus className="size-4" />
            {editingId ? "Guardar" : "Crear tipo"}
          </button>
        </div>
      </form>

      <section className="rounded-card border border-edge bg-surface p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-black text-brand">Tipos de inversión</h2>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-black text-brand">{types.length} tipos</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {types.map((type) => (
            <article key={type.id} className="rounded-card border border-edge bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black text-ink">{type.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{type.description || "Sin descripción."}</p>
                </div>
                <span className="shrink-0 text-muted">
                  {type.isActive ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted" />}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-muted">Orden {type.sortOrder}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => edit(type)} className="inline-flex size-8 items-center justify-center rounded-card border border-edge text-brand hover:bg-brand/5">
                    <Pencil className="size-4" />
                  </button>
                  <button type="button" disabled={busy} onClick={() => void remove(type)} className="inline-flex size-8 items-center justify-center rounded-card border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
