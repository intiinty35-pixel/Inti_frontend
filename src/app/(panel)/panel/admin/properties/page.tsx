import Link from "next/link";
import { Home, Plus } from "lucide-react";
import { Pagination } from "@/shared/ui/pagination";
import { ROUTES } from "@/shared/config/routes";
import { getAdminPropertiesPagedServer } from "@/features/listings/api/server";
import { OwnerListingCard } from "@/features/listings/components/owner-listing-card";

const PAGE_SIZE = 6;

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Number(pageParam);
  let page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  let data = await getAdminPropertiesPagedServer(page, PAGE_SIZE);
  const lastPage = Math.max(1, Math.ceil(data.total / data.pageSize));

  if (page > lastPage) {
    page = lastPage;
    data = await getAdminPropertiesPagedServer(page, PAGE_SIZE);
  }

  const { items, total, pageSize } = data;

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-6 overflow-x-hidden">
      <section className="rounded-card border border-edge bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Publicaciones de INTI
            </p>
            <h1 className="mt-1 font-display text-2xl font-black text-brand sm:text-3xl">
              Publicar propiedades INTI
            </h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-5 text-muted">
              {total} {total === 1 ? "propiedad publicada" : "propiedades publicadas"} por INTI. Se publican
              sin pago ni membresía.
            </p>
          </div>
          <Link
            href={ROUTES.panel.admin.newProperty}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-card bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            <Plus className="size-4" />
            Publicar propiedad
          </Link>
        </div>
      </section>

      {items.length > 0 ? (
        <>
          <div className="grid min-w-0 max-w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((listing) => (
              <OwnerListingCard
                key={listing.id}
                listing={listing}
                showMetrics={false}
                editHref={ROUTES.panel.admin.editProperty(listing.id)}
              />
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            buildHref={(next) => `${ROUTES.panel.admin.properties}?page=${next}`}
          />
        </>
      ) : (
        <div className="rounded-card border border-dashed border-edge bg-surface p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex size-11 items-center justify-center rounded-card bg-brand/10 text-brand">
            <Home className="size-5" />
          </div>
          <p className="mt-4 font-display text-xl font-black text-brand">Aún no hay propiedades de INTI</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Publica una propiedad desde aquí. Es libre: no consume membresía ni límite de plan.
          </p>
          <Link
            href={ROUTES.panel.admin.newProperty}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            <Plus className="size-4" />
            Publicar propiedad INTI
          </Link>
        </div>
      )}
    </div>
  );
}
