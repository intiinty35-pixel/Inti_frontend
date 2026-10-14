"use client";

import { useRef, useState } from "react";
import { Building2, Loader2, X } from "lucide-react";
import { apiClient } from "@/shared/lib/api/client";
import type { AdminProjectWithPoints } from "@/features/admin/api/project-points";
import { ProjectPointsTable } from "./project-points-table";

export function ProjectPointsModal() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [projects, setProjects] = useState<AdminProjectWithPoints[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadProjects() {
    setLoading(true); setError(""); setProjects(null);
    try { setProjects(await apiClient.get<AdminProjectWithPoints[]>("/admin/campaigns/project-points")); }
    catch { setError("No se pudieron cargar los proyectos. Intenta nuevamente."); }
    finally { setLoading(false); }
  }

  return <>
    <button type="button" onClick={() => { dialog.current?.showModal(); void loadProjects(); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-card border border-brand px-4 text-sm font-bold text-brand hover:bg-brand-soft">
      <Building2 className="size-4" aria-hidden="true" />Puntos por proyecto Ariz
    </button>
    <dialog ref={dialog} aria-labelledby="project-points-title" className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-4xl overflow-y-auto rounded-card border border-edge bg-surface p-5 text-ink shadow-xl backdrop:bg-ink/50 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-accent">Puntos adicionales</p>
          <h2 id="project-points-title" className="mt-1 text-2xl font-black text-brand">Puntos por proyecto Ariz</h2>
          <p className="mt-2 text-sm text-muted">Asigna puntos por contactar, visitar y concretar. Se suman a los puntos normales cuando el referido elige este proyecto.</p>
          <p className="mt-1 text-xs text-muted">Los cambios se aplican a los próximos registros y estados alcanzados; los puntos ya otorgados se conservan.</p>
        </div>
        <button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Cerrar puntos por proyecto" className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-surface-muted"><X className="size-5" /></button>
      </div>
      {loading && <p role="status" className="flex items-center gap-2 py-8 text-sm text-muted"><Loader2 className="size-4 animate-spin" />Cargando proyectos...</p>}
      {error && <div className="mt-5"><p role="alert" className="text-sm text-error">{error}</p><button type="button" onClick={() => void loadProjects()} className="mt-2 text-sm font-bold text-brand underline">Reintentar</button></div>}
      {projects && <ProjectPointsTable projects={projects} />}
    </dialog>
  </>;
}
