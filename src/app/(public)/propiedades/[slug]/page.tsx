import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Container } from "@/shared/ui";
import {
  AreaIcon,
  ArrowRightIcon,
  BathIcon,
  BedIcon,
  CarIcon,
  CheckIcon,
  ClockIcon,
  HomeIcon,
  PinIcon,
} from "@/shared/ui/icons";
import { buildMetadata } from "@/shared/lib/seo";
import { formatPrice } from "@/shared/lib/format";
import { formatPublishedDate } from "@/shared/lib/published-date";
import { getListingBySlug, getListings, SimilarListingsSection } from "@/features/listings";
import type { PropertyDetail } from "@/features/listings";
import { PropertyPhotoGallery } from "@/features/listings/components/property-photo-gallery";
import { ExpandableText } from "@/features/listings/components/expandable-text";
import { PriceAlertButton } from "@/features/listings/components/price-alert-button";
import { buildGoogleMapsUrl } from "@/shared/lib/maps-link";
import { LazyPropertyLocationMap } from "@/features/listings/components/property-location-map-client";
import { LeadForm } from "@/features/leads";
import { QuickQuestions } from "@/features/listings/components/Quickquestions";
import { FavoriteButton } from "@/features/favorites";
import { SharePropertyButton } from "@/features/listings/components/share-property-button";

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

const OPERATION_LABEL: Record<string, string> = {
  buy: "En venta",
  rent: "En alquiler",
  invest: "Inversión",
};

const TYPE_LABEL: Record<string, string> = {
  houses: "Casa",
  apartments: "Departamento",
  land: "Terreno",
  commercial: "Local comercial",
  projects: "Proyecto",
  "country-lots": "Lote de campo",
};

const CONSERVATION_LABEL: Record<string, string> = {
  NEW: "A estrenar",
  EXCELLENT: "Excelente estado",
  GOOD: "Buen estado",
  REMODELED: "Remodelado",
  TO_REMODEL: "Para remodelar",
  UNDER_CONSTRUCTION: "En construcción",
};

const AGENT_TYPE_LABEL: Record<string, string> = {
  REAL_ESTATE: "Inmobiliaria",
  AGENT: "Agente inmobiliario",
  INDEPENDENT: "Agente independiente",
  INDIVIDUAL_OWNER: "Propietario particular",
  DEVELOPER: "Desarrollador",
  ARCHITECT: "Arquitecto",
};

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const property = await getListingBySlug(slug);
    return buildMetadata({
      title: `${property.title} | INTI`,
      description: property.description,
      path: `/propiedades/${slug}`,
      image: property.images[0],
    });
  } catch {
    return buildMetadata({
      title: "Propiedad | INTI",
      description: "Detalle de propiedad.",
      path: `/propiedades/${slug}`,
    });
  }
}

interface DetailItem {
  label: string; // etiqueta completa (Caracteristicas completas)
  short: string; // etiqueta corta (franja de iconos)
  value: string;
  icon: typeof AreaIcon;
}

