import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/shared/ui";
import {
  AreaIcon,
  ArrowRightIcon,
  BathIcon,
  BedIcon,
  CarIcon,
  CheckIcon,
  HomeIcon,
  PinIcon,
  SparkleIcon,
  UserIcon,
  WhatsappIcon,
} from "@/shared/ui/icons";
import { buildMetadata } from "@/shared/lib/seo";
import { formatArea, formatBathrooms, formatPrice, formatRooms } from "@/shared/lib/format";
import { getListingBySlug, getListings, SimilarListingsSection } from "@/features/listings";
import type { PropertyDetail } from "@/features/listings";
import { PropertyPhotoGallery } from "@/features/listings/components/property-photo-gallery";
import { LazyPropertyLocationMap } from "@/features/listings/components/property-location-map-client";
import { LeadForm, QuickQuestionForm } from "@/features/leads";

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
  DEVELOPER: "Desarrollador",
  ARCHITECT: "Arquitecto",
};

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
  const typeLabel = TYPE_LABEL[property.type] ?? property.type;
  const operationLabel = OPERATION_LABEL[property.operation] ?? "Disponible";

  return (
    <Container size="full" className="flex flex-1 flex-col py-6 lg:py-8">
      <div className="grid flex-1 items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] xl:gap-8">
        <main className="min-w-0">
          {/* La foto va limpia: sin capa oscura ni badges encima. La operacion y
              el tipo se repiten en el resumen lateral, asi el texto no compite
              con la imagen. */}
          <PropertyPhotoGallery
            images={property.images}
            title={property.title}
            className="h-[300px] sm:h-[440px] lg:h-[520px] 2xl:h-[600px]"
          />

          {/* El titulo va fuera de la foto: sobre imagenes claras u oscuras el
              contraste cambiaba y el nombre se perdia. */}
          <header className="mt-5 lg:mt-6">
            <h1 className="title-listing">{property.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-muted lg:text-base">
              <PinIcon className="size-4 shrink-0 text-brand lg:size-5" />
              <span className="line-clamp-2">{locationLine}</span>
            </p>
          </header>


          {/* Bloque de precio + datos clave, como la barra superior del panel. */}
          <section className="mt-6 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center lg:mt-8">
            <div className="min-w-0">
              <p className="font-display text-3xl leading-none font-black tracking-tight text-brand lg:text-4xl 2xl:text-5xl">
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
              <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-muted lg:text-sm">
                {specs.map((spec) => (
                  <span key={spec} className="flex items-center gap-1.5">
                    <CheckIcon className="size-3.5 shrink-0 text-success" />
                    {spec}
                  </span>
                ))}
              </p>
            </div>

            <button
              type="button"
              className="flex h-11 items-center justify-center gap-2 rounded-card border border-edge px-5 text-sm font-bold text-brand transition-colors hover:border-brand sm:justify-self-end"
            >
              <SparkleIcon className="size-4" />
              Avísame si baja de precio
            </button>
          </section>

          {/* Ficha tecnica */}
          <section className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4 xl:grid-cols-6 2xl:grid-cols-6">
            {detailItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={`${item.value}-${item.label}`}
                  className="rounded-card border border-edge bg-surface p-4 text-center shadow-[var(--shadow-card)] lg:p-5"
                >
                  <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-brand-soft text-brand lg:size-10">
                    <Icon className="size-4 lg:size-5" />
                  </span>
                  <p className="mt-2.5 font-display text-base font-black text-brand lg:text-lg">{item.value}</p>
                  <p className="text-[11px] font-semibold text-muted">{item.label}</p>
                </div>
              );
            })}
          </section>

          <section className="mt-9">
            <h2 className="font-display text-xl font-black tracking-tight text-brand lg:text-2xl">Descripción</h2>
            <p className="mt-3 max-w-5xl text-sm leading-7 whitespace-pre-line text-muted lg:text-[15px] lg:leading-8">
              {property.description}
            </p>
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

          <QuickQuestionForm propertyId={property.id} />

          {/* Ubicacion: mapa real con las coordenadas guardadas por el wizard. */}
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
                  href={`https://www.openstreetmap.org/?mlat=${property.location.lat}&mlon=${property.location.lng}#map=17/${property.location.lat}/${property.location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 items-center gap-2 rounded-card border border-edge px-4 text-xs font-bold text-brand transition-colors hover:border-brand"
                >
                  Abrir en el mapa
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


          {/* Informacion del agente */}
          <section className="mt-9 rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-card bg-brand font-display text-xl font-black text-accent">
                {property.agent.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-black text-brand">{property.agent.name}</p>
                <p className="text-sm text-muted">
                  {AGENT_TYPE_LABEL[property.agent.type] ?? property.agent.type.replaceAll("_", " ").toLowerCase()}
                </p>
                {property.agent.status === "APPROVED" ? (
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-success">
                    <CheckIcon className="size-3.5" />
                    Verificado por ARIZ
                  </p>
                ) : null}
              </div>
              <Link
                href={`/agentes/${property.agent.id}`}
                className="flex h-11 items-center justify-center gap-2 rounded-card border border-edge px-4 text-sm font-bold text-brand transition-colors hover:border-brand"
              >
                <UserIcon className="size-4" />
                Ver perfil
              </Link>
            </div>
          </section>

          {candidates.length > 0 ? (
            <SimilarListingsSection property={property} candidates={candidates} limit={5} />
          ) : null}
        </main>

        {/* El grid padre usa `items-start`, asi el aside conserva su altura natural
            y `sticky` mantiene recorrido mientras baja el contenido largo. */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-20">
          <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
            <div className="h-1.5 bg-brand" aria-hidden />
            <div className="border-b border-edge bg-brand-soft px-5 py-5">
              <p className="text-[11px] font-black tracking-[0.2em] text-accent uppercase">Contacto directo</p>
              <h2 className="mt-1 font-display text-lg leading-tight font-black tracking-tight text-brand xl:text-xl">
                Consulta por esta propiedad
              </h2>
              <p className="mt-1.5 text-xs text-muted">Respuesta promedio en menos de 24 horas.</p>
            </div>
            <div className="p-5 xl:p-6">

              {whatsappDigits ? (
                <a
                  href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hola, vi "${property.title}" en ARIZ y quisiera más información.`)}`}
                  className="flex h-12 items-center justify-center gap-2.5 rounded-card bg-[var(--wa)] text-sm font-black tracking-[0.06em] text-white uppercase shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--wa-hover)]"
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsappIcon className="size-5 shrink-0" />
                  WhatsApp
                </a>
              ) : (
                <p className="rounded-card border border-edge bg-surface-muted p-3 text-xs text-muted">
                  El anunciante aún no registró un número de WhatsApp.
                </p>
              )}

              <div className="mt-5 border-t border-edge pt-5">
                <LeadForm propertyId={property.id} compact />
              </div>
            </div>
          </div>

          {/* Resumen rapido: lo primero que revisa un comprador. */}
          <div className="rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] xl:p-6">
            <h2 className="text-[11px] font-black tracking-[0.2em] text-accent uppercase">Resumen</h2>
            <dl className="mt-3.5 grid gap-2.5 text-sm">
              <div className="flex items-center justify-between gap-3 border-b border-edge/70 pb-2">
                <dt className="text-muted">Operación</dt>
                <dd className="font-bold text-ink">{operationLabel}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-edge/70 pb-2">
                <dt className="text-muted">Tipo</dt>
                <dd className="font-bold text-ink">{typeLabel}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-edge/70 pb-2">
                <dt className="text-muted">Área</dt>
                <dd className="font-bold text-ink">{formatArea(property.areaM2) || "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-edge/70 pb-2">
                <dt className="text-muted">Dormitorios</dt>
                <dd className="font-bold text-ink">{property.rooms || "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Baños</dt>
                <dd className="font-bold text-ink">{property.bathrooms || "—"}</dd>
              </div>
            </dl>

            <Link
              href={`/agentes/${property.agent.id}`}
              className="mt-4 flex items-center gap-3 rounded-card border border-edge p-3 transition-colors hover:border-brand"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-card bg-brand font-display text-sm font-black text-accent">
                {property.agent.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-brand">{property.agent.name}</span>
                <span className="block truncate text-xs text-muted">
                  {AGENT_TYPE_LABEL[property.agent.type] ?? "Agente inmobiliario"}
                </span>
              </span>
            </Link>
          </div>
        </aside>
      </div>
    </Container>
  );
}

