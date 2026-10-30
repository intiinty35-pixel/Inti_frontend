"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import type { Campaign, CampaignPoints, CreateCampaignInput, UpdateCampaignInput } from "@/features/admin/api/campaigns-client";

interface CampaignFormProps {
  campaign?: Campaign;
  arizProjects: Array<{ id: string; name: string }>;
  onSubmit: (input: CreateCampaignInput | UpdateCampaignInput) => Promise<void>;
  mode: "create" | "edit";
}

export function CampaignForm({
  campaign,
  arizProjects,
  onSubmit,
  mode,
}: CampaignFormProps) {
  const router = useRouter();
  const [name, setName] = useState(campaign?.name ?? "");
  const [description, setDescription] = useState(campaign?.description ?? "");
  const [startDate, setStartDate] = useState(campaign?.startDate ? campaign.startDate.split("T")[0] : "");
  const [endDate, setEndDate] = useState(campaign?.endDate ? campaign.endDate.split("T")[0] : "");
  const [pointsInput, setPointsInput] = useState({
    CONTACTED: String(campaign?.points.CONTACTED ?? 0),
    VISIT: String(campaign?.points.VISIT ?? 0),
    OPERATION_COMPLETED: String(campaign?.points.OPERATION_COMPLETED ?? 0),
  });
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(campaign?.projectIds ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleProject(projectId: string) {
    setSelectedProjectIds((current) =>
      current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId]
    );
  }

  function updatePointInput(status: keyof CampaignPoints, value: string) {
    const filtered = value.replace(/[^0-9]/g, "");
    setPointsInput((current) => ({
      ...current,
      [status]: filtered,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    if (!name.trim()) {
      setError("El nombre de la campaña es requerido.");
      setSaving(false);
      return;
    }

    if (!startDate) {
      setError("La fecha de inicio es requerida.");
      setSaving(false);
      return;
    }

    if (!endDate) {
      setError("La fecha de fin es requerida.");
      setSaving(false);
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio.");
      setSaving(false);
      return;
    }

    if (selectedProjectIds.length === 0) {
      setError("Selecciona al menos un proyecto.");
      setSaving(false);
      return;
    }

    try {
      const points: CampaignPoints = {
        CONTACTED: parseInt(pointsInput.CONTACTED || "0", 10),
        VISIT: parseInt(pointsInput.VISIT || "0", 10),
        OPERATION_COMPLETED: parseInt(pointsInput.OPERATION_COMPLETED || "0", 10),
      };
      const input = {
        name: name.trim(),
        description: description.trim() || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        points,
        projectIds: selectedProjectIds,
      };

      await onSubmit(input);
      router.push("/panel/admin/campaigns");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Error al guardar la campaña."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-card border border-edge bg-surface p-5">
        <h3 className="text-sm font-black uppercase tracking-wide text-accent">
          Información general
        </h3>
        <div className="mt-4 grid gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink">Nombre de la campaña *</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Campaña Verano 2026"
              className="h-10 rounded-card border border-edge bg-canvas px-3 text-sm font-semibold text-ink outline-none transition-colors focus:border-brand"
              maxLength={120}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink">Descripción (opcional)</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descripción breve de la campaña..."
              rows={3}
              className="resize-none rounded-card border border-edge bg-canvas px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors focus:border-brand"
              maxLength={500}
            />
          </label>
        </div>
      </div>

      <div className="rounded-card border border-edge bg-surface p-5">
        <h3 className="text-sm font-black uppercase tracking-wide text-accent">
          Fechas de la campaña
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink">Fecha de inicio *</span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-10 rounded-card border border-edge bg-canvas px-3 text-sm font-semibold text-ink outline-none transition-colors focus:border-brand"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink">Fecha de fin *</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-10 rounded-card border border-edge bg-canvas px-3 text-sm font-semibold text-ink outline-none transition-colors focus:border-brand"
            />
          </label>
        </div>
      </div>

      <div className="rounded-card border border-edge bg-surface p-5">
        <h3 className="text-sm font-black uppercase tracking-wide text-accent">
          Puntos por estado (independientes)
        </h3>
        <p className="mt-2 text-xs font-semibold text-muted">
          Estos puntos se cuentan de forma independiente a los puntos normales de referidos.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="rounded-card border border-edge bg-canvas p-3 text-center">
            <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-muted">
              Contactado
            </span>
            <span className="mt-2 flex items-center justify-center gap-1">
              <span className="text-sm font-black text-brand">+</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pointsInput.CONTACTED}
                onChange={(event) => updatePointInput("CONTACTED", event.target.value)}
                className="h-9 w-20 rounded-card border border-edge bg-surface px-2 text-center text-base font-black text-brand outline-none transition-colors focus:border-brand"
              />
              <span className="text-xs font-bold text-muted">pts</span>
            </span>
          </label>
          <label className="rounded-card border border-edge bg-canvas p-3 text-center">
            <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-muted">
              Visita
            </span>
            <span className="mt-2 flex items-center justify-center gap-1">
              <span className="text-sm font-black text-brand">+</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pointsInput.VISIT}
                onChange={(event) => updatePointInput("VISIT", event.target.value)}
                className="h-9 w-20 rounded-card border border-edge bg-surface px-2 text-center text-base font-black text-brand outline-none transition-colors focus:border-brand"
              />
              <span className="text-xs font-bold text-muted">pts</span>
            </span>
          </label>
          <label className="rounded-card border border-edge bg-canvas p-3 text-center">
            <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-muted">
              Operación completada
            </span>
            <span className="mt-2 flex items-center justify-center gap-1">
              <span className="text-sm font-black text-brand">+</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pointsInput.OPERATION_COMPLETED}
                onChange={(event) => updatePointInput("OPERATION_COMPLETED", event.target.value)}
                className="h-9 w-20 rounded-card border border-edge bg-surface px-2 text-center text-base font-black text-brand outline-none transition-colors focus:border-brand"
              />
              <span className="text-xs font-bold text-muted">pts</span>
            </span>
          </label>
        </div>
      </div>

      <div className="rounded-card border border-edge bg-surface p-5">
        <h3 className="text-sm font-black uppercase tracking-wide text-accent">
          Proyectos asociados
        </h3>
        <p className="mt-2 text-xs font-semibold text-muted">
          Selecciona los proyectos INTI que formarán parte de esta campaña.
        </p>
        {arizProjects.length === 0 ? (
          <div className="mt-4 rounded-card border border-edge bg-surface-muted p-6 text-center">
            <p className="text-sm font-semibold text-muted">
              No hay proyectos INTI disponibles.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {arizProjects.map((project) => {
              const isSelected = selectedProjectIds.includes(project.id);
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => toggleProject(project.id)}
                  className={`flex items-center justify-between rounded-card border p-2 sm:p-3 text-left text-[10px] sm:text-sm font-bold transition-colors ${
                    isSelected
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-edge bg-canvas text-ink hover:border-brand"
                  }`}
                >
                  <span className="min-w-0 truncate">{project.name}</span>
                  {isSelected ? (
                    <X className="size-4 shrink-0 text-brand" />
                  ) : (
                    <span className="size-4 shrink-0 rounded-full border-2 border-edge" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-card border border-error/30 bg-error/10 p-4">
          <p className="text-sm font-bold text-error">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-6 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-60"
        >
          <Save className="size-4" aria-hidden="true" />
          {saving ? "Guardando..." : mode === "create" ? "Crear campaña" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