function getDetailItems(property: PropertyDetail): DetailItem[] {
  const halfBaths = property.details?.halfBathrooms;
  const items: Array<DetailItem | null> = [
    property.details?.totalArea
      ? { label: "m² tot.", short: "m² tot.", value: String(property.details.totalArea), icon: AreaIcon }
      : null,
    property.details?.constructedArea
      ? { label: "m² construidos", short: "m² const.", value: String(property.details.constructedArea), icon: HomeIcon }
      : null,
    property.rooms
      ? { label: "dormitorios", short: "dorm.", value: String(property.rooms), icon: BedIcon }
      : null,
    property.bathrooms
      ? { label: "baños", short: property.bathrooms === 1 ? "baño" : "baños", value: String(property.bathrooms), icon: BathIcon }
      : null,
    halfBaths
      ? {
          label: "medios baños",
          short: halfBaths === 1 ? "medio baño" : "medios baños",
          value: String(halfBaths),
          icon: BathIcon,
        }
      : null,
    property.parkingSpaces
      ? { label: "estacionamientos", short: "estac.", value: String(property.parkingSpaces), icon: CarIcon }
      : null,
  ];
  return items.filter(Boolean) as DetailItem[];
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  let property: PropertyDetail;
  try {
    property = await getListingBySlug(slug);
  } catch {
    notFound();
  }

  const detailItems = getDetailItems(property);

  /* Franja de iconos: los mismos datos + antiguedad calculada desde el año. */
  const constructionYear = Number(property.details?.constructionYear);
  const age = Number.isFinite(constructionYear) && constructionYear > 1800
    ? Math.max(0, new Date().getFullYear() - constructionYear)
    : null;
  const stripItems: Array<{ key: string; text: string; icon: typeof AreaIcon | typeof CalendarDays }> = [
    ...detailItems.map((item) => ({
      key: `${item.value}-${item.label}`,
      text: `${item.value} ${item.short}`,
      icon: item.icon,
    })),
    ...(age !== null
      ? [{ key: "age", text: age === 0 ? "A estrenar" : `${age} ${age === 1 ? "año" : "años"}`, icon: CalendarDays }]
      : []),
  ];

  const half = Math.ceil(property.amenities.length / 2);
  const caretaker = property.amenities.slice(0, half);
  const outdoors = property.amenities.slice(half);
  /* Pool amplio para el algoritmo: descarta la actual y ordena por afinidad
     (precio, zona y caracteristicas) sin pedir solo del mismo distrito. */
  const candidates = await getListings({
    operation: property.operation,
    type: property.type,
    pageSize: 24,
  }).then((result) => result.items.filter((item) => item.id !== property.id)).catch(() => []);

  const hasCoords = Number.isFinite(property.location.lat) && Number.isFinite(property.location.lng);
  const locationLine = [
    property.location.address,
    property.location.district,
    property.location.province,
    property.location.department,
  ].filter(Boolean).join(", ");
  const whatsappDigits = property.agent.whatsapp?.replace(/\D/g, "");
  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hola, vi "${property.title}" en INTI y quisiera más información.`)}`
    : undefined;
  const operationLabel = OPERATION_LABEL[property.operation] ?? "Disponible";
  const operationPhrase = property.operation === "rent" ? "en alquiler" : property.operation === "buy" ? "en venta" : "disponible";
  const agentTypeLabel =
    AGENT_TYPE_LABEL[String(property.agent.type).toUpperCase()] ?? "Agente inmobiliario";
  const published = formatPublishedDate(property.publishedAt);

  return (
    <Container size="wide" className="flex w-full flex-1 flex-col overflow-x-hidden py-6 lg:py-8">
      <div className="flex w-full max-w-full flex-1 flex-col gap-4 overflow-hidden sm:gap-6 lg:flex-row lg:gap-8">
        <main className="w-full min-w-0 max-w-full flex-1 overflow-hidden lg:max-w-[70%]">
          <PropertyPhotoGallery
            images={property.images}
            title={property.title}
            className="h-[300px] w-full sm:h-[440px] lg:h-[520px] 2xl:h-[600px]"
          />

          <header className="mt-5 flex w-full flex-col items-start justify-between gap-3 overflow-hidden lg:mt-6 lg:flex-row">
            <div className="w-full min-w-0">
              <h1 className="title-listing break-words">{property.title}</h1>
              <p className="mt-2 flex w-full items-center gap-2 text-sm font-semibold text-muted lg:text-base">
                <PinIcon className="size-4 shrink-0 text-brand lg:size-5" />
                <span className="line-clamp-2 break-all">{locationLine}</span>
              </p>
              {published ? (
                <time dateTime={published.iso} className="mt-2 flex items-center gap-2 text-sm font-semibold text-muted">
                  <ClockIcon className="size-4 shrink-0 text-brand" />
                  {published.fullWithPrefix}
                </time>
              ) : null}
            </div>
            <SharePropertyButton
              title={property.title}
              latitude={property.location.lat}
              longitude={property.location.lng}
              address={property.location.address}
            />
          </header>

          {/* Precio + datos clave */}
          <section className="mt-6 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center lg:mt-8">
            <div className="min-w-0">
              <p className="font-display text-2xl leading-none font-black tracking-tight text-brand lg:text-3xl">
                {formatPrice(property.price.amount, property.price.currency)}
                {property.price.period === "mensual" ? (
                  <span className="ml-1.5 text-sm font-semibold text-muted">/ mes</span>
                ) : null}
              </p>
              {property.maintenanceFee ? (
                <p className="mt-2 text-sm font-semibold text-muted">
                  Mantenimiento {formatPrice(property.maintenanceFee, property.price.currency)} / mes
                </p>
              ) : null}
            </div>

            <PriceAlertButton propertyId={property.id} />
          </section>

          {/* Ficha tecnica: iconos libres entre dos lineas, sin cards. */}
          {stripItems.length > 0 ? (
            <section className="mt-8 border-y border-edge py-8">
              <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
                {stripItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.key} className="flex flex-col items-center gap-3 text-center">
                      <Icon className="size-7 text-ink" />
                      <span className="text-sm font-semibold text-ink">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <section className="mt-9">
            <h2 className="font-display text-xl font-black tracking-tight text-brand lg:text-2xl">Descripción</h2>
            <ExpandableText
              text={property.description}
              lines={4}
              maxWords={100}
              className="mt-3 max-w-5xl text-sm leading-7 whitespace-pre-line text-muted lg:text-[15px] lg:leading-8"
            />
          </section>

          {detailItems.length > 0 || property.amenities.length > 0 || property.details?.constructionYear ? (
            <section className="mt-9 rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
              <h2 className="font-display text-xl font-black tracking-tight text-brand lg:text-2xl">Características completas</h2>
              <div className="mt-6 grid gap-8 md:grid-cols-3">
                <div>
                  <h3 className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">Generales</h3>
                  <ul className="mt-3 grid gap-2 text-sm">
                    {detailItems.map((item) => (
                      <li key={item.label} className="flex justify-between gap-3 border-b border-edge/70 pb-2">
                        <span className="capitalize text-muted">{item.label}</span>
                        <strong className="text-ink">{item.value}</strong>
                      </li>
                    ))}
                    {property.details?.constructionYear ? (
                      <li className="flex justify-between gap-3 border-b border-edge/70 pb-2">
                        <span className="text-muted">Año construido</span>
                        <strong className="text-ink">{property.details.constructionYear}</strong>
                      </li>
                    ) : null}
                    {property.details?.conservationStatus ? (
                      <li className="flex justify-between gap-3 border-b border-edge/70 pb-2">
                        <span className="text-muted">Estado</span>
                        <strong className="text-ink">
                          {CONSERVATION_LABEL[property.details.conservationStatus] ?? property.details.conservationStatus}
                        </strong>
                      </li>
                    ) : null}
                  </ul>
                </div>

                <div>
                  <h3 className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">Servicios</h3>
                  <ul className="mt-3 grid gap-2 text-sm text-muted">
                    {caretaker.length > 0 ? (
                      caretaker.map((amenity) => (
                        <li key={amenity.id} className="flex items-start gap-2">
                          <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" />
                          {amenity.name}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs">Sin servicios registrados.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">Exteriores</h3>
                  <ul className="mt-3 grid gap-2 text-sm text-muted">
                    {outdoors.length > 0 ? (
                      outdoors.map((amenity) => (
                        <li key={amenity.id} className="flex items-start gap-2">
                          <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" />
                          {amenity.name}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs">Sin exteriores registrados.</li>
                    )}
                  </ul>
                </div>
              </div>
            </section>
          ) : null}

          {/* Ubicacion */}
          <section className="mt-9 overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge p-5 sm:px-7 sm:py-5">
              <div className="min-w-0">
                <h2 className="font-display text-xl font-black tracking-tight text-brand lg:text-2xl">Ubicación</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <PinIcon className="size-4 shrink-0" />
                  <span className="line-clamp-1">{locationLine}</span>
                </p>
              </div>
              {hasCoords ? (
                <a
                  href={buildGoogleMapsUrl(property.location.lat as number, property.location.lng as number)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 items-center gap-2 rounded-card border border-edge px-4 text-xs font-bold text-brand transition-colors hover:border-brand"
                >
                  Abrir en Google Maps
                  <ArrowRightIcon className="size-3.5" />
                </a>
              ) : null}
            </div>

            <div className="p-5 sm:p-7">
              {hasCoords ? (
                <LazyPropertyLocationMap
                  latitude={property.location.lat as number}
                  longitude={property.location.lng as number}
                  label={property.title}
                  zoom={property.location.address ? 17 : 15}
                  className="h-80 w-full sm:h-[420px] lg:h-[480px]"
                />
              ) : (
                <div className="flex h-60 flex-col items-center justify-center gap-2 rounded-card border border-dashed border-edge bg-surface-muted text-sm font-semibold text-muted lg:h-80">
                  <PinIcon className="size-6 text-brand" />
                  Ubicación aproximada disponible por distrito
                </div>
              )}

              {!property.location.address ? (
                <p className="mt-3 text-xs text-muted">
                  El anunciante prefirió mostrar una ubicación aproximada. Coordina una visita para ver la dirección exacta.
                </p>
              ) : null}
            </div>
          </section>

          {/* Preguntas rapidas: al final, despues del mapa. Abren un modal que
              lleva al WhatsApp del anunciante. */}
          <QuickQuestions
            propertyTitle={property.title}
            agentName={property.agent.name}
            whatsappDigits={whatsappDigits}
          />
        </main>

        {/* Columna lateral: formulario de contacto + tarjeta del anunciante. */}
        <aside id="contacto" className="flex w-full min-w-0 flex-col gap-4 lg:w-[30%] lg:sticky lg:top-20">
          <div className="rounded-2xl border border-edge bg-surface p-5 xl:p-6">
            <h2 className="text-base font-bold text-ink xl:text-lg">Contacta al anunciante</h2>
            <LeadForm
              propertyId={property.id}
              compact
              whatsappUrl={whatsappUrl}
              defaultMessage={`¡Hola! Quiero que se comuniquen conmigo por este inmueble ${operationPhrase} que vi en INTI.`}
            />
          </div>

          <Link
            href={`/agentes/${property.agent.id}`}
            aria-label={`Ver perfil de ${property.agent.name} (${operationLabel})`}
            className="flex items-center gap-4 rounded-2xl border border-edge bg-surface p-5 transition-colors hover:border-brand"
          >
            <span className="flex h-14 w-24 shrink-0 items-center justify-center rounded-md bg-brand font-display text-2xl font-black text-accent">
              {property.agent.name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-ink uppercase">{property.agent.name}</span>
              <span className="block truncate text-xs text-muted">{agentTypeLabel}</span>
              {property.agent.status === "APPROVED" ? (
                <span className="mt-1 flex items-center gap-1 text-xs font-bold text-success">
                  <CheckIcon className="size-3.5" />
                  Verificado por INTI
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-sm font-bold text-ink">Ver perfil</span>
          </Link>
        </aside>
      </div>

      {/* Similares a ancho completo: queda debajo del formulario y del perfil del
          anunciante, no dentro de la columna de contenido. Al hacer scroll, la
          columna lateral ya termino y las 5 tarjetas se ven en una sola fila. */}
      {candidates.length > 0 ? (
        <SimilarListingsSection
          property={property}
          candidates={candidates}
          limit={5}
          favoriteAction={(listing) => (
            <FavoriteButton propertyId={listing.id} title={listing.title} />
          )}
        />
      ) : null}
    </Container>
  );
}
