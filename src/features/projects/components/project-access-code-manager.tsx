"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, RefreshCw, Trash2 } from "lucide-react";
import { apiClient } from "@/shared/lib/api/client";

export type ProjectAccessCodeRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  configured: boolean;
  expiresAt: string | null;
};

type IssuedCode = { code: string; expiresAt: string };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ProjectAccessCodeManager({
  projects,
  selectedProjectId,
}: {
  projects: ProjectAccessCodeRow[];
  selectedProjectId?: string;
}) {
  const [rows, setRows] = useState(projects);
  const [days, setDays] = useState<Record<string, number>>({});
  const [issued, setIssued] = useState<Record<string, IssuedCode>>({});
  const [busyId, setBusyId] = useState<string>();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const orderedRows = selectedProjectId
    ? [...rows].sort((a, b) => Number(b.id === selectedProjectId) - Number(a.id === selectedProjectId))
    : rows;

  async function generate(project: ProjectAccessCodeRow) {
    if (project.configured && !window.confirm(`El código actual de «${project.name}» dejará de funcionar. ¿Generar uno nuevo?`)) return;
    setBusyId(project.id);
    setError("");
    setNotice("");
    try {
      const result = await apiClient.post<IssuedCode>(
        `/admin/projects/${encodeURIComponent(project.id)}/site-plan/access-code`,
        { expiresInDays: days[project.id] ?? 7 },
      );
      setIssued(previous => ({ ...previous, [project.id]: result }));
      setRows(previous => previous.map(row => row.id === project.id
        ? { ...row, configured: true, expiresAt: result.expiresAt }
        : row));
      setNotice(`Código generado para ${project.name}. Cópialo ahora; no volverá a mostrarse.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo generar el código.");
    } finally {
      setBusyId(undefined);
    }
  }

  async function revoke(project: ProjectAccessCodeRow) {
    if (!window.confirm(`¿Revocar el código de «${project.name}»? El acceso público se bloqueará inmediatamente.`)) return;
    setBusyId(project.id);
    setError("");
    setNotice("");
    try {
      await apiClient.delete(`/admin/projects/${encodeURIComponent(project.id)}/site-plan/access-code`);
      setRows(previous => previous.map(row => row.id === project.id
        ? { ...row, configured: false, expiresAt: null }
        : row));
      setIssued(previous => {
        const next = { ...previous };
        delete next[project.id];
        return next;
      });
      setNotice(`Código revocado para ${project.name}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo revocar el código.");
    } finally {
      setBusyId(undefined);
    }
  }

  async function copyCode(project: ProjectAccessCodeRow) {
    const code = issued[project.id]?.code;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setNotice(`Código de ${project.name} copiado.`);
    } catch {
      setError("No se pudo copiar el código. Selecciónalo y cópialo manualmente.");
    }
  }

  return (
    <section className="grid gap-4">
      <p className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-blue-950">
        Cada código se genera de forma segura, funciona para un solo proyecto y
        vence según el plazo elegido. Se muestra una sola vez al generarlo;
        guárdalo o cópialo para compartirlo con el asesor.
      </p>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-900">{notice}</p>}
      {!rows.length ? (
        <p className="rounded-2xl border border-edge bg-surface p-6 text-sm text-muted">No hay proyectos registrados.</p>
      ) : orderedRows.map(project => {
        const current = issued[project.id];
        const expired = !project.configured && project.expiresAt !== null;
        return (
          <article key={project.id} className={`grid gap-4 rounded-2xl border bg-surface p-5 shadow-sm ${project.id === selectedProjectId ? "border-accent ring-2 ring-accent/30" : "border-edge"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid gap-1">
                <h2 className="font-display text-lg font-black text-brand">{project.name}</h2>
                <p className="text-xs text-muted">{project.slug} · {project.status}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${project.configured && !expired ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"}`}>
                {project.configured && !expired ? "Código activo" : expired ? "Código vencido" : "Sin código"}
              </span>
            </div>
            {project.expiresAt && (
              <p className="text-sm text-muted">
                {expired ? "Venció" : "Vence"}: {formatDate(project.expiresAt)}
              </p>
            )}
            {current && (
              <div className="grid min-w-0 grid-cols-1 gap-3 rounded-xl border border-green-200 bg-green-50 p-3 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                <div className="flex min-w-0 items-center gap-2 sm:flex-1">
                  <KeyRound size={16} className="shrink-0 text-green-800" />
                  <code className="min-w-0 break-all text-base font-bold tracking-wider text-green-950">{current.code}</code>
                </div>
                <button type="button" onClick={() => void copyCode(project)} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-green-300 bg-white px-3 text-sm font-bold text-green-900 sm:min-h-9 sm:w-auto">
                  <Copy size={15} /> Copiar
                </button>
                <span className="inline-flex items-center gap-1 text-xs text-green-800"><Check size={14} />Visible solo ahora</span>
              </div>
            )}
            <div className="flex flex-wrap items-end gap-3">
              <label className="grid gap-1 text-xs font-bold text-muted">
                Vigencia
                <select
                  value={days[project.id] ?? 7}
                  onChange={event => setDays(previous => ({ ...previous, [project.id]: Number(event.target.value) }))}
                  className="min-h-10 rounded-lg border border-edge bg-white px-3 text-sm text-ink"
                >
                  <option value={1}>1 día</option>
                  <option value={7}>7 días</option>
                  <option value={30}>30 días</option>
                </select>
              </label>
              <button type="button" disabled={busyId === project.id} onClick={() => void generate(project)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-on-brand disabled:opacity-60">
                <RefreshCw size={15} />{busyId === project.id ? "Procesando…" : project.configured ? "Generar nuevo código" : "Generar código"}
              </button>
              {project.configured && (
                <button type="button" disabled={busyId === project.id} onClick={() => void revoke(project)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-bold text-red-700 disabled:opacity-60">
                  <Trash2 size={15} />Revocar
                </button>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
