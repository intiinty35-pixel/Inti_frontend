<<<<<<< HEAD
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
=======
import Link from "next/link";
import { PlusIcon, SparkleIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { getOwnerListingsPagedServer } from "@/features/listings/api/server";
import { OwnerListingCard } from "@/features/listings/components/owner-listing-card";
import { Pagination } from "@/shared/ui/pagination";

export default async function PanelOwnerListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { items: listings, total, pageSize } = await getOwnerListingsPagedServer(page);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-black tracking-[0.2em] text-accent uppercase">
              Portfolio
            </p>
            <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-brand sm:text-4xl">
              Mis publicaciones
            </h1>
            <p className="mt-2 text-sm font-medium text-muted">
              {total > 0
                ? `Gestionas ${total} ${total === 1 ? "propiedad" : "propiedades"}. Actualiza precios, revisa el rendimiento y publica nuevos anuncios.`
                : "Publica tu primera propiedad y empieza a recibir contactos."}
            </p>
          </div>
          <Link
            href={ROUTES.panel.owner.newListing}
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            <PlusIcon className="size-4" />
            Publicar propiedad
          </Link>
        </div>
      </div>

      {listings.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <OwnerListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            buildHref={(p) => `${ROUTES.panel.owner.listings}?page=${p}`}
          />
        </>
      ) : (
        <div className="rounded-card border border-dashed border-edge bg-surface p-10 text-center shadow-[var(--shadow-card)]">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
            <SparkleIcon className="size-6" />
          </span>
          <p className="mt-4 font-display text-xl font-black text-brand">
            Aún no tienes propiedades publicadas
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Completa el asistente de publicación con fotos, ubicación exacta y detalles del
            inmueble. Tus anuncios aparecerán aquí para gestionarlos.
          </p>
          <Link
            href={ROUTES.panel.owner.newListing}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            <PlusIcon className="size-4" />
            Publicar mi primera propiedad
          </Link>
        </div>
      )}
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
    </div>
  );
}
