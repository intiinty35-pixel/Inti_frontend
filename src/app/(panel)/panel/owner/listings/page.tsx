import Link from "next/link";
import { Card, CardContent } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { formatPrice } from "@/shared/lib/format";
import { getOwnerListingsServer } from "@/features/listings/api/server";

export default async function PanelOwnerListingsPage() {
  const listings = await getOwnerListingsServer();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">Gestiona borradores, publicaciones y estados.</p>
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
