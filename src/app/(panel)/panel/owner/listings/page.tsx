"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui";
import { PinIcon, PlusIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";
import { formatArea, formatNumber, formatPrice } from "@/shared/lib/format";
import { CreateProjectDialog, type CreateProjectPayload } from "@/features/projects";
import { PREVIEW_PROJECTS } from "@/features/listings";

interface ProjectDraftRow {
  id: string;
  createdAt: string;
  payload: CreateProjectPayload;
}

function draftRow(payload: CreateProjectPayload): ProjectDraftRow {
  return {
    id: `${payload.name}-${Date.now()}`,
    createdAt: new Date().toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" }),
    payload,
  };
}

export default function PanelOwnerListingsPage() {
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<ProjectDraftRow[]>([]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-light text-brand">Mis publicaciones</h1>

        <Button type="button" onClick={() => setOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          Nuevo proyecto
        </Button>
      </div>

      <Card>
        <CardContent className={cn(drafts.length > 0 && "py-0")}>
          {drafts.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              Tus propiedades publicadas aparecerán aquí.
            </p>
          ) : (
            <ul className="divide-y divide-edge">
              {drafts.map((draft) => {
                const { payload } = draft;
                const totalArea = payload.lots.reduce((total, lot) => total + lot.areaM2, 0);

                return (
                  <li key={draft.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-ink">{payload.name}</h2>
                        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] text-brand uppercase">
                          Borrador
                        </span>
                      </div>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                        <PinIcon className="size-3.5 shrink-0" />
                        {payload.location.district}, {payload.location.department}
                      </p>

                      <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                        <div className="flex gap-1.5">
                          <dt className="text-muted">Precio</dt>
                          <dd className="font-semibold text-ink">
                            {formatPrice(payload.priceFrom)} – {formatPrice(payload.priceTo)}
                          </dd>
                        </div>
                        <div className="flex gap-1.5">
                          <dt className="text-muted">Lotes</dt>
                          <dd className="font-semibold text-ink">{formatNumber(payload.lots.length)}</dd>
                        </div>
                        <div className="flex gap-1.5">
                          <dt className="text-muted">Área</dt>
                          <dd className="font-semibold text-ink">{formatArea(totalArea) || "—"}</dd>
                        </div>
                        <div className="flex gap-1.5">
                          <dt className="text-muted">Etapa</dt>
                          <dd className="font-semibold text-ink">{payload.stageLabel}</dd>
                        </div>
                      </dl>

                      <p className="mt-2 text-[11px] text-muted">
                        Guardado el {draft.createdAt} · {payload.images.length} imágenes ·{" "}
                        {payload.milestones.length} hitos
                      </p>
                    </div>

                    <Button type="button" variant="secondary" size="sm" className="shrink-0">
                      Editar
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <CreateProjectDialog
        open={open}
        previewProjects={PREVIEW_PROJECTS}
        onSave={(payload) => setDrafts((current) => [draftRow(payload), ...current])}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
