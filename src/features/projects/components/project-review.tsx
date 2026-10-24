"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { CheckCircleIcon, ChevronDownIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";
import type { CreateProjectPayload } from "@/features/projects/api";
import {
  LOT_STATUS_LABELS,
  PROJECT_CATEGORY_LABELS,
  PROJECT_SERVICE_LABELS,
  PROJECT_STAGE_LABELS,
} from "@/features/projects/data/project-catalogs";
import { formatAmenityLabels, formatLocation, summarizeLots } from "@/features/projects/lib/project-summary";
import type { LotDraft, LotStatus } from "@/features/projects/types/draft";
import type { ProjectPreview } from "@/features/projects/types/preview";
import { formatArea, formatNumber, formatPrice } from "@/shared/lib/format";

const LABEL_CLASS = "text-xs font-semibold text-muted";
const VALUE_CLASS = "text-sm text-ink";
const SECTION_LABEL = "text-[10px] font-bold tracking-[0.12em] text-brand uppercase";
const CHIP_CLASS = "rounded-full border border-edge px-2.5 py-1 text-xs text-muted";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className={LABEL_CLASS}>{label}</dt>
      <dd className={VALUE_CLASS}>{value || "—"}</dd>
    </div>
  );
}

export interface ProjectReviewProps {
  payload: CreateProjectPayload;
  lots: readonly LotDraft[];
  previewProjects: readonly ProjectPreview[];
  adminMode?: boolean;
  /** Modo edicion: el proyecto ya existe y se guardan cambios, no un borrador nuevo. */
  editing?: boolean;
  onSave: (payload: CreateProjectPayload) => void | Promise<void>;
  onDone: () => void;
  saving?: boolean;
  error?: string | null;
}

function PreviewCard({ project }: { project: ProjectPreview }) {
  const lots =
    project.lotsTotal === undefined
      ? null
      : `${formatNumber(project.lotsTotal)} ${project.lotsLabel ?? "unidades"}`;

  return (
    <li className="rounded-[6px] border border-edge p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-bold tracking-[0.16em] text-accent uppercase">
            {project.developer}
          </p>
          <p className="mt-0.5 truncate text-[13px] font-bold text-brand">{project.name}</p>
        </div>
        {project.deliveryStage ? (
          <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[9px] font-bold text-brand">
            {project.deliveryStage}
          </span>
        ) : null}
      </div>

      <p className="mt-1.5 text-sm font-bold text-brand">
        Desde {formatPrice(project.startingPrice.amount, project.startingPrice.currency)}
      </p>
      <p className="mt-0.5 text-[11px] text-muted">
        {formatArea(project.areaRange.min)} – {formatArea(project.areaRange.max)}
        {lots ? ` · ${lots}` : ""} · {project.location.district}
      </p>
    </li>
  );
}

