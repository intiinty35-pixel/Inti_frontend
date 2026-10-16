"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LoaderCircle,
  MapPin,
  RotateCcw,
  Search,
  Share2,
  SlidersHorizontal,
} from "lucide-react";
import { formatPrice } from "@/shared/lib/format";
import { formatPublishedDate } from "@/shared/lib/published-date";
import { ROUTES } from "@/shared/config/routes";
import { WhatsappIcon } from "@/shared/ui/icons";
import { SearchCombobox, type ComboboxOption } from "@/shared/ui/combobox";
import {
  PERU_DEPARTMENTS,
  buildProvinceOptions,
  buildDistrictOptions,
} from "@/shared/data/peru-locations";
import { searchMapPlace } from "@/shared/lib/geo";
import { ListingImage } from "@/features/listings/components/listing-image";
import type { Listing } from "@/features/listings/types/listing";
import type { MapPoint } from "@/features/listings/components/listings-map";

const PAGE_SIZE = 10;

/** Los proyectos del mapa abren su propia ficha, no la de una propiedad. */
function listingHref(listing: Listing): string {
  return listing.type === "projects" ? ROUTES.project(listing.slug) : ROUTES.property(listing.slug);
}
const MAP_DEFAULT_CENTER: [number, number] = [-12.046374, -77.042793];

const ListingsMap = dynamic<{
  points: readonly MapPoint[];
  center?: [number, number];
  className?: string;
  activeId?: string | null;
  onSelect?: (id: string) => void;
}>(
  () =>
    import("@/features/listings/components/listings-map").then(
      (module) => module.ListingsMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[360px] animate-pulse bg-surface-muted" />
    ),
  },
);

function normalizeLocation(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("es");
}

function whatsappLink(phone: string | null | undefined, title: string): string | undefined {
  const digits = phone?.replace(/\D/g, "");
  if (!digits) return undefined;
  const internationalPhone = digits.startsWith("51") ? digits : `51${digits}`;
  const message = `Hola, estoy interesado(a) en la propiedad "${title}" que vi en ARIZ.`;
  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
}

function LocationFilter({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  options: readonly ComboboxOption[];
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="min-w-0 flex-1">
      <SearchCombobox
        label={label}
        value={value}
        options={options}
        onValueChange={(option) => onChange(option.value)}
        placeholder={placeholder}
        emptyLabel="No hay coincidencias"
        disabled={disabled}
      />
    </div>
  );
}

