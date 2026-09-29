"use client";

import { useFieldArray } from "react-hook-form";
import { FieldSet, useFieldError } from "@/shared/ui/field-shell";
import { TextField } from "@/shared/ui/rhf-fields";
import { ChipGroup } from "@/shared/ui/radio-group";
import { Button } from "@/shared/ui/button";
import { CalendarIcon, PlusIcon, TrashIcon } from "@/shared/ui/icons";
import { PROJECT_CERTIFICATIONS } from "@/features/projects/data/project-catalogs";
import { createEmptyMilestone } from "@/features/projects/lib/project-draft";
import type { ProjectDraft } from "@/features/projects/types/draft";

const DATE_HINT = "La entrega no puede ser anterior al inicio de construcción.";

export function StepTimeline() {
  const { fields, append, remove } = useFieldArray({ name: "milestones" });

  const startError = useFieldError<ProjectDraft>("constructionStart");
  const deliveryError = useFieldError<ProjectDraft>("estimatedDelivery");

  return (
    <div className="flex flex-col gap-6">
      <FieldSet
        legend="Fechas del proyecto"
        description="La entrega estimada es obligatoria; el inicio sirve para ordenar el cronograma."
        required
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField<ProjectDraft>
            name="constructionStart"
            label="Inicio de construcción"
            type="date"
            error={startError}
            hint="Opcional."
          />
          <TextField<ProjectDraft>
            name="estimatedDelivery"
            label="Entrega estimada"
            type="date"
            error={deliveryError}
            hint={deliveryError ? undefined : DATE_HINT}
            required
          />
        </div>
      </FieldSet>

      <FieldSet
        legend="Hitos del cronograma"
        description="Opcional. Los hitos en blanco se descartan; si agregas uno, la fecha también es obligatoria."
      >
        <div className="flex flex-col gap-3">
          {fields.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <li key={field.id} className="grid gap-3 rounded-card border border-edge p-3 sm:grid-cols-[1fr_180px_auto]">
                  <TextField<ProjectDraft>
                    name={`milestones.${index}.title`}
                    label="Hito"
                    placeholder="Habilitación urbana"
                  />
                  <TextField<ProjectDraft>
                    name={`milestones.${index}.date`}
                    label="Fecha"
                    type="date"
                  />
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      aria-label={`Quitar el hito ${index + 1}`}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <TextField<ProjectDraft>
                    name={`milestones.${index}.note`}
                    label="Nota"
                    placeholder="Detalle opcional para el avance de obra."
                    className="sm:col-span-3"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-card bg-surface-muted p-3 text-sm text-muted">
              Sin hitos registrados. Puedes añadirlos o dejarlos así.
            </p>
          )}

          <div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append(createEmptyMilestone())}
            >
              <PlusIcon className="h-4 w-4" />
              Agregar hito
            </Button>
          </div>
        </div>
      </FieldSet>

      <FieldSet
        legend="Certificaciones"
        description="Opcional. Licencias y documentos legales que respaldan el proyecto."
      >
        <ChipGroup<ProjectDraft> name="certifications" options={PROJECT_CERTIFICATIONS} />
      </FieldSet>

      <div className="flex items-start gap-2 rounded-card bg-surface-muted p-3 text-xs text-muted">
        <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <p>
          {fields.length === 0
            ? "Al publicar se usará solo la fecha de entrega estimada."
            : `${fields.length} hitos en el cronograma.`}
        </p>
      </div>
    </div>
  );
}
