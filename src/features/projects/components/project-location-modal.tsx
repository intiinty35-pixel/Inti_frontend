"use client";

import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import { PROJECT_DRAFT_DEFAULTS } from "@/features/projects/lib/project-draft";
import { StepLocation } from "@/features/projects/components/steps/step-location";
import {
  updateAdminProjectLocation,
  updateProjectLocation,
  type ProjectLocationInput,
} from "@/features/projects/api";
import type { ProjectApiSummary } from "@/features/projects/types/api";
import type { ProjectDraft } from "@/features/projects/types/draft";

export function ProjectLocationModal({
  project,
  adminMode,
  saving,
  error,
  onClose,
  onSavingChange,
  onError,
  onSaved,
}: {
  project: ProjectApiSummary;
  adminMode: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSavingChange: (saving: boolean) => void;
  onError: (message: string | null) => void;
  onSaved: () => void;
}) {
  const methods = useForm<ProjectDraft>({
    defaultValues: {
      ...PROJECT_DRAFT_DEFAULTS,
      department: project.location.department,
      province: project.location.province,
      district: project.location.district,
      zone: project.location.zone ?? "",
      street: project.location.street ?? "",
      streetNumber: project.location.streetNumber ?? "",
      lat: project.location.lat ?? project.location.latitude ?? undefined,
      lng: project.location.lng ?? project.location.longitude ?? undefined,
    },
  });

  async function submit(draft: ProjectDraft) {
    onError(null);

    if (!draft.department || !draft.province || !draft.district) {
      onError("Completa departamento, provincia y distrito.");
      return;
    }

    if (typeof draft.lat !== "number" || typeof draft.lng !== "number") {
      onError("Fija el punto en el mapa o ingresa latitud y longitud.");
      return;
    }

    const location: ProjectLocationInput = {
      department: draft.department,
      province: draft.province,
      district: draft.district,
      zone: draft.zone?.trim() || undefined,
      street: draft.street.trim(),
      streetNumber: draft.streetNumber.trim(),
      latitude: draft.lat,
      longitude: draft.lng,
    };

    onSavingChange(true);
    try {
      await (adminMode
        ? updateAdminProjectLocation(project.id, location)
        : updateProjectLocation(project.id, location));
      onSaved();
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : "No se pudo actualizar la ubicación.");
    } finally {
      onSavingChange(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-pop)] sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`project-location-title-${project.id}`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id={`project-location-title-${project.id}`} className="font-display text-2xl font-black text-brand">
              Editar ubicación
            </h2>
            <p className="mt-1 text-sm text-muted">
              Corrige la dirección y fija el punto exacto del proyecto en el mapa.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            ×
          </button>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(submit)} className="space-y-5">
            <StepLocation />

            {error ? (
              <p className="rounded-card bg-error/10 px-3 py-2 text-sm font-semibold text-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 border-t border-edge pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar ubicación"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </section>
    </div>
  );
}
