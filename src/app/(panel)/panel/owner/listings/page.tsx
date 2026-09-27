import Link from "next/link";
import { Card, CardContent, Pagination } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { formatPrice } from "@/shared/lib/format";
import { getOwnerListingsPagedServer } from "@/features/listings/api/server";

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">Gestiona borradores, publicaciones y estados. {total} en total.</p>
          <h1 className="text-3xl font-light text-brand">Mis publicaciones</h1>
        </div>
        <Link
          href={ROUTES.panel.owner.newListing}
          className="flex h-10 items-center justify-center rounded-card bg-brand px-4 text-sm font-bold text-on-brand"
        >
          Publicar propiedad
        </Link>
      </div>

      {listings.length > 0 ? (
        <>
          <div className="grid gap-3">
            {listings.map((listing) => (
              <Card key={listing.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-bold text-brand">
                      {formatPrice(listing.price.amount, listing.price.currency)}
                    </p>
                    <h2 className="text-sm font-bold text-ink">{listing.title}</h2>
                    <p className="mt-1 text-xs text-muted">
                      {listing.location.district}, {listing.location.department}
                    </p>
                  </div>
                  <Link href={ROUTES.property(listing.slug)} className="text-sm font-bold text-brand">
                    Ver publicación
                  </Link>
                </CardContent>
              </Card>
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
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted">
            Tus propiedades publicadas aparecerán aquí.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
