"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";
import { ListingImage } from "@/features/listings/components/listing-image";
import { getAgencyPublicationDetails, type AgencyPublicationDetail } from "@/features/admin/actions";
import type {
  AdminAgencyPropertyReview,
  AdminAgencyProjectReview,
} from "@/features/admin/api/server";
import { formatArea, formatPrice } from "@/shared/lib/format";
import type { ApiProjectStage } from "@/features/projects/types/api";

interface PropertyDetailsProps {
  kind: "property";
  item: AdminAgencyPropertyReview;
}

interface ProjectDetailsProps {
  kind: "project";
  item: AdminAgencyProjectReview;
}

type AgencyPublicationDetailsProps = PropertyDetailsProps | ProjectDetailsProps;

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  houses: "Casa",
  apartments: "Departamento",
  land: "Terreno",
  projects: "Proyecto",
  "country-lots": "Lote de campo",
  commercial: "Comercial",
};

const OPERATION_LABELS: Record<string, string> = {
  buy: "Venta",
  rent: "Alquiler",
  invest: "Inversión",
};

const PROJECT_REVIEW_STAGE_LABELS: Record<ApiProjectStage, string> = {
  PRE_SALE: "Preventa",
  UNDER_CONSTRUCTION: "En construcción",
  DELIVERED: "Entregado",
};

