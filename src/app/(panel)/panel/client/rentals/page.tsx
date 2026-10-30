import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, CalendarDays, Plus } from "lucide-react";
import { Card, CardContent } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { getOwnerListingsServer } from "@/features/listings/api/server";
import { OwnerListingCard } from "@/features/listings/components/owner-listing-card";

export default async function PanelClientRentalsPage() {
  const listings = await getOwnerListingsServer();
  const rentals = listings.filter((listing) => listing.operation === "rent");
  const published = rentals.filter((listing) => listing.status === "disponible").length;
  const paused = rentals.filter((listing) => listing.status === "reservado").length;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="relative overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden />
        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand sm:size-14">
              <Building2 className="size-6 sm:size-7" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
                Gestión de propiedades
              </p>
              <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-brand sm:text-4xl">
                Mis alquileres
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Consulta y administra las propiedades que ofreces en alquiler. Revisa el estado de
                cada anuncio y abre su ficha pública desde aquí.
              </p>
            </div>
          </div>
          <Link
            href={ROUTES.panel.client.newProperty}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            <Plus className="size-4" aria-hidden />
            Publicar alquiler
          </Link>
        </div>
      </header>

      <section aria-label="Resumen de alquileres" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative flex flex-col items-center overflow-hidden rounded-card border border-edge bg-surface px-5 py-4 text-center shadow-[var(--shadow-card)]">
          <span className="absolute inset-x-0 top-0 h-1 bg-accent" aria-hidden />
          <p className="text-[11px] font-black tracking-wide text-muted uppercase">Total de alquileres</p>
          <p className="mt-2 font-display text-3xl font-black text-brand">{rentals.length}</p>
          <p className="mt-1 text-xs text-muted">Anuncios que has creado</p>
        </div>
        <div className="relative flex flex-col items-center overflow-hidden rounded-card border border-edge bg-surface px-5 py-4 text-center shadow-[var(--shadow-card)]">
          <span className="absolute inset-x-0 top-0 h-1 bg-success" aria-hidden />
          <p className="text-[11px] font-black tracking-wide text-muted uppercase">Publicados</p>
          <p className="mt-2 font-display text-3xl font-black text-success">{published}</p>
          <p className="mt-1 text-xs text-muted">Visibles en INTI</p>
        </div>
        <div className="relative flex flex-col items-center overflow-hidden rounded-card border border-edge bg-surface px-5 py-4 text-center shadow-[var(--shadow-card)]">
          <span className="absolute inset-x-0 top-0 h-1 bg-warning" aria-hidden />
          <p className="text-[11px] font-black tracking-wide text-muted uppercase">Pausados</p>
          <p className="mt-2 font-display text-3xl font-black text-warning">{paused}</p>
          <p className="mt-1 text-xs text-muted">No visibles temporalmente</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">Tus anuncios</p>
            <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-brand">
              Propiedades en alquiler
            </h2>
          </div>
          {rentals.length > 0 ? (
            <p className="text-sm font-semibold text-muted">
              {rentals.length} {rentals.length === 1 ? "propiedad" : "propiedades"}
            </p>
          ) : null}
        </div>

        {rentals.length ? (
          <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
            {rentals.map((listing) => (
              <OwnerListingCard key={listing.id} listing={listing} showMetrics={false} />
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="h-1.5 bg-accent" aria-hidden />
            <CardContent className="grid justify-items-center gap-5 px-5 py-10 text-center sm:px-10 sm:py-14">
              <span className="relative flex size-20 items-center justify-center rounded-3xl bg-brand-soft text-brand">
                <Building2 className="size-9" aria-hidden />
                <span className="absolute -right-2 -bottom-2 flex size-9 items-center justify-center rounded-full border-4 border-surface bg-accent text-brand">
                  <CalendarDays className="size-4" aria-hidden />
                </span>
              </span>
              <div className="max-w-xl">
                <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
                  Empieza a recibir consultas
                </p>
                <h3 className="mt-2 font-display text-2xl font-black tracking-tight text-brand sm:text-3xl">
                  Todavía no tienes propiedades en alquiler
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Publica una propiedad y aparecerá aquí para que puedas revisar su estado y
                  compartirla con posibles inquilinos.
                </p>
              </div>

              <div className="grid w-full max-w-2xl gap-3 text-left sm:grid-cols-3">
                <div className="rounded-card border border-edge bg-canvas p-4">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-success/10 text-success">
                    <BadgeCheck className="size-4" aria-hidden />
                  </span>
                  <p className="mt-3 text-sm font-bold text-ink">Completa los datos</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Agrega precio, ubicación y fotos del inmueble.
                  </p>
                </div>
                <div className="rounded-card border border-edge bg-canvas p-4">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <Building2 className="size-4" aria-hidden />
                  </span>
                  <p className="mt-3 text-sm font-bold text-ink">Elige “Alquilar”</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Así el anuncio aparecerá en tus alquileres.
                  </p>
                </div>
                <div className="rounded-card border border-edge bg-canvas p-4">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-accent/20 text-brand">
                    <ArrowRight className="size-4" aria-hidden />
                  </span>
                  <p className="mt-3 text-sm font-bold text-ink">Administra tu aviso</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Consulta su estado desde esta pantalla.
                  </p>
                </div>
              </div>

              <Link
                href={ROUTES.panel.client.newProperty}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
              >
                <Plus className="size-4" aria-hidden />
                Publicar una propiedad en alquiler
              </Link>
              <p className="text-xs text-muted">
                Tu primera publicación tiene 30 días gratis, según las condiciones de tu cuenta.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