export function ProjectReview({
  payload,
  lots,
  previewProjects,
  adminMode = false,
  editing = false,
  onSave,
  onDone,
  saving = false,
  error = null,
}: ProjectReviewProps) {
  const [showJson, setShowJson] = useState(false);
  const isGroup = payload.lotMode === "grupo";
  const totals = summarizeLots(lots, payload.lotMode);
  const location = formatLocation(payload.location);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3 rounded-card bg-success/10 p-4">
        <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-success" />
        <div>
          <p className="text-sm font-semibold text-ink">
            {editing ? "Cambios validados correctamente" : "Borrador validado correctamente"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {editing
              ? "Al confirmar se suben las imágenes nuevas y se guardan los cambios. Si el proyecto ya está publicado, seguirá visible con la información actualizada."
              : `Al confirmarlo se suben las imágenes y el proyecto se guarda como borrador. ${
                  adminMode
                    ? "Desde Proyectos ARIZ podrás publicarlo directamente, sin consumir créditos."
                    : "Podrás publicarlo después desde Mis proyectos si tienes crédito disponible en tu suscripción."
                }`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-brand">{payload.name}</h3>
          <p className="text-xs text-muted">
            {PROJECT_CATEGORY_LABELS[payload.category]} · {PROJECT_STAGE_LABELS[payload.stage]}
          </p>
        </div>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-brand uppercase">
          {editing ? "Edición" : "Borrador"}
        </span>
      </div>

      <dl className="grid gap-4 rounded-card border border-edge p-4 sm:grid-cols-2 lg:grid-cols-3">
        <Row label="Rango de precios" value={`${formatPrice(payload.priceFrom, payload.currency)} – ${formatPrice(payload.priceTo, payload.currency)}`} />
        <Row label="Ubicación" value={location} />
        <Row
          label={payload.category === "departamentos" ? "Departamentos" : isGroup ? "Grupos completos" : "Lotes completos"}
          value={
            payload.category === "departamentos" ? "Se configuran por edificio y piso en el editor del plano" : isGroup
              ? `${formatNumber(totals.filledLots)} grupos · ${formatNumber(totals.totalUnits)} lotes`
              : `${formatNumber(payload.lots.length)} de ${totals.filledLots + totals.blankLots} fichas`
          }
        />
        <Row label="Área total" value={payload.category === "departamentos" ? "Según los planos de cada piso" : formatArea(totals.totalAreaM2) || "—"} />
        <Row label="Inventario" value={payload.category === "departamentos" ? "Precios por departamento en el editor" : formatPrice(totals.totalPrice, payload.currency)} />
        <Row
          label={payload.category === "departamentos" ? "Edificios" : "Manzanas"}
          value={payload.category === "departamentos" ? String(payload.totalBlocks ?? "Configurar en el editor") : totals.blocks.length > 0 ? totals.blocks.join(", ") : "—"}
        />
        <Row label="Entrega estimada" value={payload.estimatedDelivery} />
        <Row
          label="Hitos"
          value={payload.milestones.length > 0 ? `${payload.milestones.length}` : "—"}
        />
        <Row
          label="Financiamiento"
          value={payload.financingLabels.length > 0 ? payload.financingLabels.join(" · ") : "—"}
        />
        <Row
          label="Certificaciones"
          value={payload.certificationLabels.length > 0 ? payload.certificationLabels.join(" · ") : "—"}
        />
        <Row
          label="Adjuntos"
          value={`${payload.images.length} imágenes · ${payload.plans.length} planos · ${payload.renderImages.length} renders`}
        />
      </dl>

      <div>
        <h4 className={cn(SECTION_LABEL, "mb-1.5")}>Servicios</h4>
        {payload.services.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {payload.services.map((service) => (
              <li key={service} className={CHIP_CLASS}>
                {PROJECT_SERVICE_LABELS[service]}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted">Sin servicios seleccionados.</p>
        )}
      </div>

      <div>
        <h4 className={cn(SECTION_LABEL, "mb-1.5")}>Amenidades</h4>
        <ul className="flex flex-wrap gap-1.5">
          {formatAmenityLabels(payload.amenities).map((amenity) => (
            <li key={amenity} className={CHIP_CLASS}>
              {amenity}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className={cn(SECTION_LABEL, "mb-1.5")}>
          Estado {isGroup ? "de los lotes" : "de las fichas"}
        </h4>
        <ul className="flex flex-wrap gap-1.5">
          {(Object.keys(LOT_STATUS_LABELS) as LotStatus[]).map((status) => (
            <li key={status} className={CHIP_CLASS}>
              {LOT_STATUS_LABELS[status]} ·{" "}
              {isGroup
                ? formatNumber(totals.byStatus[status])
                : payload.lots.filter((lot) => lot.status === status).length}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-card border border-edge p-4">
        <h4 className={SECTION_LABEL}>Vista previa de proyectos</h4>
        <p className="mt-1 text-xs text-muted">
          Así se ven las fichas en la sección de destacados del home.
        </p>

        {previewProjects.length > 0 ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {previewProjects.map((project) => (
              <PreviewCard key={project.id} project={project} />
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-muted">Sin proyectos de referencia.</p>
        )}
      </div>

      <div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setShowJson((current) => !current)}
          aria-expanded={showJson}
        >
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${showJson ? "rotate-180" : ""}`} />
          {showJson ? "Ocultar payload JSON" : "Ver payload JSON"}
        </Button>

        {showJson ? (
          <pre className="mt-3 max-h-72 overflow-auto rounded-card border border-edge bg-surface-muted p-3 font-mono text-[11px] leading-relaxed text-ink">
            {JSON.stringify(payload, null, 2)}
          </pre>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-card bg-error/10 px-4 py-3 text-sm font-semibold text-error">{error}</p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone} disabled={saving}>
          Cerrar sin guardar
        </Button>
        <Button type="button" onClick={() => void onSave(payload)} disabled={saving}>
          <CheckCircleIcon className="h-4 w-4" />
          {saving
            ? editing
              ? "Guardando cambios…"
              : "Guardando borrador…"
            : editing
              ? "Guardar cambios"
              : adminMode
                ? "Guardar borrador ARIZ"
                : "Guardar borrador"}
        </Button>
      </div>
    </div>
  );
}