function DetailValue({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="rounded-sm bg-surface-muted/70 px-3 py-2">
      <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-0.5 break-words text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

export function AgencyPublicationDetails({ kind, item }: AgencyPublicationDetailsProps) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<AgencyPublicationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isProperty = kind === "property";
  const title = isProperty ? item.title : item.name;
  const projectDetail =
    kind === "project"
      ? detail?.kind === "project"
        ? detail.detail
        : item as AdminAgencyProjectReview
      : null;
  const propertyDetail =
    kind === "property"
      ? detail?.kind === "property"
        ? detail.detail
        : item as AdminAgencyPropertyReview
      : null;
  const projectImages = projectDetail
    ? [...new Set([
        projectDetail.coverImage,
        ...(projectDetail.media ?? []).filter((media) => media.type === "IMAGE").map((media) => media.url),
        ...(projectDetail.images ?? []),
      ].filter((image): image is string => Boolean(image)))]
    : [];
  const coverImage = projectImages[0] ?? propertyDetail?.images?.[0];
  const location = item.location;
  const hasProjectDetails = Boolean(
    projectDetail &&
      (projectDetail.description ||
        projectDetail.priceFrom !== undefined ||
        projectDetail.areaRange ||
        projectDetail.totalLots !== undefined ||
        projectDetail.location ||
        projectDetail.amenities?.length ||
        projectDetail.services?.length ||
        projectDetail.lots?.length),
  );

  async function openDetails() {
    setOpen(true);
    if (detail || loading) return;

    setError(null);
    setLoading(true);
    try {
      const result = await getAgencyPublicationDetails(kind, item.id);
      if (result.kind === "error") setError(result.message);
      else setDetail(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar el detalle.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void openDetails()}
        aria-label={`Ver detalles de ${title}`}
        title="Ver detalles"
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-card border border-edge bg-surface px-3 py-2 text-xs font-bold text-brand transition-colors hover:border-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Eye className="size-4" aria-hidden="true" />
        <span className="sm:hidden">Ver</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`agency-publication-title-${item.id}`}
            className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-y-auto rounded-card border border-edge bg-surface shadow-[var(--shadow-pop)]"
          >
            {isProperty ? (
              <div className="relative">
                {coverImage ? (
                  <ListingImage src={coverImage} className="h-52 sm:h-72" />
                ) : (
                  <div className="flex h-52 items-center justify-center border-b border-edge bg-surface-muted px-6 text-center sm:h-72">
                    <div>
                      <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Propiedad</p>
                      <p className="mt-2 font-display text-xl font-black text-brand">{title}</p>
                    </div>
                  </div>
                )}
                <span className="absolute top-3 left-3 rounded-sm bg-warning/90 px-2.5 py-1 text-[10px] font-bold uppercase text-ink">
                  Propiedad
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar detalles"
                  className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-sm bg-surface text-brand shadow-sm transition-colors hover:bg-surface-muted"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between border-b border-edge px-5 py-3 sm:px-6">
                <span className="rounded-sm bg-warning/15 px-2.5 py-1 text-[10px] font-bold uppercase text-warning">
                  Proyecto
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar detalles"
                  className="flex size-9 items-center justify-center rounded-sm border border-edge bg-surface text-brand transition-colors hover:bg-surface-muted"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            )}

            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2
                  id={`agency-publication-title-${item.id}`}
                  className="min-w-0 flex-1 font-display text-xl font-black leading-snug text-brand"
                >
                  {title}
                </h2>
                <span className="rounded-sm bg-warning/15 px-2.5 py-1 text-[10px] font-bold uppercase text-warning">
                  {item.status === "PENDING_REVIEW" ? "En revisión" : item.status ?? "En revisión"}
                </span>
              </div>

              {location ? (
                <p className="mt-2 text-sm text-muted">
                  {[location.district, location.province, location.department].filter(Boolean).join(", ")}
                </p>
              ) : null}

              {loading ? (
                <div className="mt-6 flex min-h-36 items-center justify-center text-sm font-semibold text-muted">
                  Cargando ficha completa…
                </div>
              ) : error ? (
                <p role="alert" className="mt-5 rounded-sm border border-error/30 bg-error/5 p-4 text-sm text-error">
                  {error}
                </p>
              ) : projectDetail ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]">
                    {coverImage ? (
                      <ListingImage src={coverImage} className="h-40 rounded-sm sm:h-48" />
                    ) : (
                      <div className="flex h-40 items-center justify-center rounded-sm border border-edge bg-surface-muted px-4 text-center sm:h-48">
                        <span className="font-display text-lg font-black text-brand">Proyecto</span>
                      </div>
                    )}
                    <div className="rounded-sm border border-edge bg-surface-muted/40 p-4">
                      <p className="mb-2 text-[10px] font-bold tracking-wide text-muted uppercase">
                        Descripción
                      </p>
                      {projectDetail.description ? (
                        <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
                          {projectDetail.description}
                        </p>
                      ) : (
                        <p className="text-sm text-muted">No se proporcionó una descripción.</p>
                      )}
                    </div>
                  </div>

                  {projectImages.length > 1 ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {projectImages.slice(1, 6).map((image, index) => (
                        <ListingImage
                          key={`${image}-${index}`}
                          src={image}
                          className="h-20 rounded-sm sm:h-24"
                        />
                      ))}
                    </div>
                  ) : null}

                  {!hasProjectDetails ? (
                    <p className="rounded-sm border border-warning/30 bg-warning/10 p-4 text-sm leading-relaxed text-ink">
                      La respuesta de revisión solo incluye el nombre y el estado del proyecto. El backend debe incluir la ficha completa para mostrar más detalles aquí.
                    </p>
                  ) : null}

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    <DetailValue
                      label="Precio desde"
                      value={
                        projectDetail.priceFrom !== undefined && projectDetail.currency
                          ? formatPrice(projectDetail.priceFrom, projectDetail.currency)
                          : undefined
                      }
                    />
                    {projectDetail.priceTo !== projectDetail.priceFrom ? (
                      <DetailValue
                        label="Precio hasta"
                        value={
                          projectDetail.priceTo !== undefined && projectDetail.currency
                            ? formatPrice(projectDetail.priceTo, projectDetail.currency)
                            : undefined
                        }
                      />
                    ) : null}
                    <DetailValue label="Área desde" value={projectDetail.areaRange ? formatArea(projectDetail.areaRange.min) : undefined} />
                    <DetailValue label="Área hasta" value={projectDetail.areaRange ? formatArea(projectDetail.areaRange.max) : undefined} />
                    <DetailValue label="Lotes" value={projectDetail.totalLots ?? projectDetail.lotsCount} />
                    <DetailValue label="Etapa" value={projectDetail.stage ? PROJECT_REVIEW_STAGE_LABELS[projectDetail.stage] ?? projectDetail.stage : undefined} />
                    <DetailValue label="Modalidad" value={projectDetail.lotMode ? projectDetail.lotMode === "GROUP" ? "Lotes por grupo" : "Lotes individuales" : undefined} />
                    <DetailValue label="Desarrolladora" value={projectDetail.businessName ?? projectDetail.developer} />
                    <DetailValue label="Urbanización" value={projectDetail.urbanizationName} />
                    <DetailValue label="Entrega estimada" value={projectDetail.estimatedDelivery} />
                    <DetailValue label="Inicio de obra" value={projectDetail.constructionStart} />
                    <DetailValue
                      label="Cuota inicial"
                      value={projectDetail.downPayment && projectDetail.currency ? formatPrice(projectDetail.downPayment, projectDetail.currency) : undefined}
                    />
                    <DetailValue
                      label="Cuota mensual"
                      value={projectDetail.monthlyPayment && projectDetail.currency ? formatPrice(projectDetail.monthlyPayment, projectDetail.currency) : undefined}
                    />
                    <DetailValue label="Manzanas" value={projectDetail.totalBlocks} />
                    <DetailValue label="Partida registral" value={projectDetail.registryEntry} />
                  </div>

                  {projectDetail.location ? (
                    <DetailSection title="Ubicación">
                      <p className="text-sm leading-relaxed text-ink">
                        {[
                          projectDetail.location.zone,
                          projectDetail.location.street,
                          projectDetail.location.streetNumber,
                          projectDetail.location.district,
                          projectDetail.location.province,
                          projectDetail.location.department,
                        ].filter(Boolean).join(", ")}
                      </p>
                    </DetailSection>
                  ) : null}

                  {(projectDetail.amenities?.length ?? 0) > 0 ? (
                    <TagSection title="Amenidades" values={projectDetail.amenities ?? []} />
                  ) : null}
                  {(projectDetail.services?.length ?? 0) > 0 ? (
                    <TagSection title="Servicios" values={projectDetail.services ?? []} />
                  ) : null}
                  {(projectDetail.financing?.length ?? 0) > 0 ? (
                    <TagSection title="Financiamiento" values={projectDetail.financing ?? []} />
                  ) : null}

                  {(projectDetail.lots?.length ?? 0) > 0 ? (
                    <DetailSection title={`Lotes (${projectDetail.lots?.length ?? 0})`}>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {projectDetail.lots?.map((lot) => (
                          <div key={lot.id} className="rounded-sm border border-edge p-3 text-sm">
                            <p className="font-bold text-ink">
                              Lote {lot.lotNumber}{lot.block ? ` · Manzana ${lot.block}` : ""}
                            </p>
                            <p className="mt-1 text-muted">
                              {formatArea(lot.areaM2)} · {projectDetail.currency ? formatPrice(lot.price, projectDetail.currency) : lot.price} · {lot.status}
                            </p>
                          </div>
                        ))}
                      </div>
                    </DetailSection>
                  ) : null}

                  {(projectDetail.milestones?.length ?? 0) > 0 ? (
                    <DetailSection title="Hitos del proyecto">
                      <div className="space-y-2">
                        {projectDetail.milestones?.map((milestone) => (
                          <div key={milestone.id} className="rounded-sm bg-surface-muted/70 px-3 py-2">
                            <p className="text-sm font-bold text-ink">{milestone.title}</p>
                            <p className="text-xs text-muted">
                              {milestone.date}{milestone.note ? ` · ${milestone.note}` : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    </DetailSection>
                  ) : null}
                </div>
              ) : propertyDetail ? (
                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <DetailValue label="Precio" value={propertyDetail.price ? formatPrice(propertyDetail.price.amount, propertyDetail.price.currency) : undefined} />
                    <DetailValue label="Área" value={propertyDetail.areaM2 !== undefined ? formatArea(propertyDetail.areaM2) : undefined} />
                    <DetailValue label="Tipo" value={propertyDetail.type ? PROPERTY_TYPE_LABELS[propertyDetail.type] ?? propertyDetail.type : undefined} />
                    <DetailValue label="Operación" value={propertyDetail.operation ? OPERATION_LABELS[propertyDetail.operation] ?? propertyDetail.operation : undefined} />
                    <DetailValue label="Dormitorios" value={propertyDetail.details?.bedrooms ?? propertyDetail.rooms} />
                    <DetailValue label="Baños" value={propertyDetail.details?.bathrooms ?? propertyDetail.bathrooms} />
                    <DetailValue label="Estacionamientos" value={propertyDetail.details?.parkingSpaces ?? propertyDetail.parkingSpaces} />
                    <DetailValue label="Mantenimiento" value={propertyDetail.maintenanceFee && propertyDetail.price ? formatPrice(propertyDetail.maintenanceFee, propertyDetail.price.currency) : undefined} />
                  </div>
                  {propertyDetail.description ? (
                    <DetailSection title="Descripción">
                      <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{propertyDetail.description}</p>
                    </DetailSection>
                  ) : null}
                  {(propertyDetail.amenities?.length ?? 0) > 0 ? (
                    <TagSection title="Amenidades" values={(propertyDetail.amenities ?? []).map((amenity) => amenity.name)} />
                  ) : null}
                </div>
              ) : isProperty ? (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <DetailValue
                    label="Precio"
                    value={
                      item.price
                        ? `${formatPrice(item.price.amount, item.price.currency)}${item.price.period === "mensual" ? " / mes" : ""}`
                        : undefined
                    }
                  />
                  <DetailValue label="Área" value={item.areaM2 ? formatArea(item.areaM2) : undefined} />
                  <DetailValue label="Tipo" value={item.type ? PROPERTY_TYPE_LABELS[item.type] ?? item.type : undefined} />
                  <DetailValue label="Operación" value={item.operation ? OPERATION_LABELS[item.operation] ?? item.operation : undefined} />
                  <DetailValue label="Dormitorios" value={item.rooms} />
                  <DetailValue label="Baños" value={item.bathrooms} />
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <DetailValue
                    label="Precio desde"
                    value={
                      item.priceFrom !== undefined && item.currency
                        ? formatPrice(item.priceFrom, item.currency)
                        : undefined
                    }
                  />
                  <DetailValue label="Lotes" value={item.totalLots ?? item.lotsCount} />
                  <DetailValue label="Desarrolladora" value={item.developer} />
                  <DetailValue label="Área mínima" value={item.areaRange ? formatArea(item.areaRange.min) : undefined} />
                  <DetailValue label="Etapa" value={item.stage?.replaceAll("_", " ")} />
                  <DetailValue label="Entrega estimada" value={item.estimatedDelivery} />
                </div>
              )}

            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-edge pt-4">
      <h3 className="mb-2 text-[10px] font-bold tracking-wide text-muted uppercase">{title}</h3>
      {children}
    </section>
  );
}

function TagSection({ title, values }: { title: string; values: string[] }) {
  return (
    <DetailSection title={title}>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span key={value} className="rounded-sm bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
            {value.replaceAll("_", " ")}
          </span>
        ))}
      </div>
    </DetailSection>
  );
}
