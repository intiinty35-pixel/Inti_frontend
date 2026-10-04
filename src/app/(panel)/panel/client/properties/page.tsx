import Link from "next/link";
import { PlusIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { getOwnerListingsServer } from "@/features/listings/api/server";
import { OwnerListingCard } from "@/features/listings/components/owner-listing-card";

export default async function PanelClientPropertiesPage() {
  const listings = await getOwnerListingsServer();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-light text-brand">Mis propiedades</h1>
          <p className="mt-2 text-sm text-muted">
            Administra tus anuncios de venta y alquiler.
          </p>
        </div>
        <Link
          href={ROUTES.panel.client.newProperty}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-bold text-on-brand hover:bg-brand-hover"
        >
          <PlusIcon className="size-4" />
          Publicar propiedad
        </Link>
      </header>
      {listings.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <OwnerListingCard key={listing.id} listing={listing} showMetrics={false} />
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-edge bg-surface p-8 text-center">
          <p className="font-semibold text-brand">Todavía no tienes propiedades publicadas</p>
          <p className="mt-2 text-sm text-muted">
            Tu primer anuncio se publica gratis durante 30 días.
          </p>
          <Link
            href={ROUTES.panel.client.newProperty}
            className="mt-5 inline-flex h-10 items-center rounded-card bg-brand px-4 text-sm font-bold text-on-brand"
          >
            Publicar mi primera propiedad
          </Link>
        </div>
      )}
    </div>
  );
}
