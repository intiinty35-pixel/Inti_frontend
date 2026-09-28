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
    </div>
  );
}