export function MapPageExplorer({
  listings,
  loadError = false,
}: {
  listings: Listing[];
  loadError?: boolean;
}) {
  const [department, setDepartment] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(MAP_DEFAULT_CENTER);
  const [locatingRegion, setLocatingRegion] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const departmentOptions = useMemo<readonly ComboboxOption[]>(
    () => PERU_DEPARTMENTS.map((value) => ({ value, label: value })),
    [],
  );
  const provinceOptions = useMemo(
    () => buildProvinceOptions(department),
    [department],
  );
  const districtOptions = useMemo(
    () => buildDistrictOptions(department, province),
    [department, province],
  );
  const filteredListings = useMemo(
    () =>
      listings.filter(
        (listing) =>
          (!department || normalizeLocation(listing.location.department) === normalizeLocation(department)) &&
          (!province || normalizeLocation(listing.location.province) === normalizeLocation(province)) &&
          (!district || normalizeLocation(listing.location.district) === normalizeLocation(district)),
      ),
    [department, district, listings, province],
  );
  const pageCount = Math.max(1, Math.ceil(filteredListings.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleListings = filteredListings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const mapPoints = useMemo(
    () =>
      filteredListings.flatMap((listing): MapPoint[] => {
        const { lat, lng } = listing.location;
        if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
          return [];
        }

        const contactWhatsapp = whatsappLink(listing.contactWhatsapp, listing.title);
        return [
          {
            id: listing.id,
            lat,
            lng,
            href: listingHref(listing),
            priceLabel: `${formatPrice(listing.price.amount, listing.price.currency)}${
              listing.price.period === "mensual" ? " / mes" : ""
            }`,
            title: listing.title,
            districtLabel: [
              listing.location.district,
              listing.location.province,
              listing.location.department,
            ]
              .filter(Boolean)
              .join(", "),
            coverImage: listing.images[0],
            whatsappUrl: contactWhatsapp,
            badge: listing.operation === "rent" ? "ALQUILER" : "VENTA",
            publishedAt: listing.publishedAt,
          },
        ];
      }),
    [filteredListings],
  );
  const hasFilters = Boolean(department || province || district);

  useEffect(() => {
    const selectedRegion = [district, province, department].filter(Boolean);
    if (selectedRegion.length === 0) {
      return;
    }

    const controller = new AbortController();
    void searchMapPlace(selectedRegion, { signal: controller.signal })
      .then((place) => {
        if (place) setMapCenter([place.latitude, place.longitude]);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("No se pudo ubicar la región seleccionada en el mapa.", error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLocatingRegion(false);
      });

    return () => controller.abort();
  }, [department, district, province]);

  function changeDepartment(value: string) {
    setDepartment(value);
    setProvince("");
    setDistrict("");
    setPage(1);
    setActiveId(null);
    setLocatingRegion(Boolean(value));
  }

  function changeProvince(value: string) {
    setProvince(value);
    setDistrict("");
    setPage(1);
    setActiveId(null);
    setLocatingRegion(Boolean(value));
  }

  function changeDistrict(value: string) {
    setDistrict(value);
    setPage(1);
    setActiveId(null);
    setLocatingRegion(Boolean(value));
  }

  function resetFilters() {
    setDepartment("");
    setProvince("");
    setDistrict("");
    setPage(1);
    setActiveId(null);
    setLocatingRegion(false);
    setMapCenter(MAP_DEFAULT_CENTER);
  }

  async function handleShareMap() {
    const url = window.location.href;
    const filterParts = [district, province, department].filter(Boolean);
    const locationText = filterParts.length > 0 ? filterParts.join(", ") : "todo el Perú";
    const shareText = `Explora ${filteredListings.length} ${filteredListings.length === 1 ? "propiedad" : "propiedades"} en ${locationText}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Propiedades en el mapa - ARIZ",
          text: shareText,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${url}`);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch (error) {
        console.error("No se pudo copiar el enlace:", error);
      }
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <header className="relative overflow-hidden rounded-2xl border border-edge bg-surface shadow-[var(--shadow-card)]">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden />
        <div className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand sm:size-14">
              <MapPin className="size-6 sm:size-7" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
                Explora por ubicación
              </p>
              <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-brand sm:text-4xl">
                Propiedades en el mapa
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Filtra por región, provincia y distrito. Selecciona un punto para conocer más.
              </p>
            </div>
          </div>
          <div className="flex w-fit items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-sm font-bold text-brand">
              <MapPin className="size-4" aria-hidden />
              {filteredListings.length} {filteredListings.length === 1 ? "propiedad" : "propiedades"}
            </div>
            <button
              type="button"
              onClick={handleShareMap}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-brand bg-brand-soft px-4 text-sm font-bold text-brand transition-colors hover:bg-brand hover:text-on-brand"
              aria-label="Compartir propiedades del mapa"
            >
              {shareCopied ? (
                <>
                  <Check className="size-4" aria-hidden />
                  <span className="hidden sm:inline">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="size-4" aria-hidden />
                  <span className="hidden sm:inline">Compartir</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {loadError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-ink"
        >
          <MapPin className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <p>
            No se pudieron cargar las propiedades porque el servicio no está disponible.
            Inténtalo de nuevo en unos minutos.
          </p>
        </div>
      ) : null}

      <section
        aria-label="Filtros de ubicación"
        className="rounded-2xl border border-edge bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-brand" aria-hidden />
          <h2 className="text-sm font-bold text-ink">Filtrar propiedades en todo el Perú</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <LocationFilter
            label="Región"
            value={department}
            options={departmentOptions}
            placeholder="Busca una región"
            onChange={changeDepartment}
          />
          <LocationFilter
            label="Provincia"
            value={province}
            options={provinceOptions}
            placeholder={department ? "Busca una provincia" : "Elige primero una región"}
            onChange={changeProvince}
            disabled={!department}
          />
          <LocationFilter
            label="Distrito"
            value={district}
            options={districtOptions}
            placeholder={province ? "Busca un distrito" : "Elige primero una provincia"}
            onChange={changeDistrict}
            disabled={!province}
          />
          {hasFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-edge px-4 text-sm font-bold text-muted transition-colors hover:border-brand hover:text-brand"
            >
              <RotateCcw className="size-4" aria-hidden />
              Limpiar
            </button>
          ) : null}
        </div>
      </section>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(380px,0.78fr)_minmax(0,1.5fr)]">
        <section aria-label="Resultados de propiedades" className="flex min-w-0 flex-col gap-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black tracking-[0.16em] text-accent uppercase">
                Resultados
              </p>
              <h2 className="mt-1 font-display text-xl font-black text-brand">
                Propiedades disponibles
              </h2>
            </div>
            <p className="shrink-0 text-xs font-semibold text-muted">
              {filteredListings.length
                ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredListings.length)} de ${filteredListings.length}`
                : "0 resultados"}
            </p>
          </div>
          {filteredListings.length > PAGE_SIZE ? (
            <p className="text-xs font-medium text-muted">Mostrando hasta 10 propiedades por página.</p>
          ) : null}

          {visibleListings.length ? (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {visibleListings.map((listing) => {
                const published = formatPublishedDate(listing.publishedAt);
                const whatsapp = whatsappLink(listing.contactWhatsapp, listing.title);
                const active = activeId === listing.id;

                return (
                  <li key={listing.id} className="min-w-0">
                    <article
                      onMouseEnter={() => setActiveId(listing.id)}
                      onFocus={() => setActiveId(listing.id)}
                      className={`flex min-w-0 gap-3 rounded-2xl border bg-surface p-3 shadow-[var(--shadow-card)] transition-colors ${
                        active ? "border-brand bg-brand-soft/40" : "border-edge hover:border-brand/60"
                      }`}
                    >
                      <ListingImage
                        src={listing.images[0]}
                        className="h-24 w-24 shrink-0 rounded-xl sm:h-28 sm:w-32"
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="text-sm font-black text-brand">
                          {formatPrice(listing.price.amount, listing.price.currency)}
                          {listing.price.period === "mensual" ? (
                            <span className="ml-1 text-[10px] font-bold text-muted">/ mes</span>
                          ) : null}
                        </p>
                        <h3 className="mt-1 line-clamp-2 break-words text-sm font-bold leading-snug text-ink">
                          {listing.title}
                        </h3>
                        <p className="mt-1 flex items-start gap-1 text-[11px] leading-4 text-muted">
                          <MapPin className="mt-0.5 size-3 shrink-0" aria-hidden />
                          <span className="line-clamp-2">
                            {[listing.location.district, listing.location.province, listing.location.department]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </p>
                        {published ? (
                          <time dateTime={published.iso} className="mt-auto pt-1 text-[10px] text-muted">
                            {published.relative}
                          </time>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col justify-center gap-2 border-l border-edge pl-2">
                        <Link
                          href={listingHref(listing)}
                          aria-label={`Ver descripción de ${listing.title}`}
                          title="Ver descripción"
                          className="flex size-9 items-center justify-center rounded-xl bg-brand text-on-brand transition-colors hover:bg-brand-hover"
                        >
                          <Search className="size-4" aria-hidden />
                        </Link>
                        {whatsapp ? (
                          <a
                            href={whatsapp}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Consultar por WhatsApp sobre ${listing.title}`}
                            title="Consultar por WhatsApp"
                            className="flex size-9 items-center justify-center rounded-xl bg-[#25d366] text-white transition-colors hover:bg-[#1fb857]"
                          >
                            <WhatsappIcon className="size-4" aria-hidden />
                          </a>
                        ) : (
                          <span
                            title="WhatsApp no disponible"
                            aria-label="WhatsApp no disponible"
                            className="flex size-9 cursor-not-allowed items-center justify-center rounded-xl bg-canvas text-muted/50"
                          >
                            <WhatsappIcon className="size-4" aria-hidden />
                          </span>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-edge bg-surface px-6 py-10 text-center">
              <div className="max-w-sm">
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <Search className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-lg font-black text-brand">No encontramos propiedades</h3>
                <p className="mt-1 text-sm leading-5 text-muted">
                  Prueba con otra región o limpia los filtros para ver todos los anuncios.
                </p>
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 text-sm font-bold text-brand underline underline-offset-4"
                  >
                    Limpiar filtros
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {pageCount > 1 ? (
            <nav aria-label="Paginación de propiedades" className="flex items-center justify-between gap-3 rounded-xl border border-edge bg-surface p-3">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-edge px-3 text-xs font-bold text-brand transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="size-3.5" aria-hidden />
                Anterior
              </button>
              <span className="text-xs font-bold text-muted">
                Página {currentPage} de {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                disabled={currentPage === pageCount}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-edge px-3 text-xs font-bold text-brand transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
                <ArrowRight className="size-3.5" aria-hidden />
              </button>
            </nav>
          ) : null}
        </section>

        <section
          aria-label="Mapa de propiedades filtradas"
          className="relative order-first h-[360px] overflow-hidden rounded-2xl border border-edge bg-surface shadow-[var(--shadow-card)] sm:h-[440px] xl:order-none xl:sticky xl:top-24 xl:h-[calc(100vh-8rem)] xl:min-h-[600px]"
        >
          <div className="absolute top-3 left-3 z-[500] rounded-full border border-edge bg-surface/95 px-3 py-2 text-xs font-bold text-brand shadow-[var(--shadow-card)] backdrop-blur">
            <span className="flex items-center gap-2">
              {locatingRegion ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> : null}
              {mapPoints.length} {mapPoints.length === 1 ? "ubicación" : "ubicaciones"}
            </span>
          </div>
          <ListingsMap
            points={mapPoints}
            center={mapCenter}
            activeId={activeId}
            onSelect={setActiveId}
            className="h-full w-full"
          />
          {filteredListings.length > 0 && mapPoints.length === 0 ? (
            <p className="absolute inset-x-4 bottom-4 z-[500] rounded-xl bg-surface/95 px-4 py-3 text-center text-xs font-semibold text-muted shadow-[var(--shadow-card)]">
              Estas propiedades no tienen coordenadas para mostrarse en el mapa.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
