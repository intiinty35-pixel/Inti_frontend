import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/shared/ui";
import { AreaIcon, BathIcon, BedIcon, CarIcon, HomeIcon, PinIcon } from "@/shared/ui/icons";
import { buildMetadata } from "@/shared/lib/seo";
import { formatArea, formatBathrooms, formatPrice, formatRooms } from "@/shared/lib/format";
import { getListingBySlug, getListings, ListingGrid } from "@/features/listings";
import type { PropertyDetail } from "@/features/listings";
import { PropertyPhotoGallery } from "@/features/listings/components/property-photo-gallery";
import { LeadForm, QuickQuestionForm } from "@/features/leads";

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const property = await getListingBySlug(slug);
    return buildMetadata({
      title: `${property.title} | ARIZ`,
      description: property.description,
      path: `/propiedades/${slug}`,
      image: property.images[0],
    });
  } catch {
    return buildMetadata({
      title: "Propiedad | ARIZ",
      description: "Detalle de propiedad.",
      path: `/propiedades/${slug}`,
    });
  }
}

function getDetailItems(property: PropertyDetail) {
  return [
    property.details?.totalArea ? { label: "m² tot.", value: String(property.details.totalArea), icon: AreaIcon } : null,
    property.details?.constructedArea ? { label: "m² construidos", value: String(property.details.constructedArea), icon: HomeIcon } : null,
    property.rooms ? { label: "dormitorios", value: String(property.rooms), icon: BedIcon } : null,
    property.bathrooms ? { label: "baños", value: String(property.bathrooms), icon: BathIcon } : null,
    property.details?.halfBathrooms ? { label: "medios baños", value: String(property.details.halfBathrooms), icon: BathIcon } : null,
    property.parkingSpaces ? { label: "estacionamientos", value: String(property.parkingSpaces), icon: CarIcon } : null,
  ].filter(Boolean) as Array<{ label: string; value: string; icon: typeof AreaIcon }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  let property: PropertyDetail;
  try {
    property = await getListingBySlug(slug);
  } catch {
    notFound();
  }

  const specs = [
    formatArea(property.areaM2),
    formatRooms(property.rooms),
    formatBathrooms(property.bathrooms),
    property.parkingSpaces ? `${property.parkingSpaces} estac.` : null,
  ].filter(Boolean);
  const detailItems = getDetailItems(property);
  const half = Math.ceil(property.amenities.length / 2);
  const related = await getListings({
    operation: property.operation,
    type: property.type,
    district: property.location.district,
    pageSize: 4,
  }).then((result) => result.items.filter((item) => item.id !== property.id).slice(0, 3)).catch(() => []);

  return (
    <Container className="grid flex-1 gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <main className="min-w-0">
        <PropertyPhotoGallery images={property.images} title={property.title} />

        <section className="mt-6 border-b border-edge pb-6">
          <p className="text-sm font-semibold text-muted">{specs.join(" · ")}</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand">
                {formatPrice(property.price.amount, property.price.currency)}
              </h1>
              {property.maintenanceFee ? (
                <p className="mt-1 text-sm font-semibold text-muted">
                  Mantenimiento {formatPrice(property.maintenanceFee, property.price.currency)}
                </p>
              ) : null}
              <p className="mt-2 text-base font-semibold text-ink">{property.title}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <PinIcon className="size-4 shrink-0" />
                {property.location.address ? `${property.location.address}, ` : ""}
                {property.location.district}, {property.location.department}
              </p>
            </div>
            <button className="h-11 rounded-card border border-brand px-4 text-sm font-bold text-brand">
              Avísame si baja de precio
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-card border border-edge bg-surface-muted p-6">
          <h2 className="text-xl font-bold text-ink">Mapa</h2>
          <div className="mt-4 flex h-72 items-center justify-center rounded-card border border-edge bg-surface text-sm font-semibold text-muted">
            {property.location.lat && property.location.lng
              ? "Mapa interactivo listo para conectar al proveedor"
              : "Ubicación aproximada disponible por distrito"}
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {detailItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={`${item.value}-${item.label}`} className="rounded-card border border-edge bg-surface p-4 text-center">
                <Icon className="mx-auto size-5 text-brand" />
                <p className="mt-2 text-sm font-bold text-brand">{item.value}</p>
                <p className="text-xs text-muted">{item.label}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-ink">Descripción</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">{property.description}</p>
        </section>

        <QuickQuestionForm propertyId={property.id} />

        <section className="mt-8 rounded-card border border-edge bg-surface p-5">
          <h2 className="text-xl font-bold text-ink">Características completas</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-bold text-brand">Generales</h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                {detailItems.map((item) => (
                  <li key={item.label} className="flex justify-between gap-3 border-b border-edge/70 pb-2">
                    <span>{item.label}</span>
                    <strong className="text-ink">{item.value}</strong>
                  </li>
                ))}
                {property.details?.constructionYear ? (
                  <li className="flex justify-between gap-3 border-b border-edge/70 pb-2">
                    <span>Año construido</span>
                    <strong className="text-ink">{property.details.constructionYear}</strong>
                  </li>
                ) : null}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand">Servicios</h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                {property.amenities.slice(0, half).map((amenity) => (
                  <li key={amenity.id}>{amenity.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand">Exteriores</h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                {property.amenities.slice(half).map((amenity) => (
                  <li key={amenity.id}>{amenity.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-card border border-edge bg-surface p-5">
          <h2 className="text-xl font-bold text-ink">Información del agente</h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-card bg-brand text-xl font-black text-accent">
              {property.agent.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-brand">{property.agent.name}</p>
              <p className="text-sm text-muted">{property.agent.type.replaceAll("_", " ").toLowerCase()}</p>
              {property.agent.status === "APPROVED" ? (
                <p className="mt-1 text-xs font-bold text-success">Verificado por ARIZ</p>
              ) : null}
            </div>
          </div>
          <Link href={`/agentes/${property.agent.id}`} className="mt-4 inline-flex text-sm font-bold text-brand">
            Ver perfil
          </Link>
        </section>

        <section className="mt-8 rounded-card border border-dashed border-edge bg-surface-muted p-8 text-center text-sm text-muted">
          Propiedades relacionadas aparecerán aquí según ubicación, tipo y presupuesto.
        </section>
      </main>

      <aside className="h-max rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
        <h2 className="text-lg font-bold text-ink">Contacta al anunciante</h2>
        <div className="mt-4">
          <LeadForm propertyId={property.id} compact />
        </div>
        {property.agent.whatsapp ? (
          <a
            href={`https://wa.me/${property.agent.whatsapp.replace(/\D/g, "")}`}
            className="mt-3 flex h-11 items-center justify-center rounded-card border border-brand text-sm font-bold text-brand"
            target="_blank"
            rel="noreferrer"
          >
            CONTACTAR POR WHATSAPP
          </a>
        ) : null}
      </aside>
    </Container>
  );
}
