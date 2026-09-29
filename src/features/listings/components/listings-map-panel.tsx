"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClockIcon, PinIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/config/routes";
import { formatPublishedDate } from "@/shared/lib/published-date";
import { Listbox, type ListboxOption } from "@/shared/ui";
import { ListingImage } from "@/features/listings/components/listing-image";
import type { MapPoint } from "@/features/listings/components/listings-map";

const MapSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-card border border-edge bg-surface-muted", className)} />
);

const ListingsMap = dynamic<{
  points: readonly MapPoint[];
  className?: string;
  activeId?: string | null;
  onSelect?: (id: string) => void;
}>(() => import("@/features/listings/components/listings-map").then((module) => module.ListingsMap), {
  ssr: false,
  loading: () => <MapSkeleton className="h-full w-full" />,
});

const MAP_FILTER_TYPE: readonly ListboxOption[] = [
  { value: "", label: "Todos los inmuebles" },
  { value: "houses", label: "Casas" },
  { value: "apartments", label: "Departamentos" },
  { value: "land", label: "Terrenos" },
  { value: "projects", label: "Proyectos" },
  { value: "commercial", label: "Locales comerciales" },
];

const MAP_FILTER_OPERATION: readonly ListboxOption[] = [
  { value: "buy", label: "Comprar" },
  { value: "rent", label: "Alquilar" },
];

const MAP_FILTER_ROOMS: readonly ListboxOption[] = [
  { value: "", label: "Dormitorios" },
  { value: "1", label: "1 o más" },
  { value: "2", label: "2 o más" },
  { value: "3", label: "3 o más" },
  { value: "4", label: "4 o más" },
];

const MAP_FILTER_STAGE: readonly ListboxOption[] = [
  { value: "", label: "Etapa" },
  { value: "PRE_SALE", label: "En preventa" },
  { value: "UNDER_CONSTRUCTION", label: "En construcción" },
  { value: "DELIVERED", label: "Entregado" },
];

const FIELD_TRIGGER =
  "h-10 rounded-card border border-edge bg-surface px-3 text-xs font-bold text-brand pr-2 hover:border-brand";

export interface ListingsMapPanelProps {
  points: readonly MapPoint[];
  filters: {
    operation: string;
    type?: string;
    district?: string;
    roomsMin?: number;
    priceMin?: number;
    priceMax?: number;
    areaMin?: number;
  };
  /** true cuando el menu activo es "Proyectos": habilita el filtro de etapa. */
  isProjectMode: boolean;
  className?: string;
  /**
   * `inline` (por defecto) mantiene el panel embebido en la pagina tal como
   * estaba. `overlay` lo adapta para vivir dentro del modal de pantalla completa
   * y del bottom sheet movil: alturas relativas al contenedor en vez de fijas.
   */
  variant?: "inline" | "overlay";
}

/**
 * Panel interactivo del buscador: mapa real (Leaflet) con todos los puntos del
 * filtro activo y una franja de filtros horizontal arriba, igual que en la home,
 * para cambiar de categoria sin volver arriba de la pagina.
 *
 * Es el mismo componente en la vista previa (dentro del modal) y en pantalla
 * completa, para no duplicar la logica de mapa, filtros, contador y lista lateral.
 */
export function ListingsMapPanel({
  points,
  filters,
  isProjectMode,
  className,
  variant = "inline",
}: ListingsMapPanelProps) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stage, setStage] = useState("");
  const [district, setDistrict] = useState(filters.district ?? "");

  const isOverlay = variant === "overlay";
  /**
   * En overlay el alto lo manda el contenedor (vista a pantalla completa); en
   * inline es fijo. En movil el panel se reparte 60/40 entre mapa y lista.
   */
  const mapHeight = isOverlay ? "h-full min-h-[280px]" : "h-[420px] lg:h-[560px]";
  const listHeight = isOverlay
    ? "max-h-[38vh] shrink-0 lg:max-h-none lg:min-h-0 lg:flex-1"
    : "max-h-[420px] lg:max-h-[560px]";

  /**
   * El filtro de tipo queda inutil en modo proyectos: los proyectos son un
   * conjunto propio (`/projects`) y el selector de inmuebles los vaciaria.
   */
  function push(next: Partial<ListingsMapPanelProps["filters"]>) {
    const params = new URLSearchParams();
    const merged = { ...filters, ...next };

    params.set("operation", merged.operation || "buy");
    if (merged.type) params.set("type", merged.type);
    if (merged.district) params.set("district", merged.district);
    if (merged.roomsMin) params.set("roomsMin", String(merged.roomsMin));
    if (merged.priceMin) params.set("priceMin", String(merged.priceMin));
    if (merged.priceMax) params.set("priceMax", String(merged.priceMax));
    if (merged.areaMin) params.set("areaMin", String(merged.areaMin));

    router.push(`${ROUTES.properties}?${params.toString()}`);
  }

  /** Titulo y contador del panel, con la unidad correcta en cada modo. */
  const unit = isProjectMode ? "proyecto" : "inmueble";
  const panelTitle = isProjectMode ? "Proyectos en el mapa" : "Propiedades en el mapa";
  const countLabel = points.length === 1 ? `1 ${unit}` : `${points.length} ${unit}s`;

  return (
    <section
      className={cn("flex flex-col gap-3", isOverlay && "h-full min-h-0", className)}
      aria-label={panelTitle}
    >
      {/* Encabezado: la vista a pantalla completa y la columna lateral lo repiten. */}
      <div className="flex shrink-0 items-center gap-2">
        <PinIcon className="size-4 shrink-0 text-brand" />
        <h3 className="truncate text-sm font-bold text-ink">{panelTitle}</h3>
        <span className="ml-auto shrink-0 text-[11px] font-bold text-muted">{countLabel}</span>
      </div>

      {/* Franja de filtros horizontal: replica los accesos del menu del home. */}
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto rounded-card border border-edge bg-surface p-2.5 shadow-[var(--shadow-card)] sm:flex-wrap sm:overflow-visible">
        <Listbox
          name="mapOperation"
          value={filters.operation}
          options={MAP_FILTER_OPERATION}
          onValueChange={(value) => push({ operation: value })}
          label="Operación"
          triggerClassName={FIELD_TRIGGER}
          listClassName="min-w-36"
        />
        {isProjectMode ? null : (
          <Listbox
            name="mapType"
            value={filters.type ?? ""}
            options={MAP_FILTER_TYPE}
            onValueChange={(value) => push({ type: value || undefined })}
            label="Tipo de inmueble"
            triggerClassName={FIELD_TRIGGER}
            listClassName="min-w-48"
          />
        )}
        <Listbox
          name="mapRooms"
          value={filters.roomsMin ? String(filters.roomsMin) : ""}
          options={MAP_FILTER_ROOMS}
          onValueChange={(value) => push({ roomsMin: value ? Number(value) : undefined })}
          label="Dormitorios"
          triggerClassName={FIELD_TRIGGER}
          listClassName="min-w-36"
        />

        {isProjectMode ? (
          <Listbox
            name="mapStage"
            value={stage}
            options={MAP_FILTER_STAGE}
            onValueChange={setStage}
            label="Etapa del proyecto"
            triggerClassName={FIELD_TRIGGER}
            listClassName="min-w-44"
          />
        ) : null}

        <input
          defaultValue={district}
          onChange={(event) => setDistrict(event.target.value)}
          onBlur={() => push({ district: district.trim() || undefined })}
          onKeyDown={(event) => {
            if (event.key === "Enter") push({ district: district.trim() || undefined });
          }}
          placeholder="Distrito"
          aria-label="Filtrar por distrito"
          className="h-10 w-40 rounded-card border border-edge bg-surface px-3 text-xs font-bold text-brand outline-none placeholder:font-semibold placeholder:text-muted focus:border-brand"
        />

        <span className="ml-auto hidden shrink-0 text-[11px] font-bold text-muted sm:flex sm:items-center sm:gap-1.5">
          <PinIcon className="size-3.5 text-brand" />
          {countLabel} en el mapa
        </span>
      </div>

      <div
        className={cn(
          "grid gap-3 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-4",
          isOverlay && "min-h-0 flex-1",
        )}
      >
        <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
          {points.length > 0 ? (
            <div className={mapHeight}>
              <ListingsMap
                points={points}
                activeId={activeId}
                onSelect={setActiveId}
                className="h-full w-full"
              />
            </div>
          ) : (
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-6 text-center",
                mapHeight,
              )}
            >
              <PinIcon className="size-8 text-brand/40" />
              <p className="text-sm font-bold text-ink">Sin ubicaciones para estos filtros</p>
              <p className="text-xs text-muted">
                Prueba quitando el distrito o ampliando el rango de precio.
              </p>
            </div>
          )}
        </div>

        {/* Listado lateral: al pasar por una card se resalta su punto en el mapa. */}
        <ul
          className={cn(
            "flex snap-y snap-proximity flex-col gap-3 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-edge",
            listHeight,
          )}
        >
          {points.map((point) => {
            const published = formatPublishedDate(point.publishedAt);

            return (
              <li key={point.id} className="snap-start">
                <Link
                  href={point.href}
                  onMouseEnter={() => setActiveId(point.id)}
                  onFocus={() => setActiveId(point.id)}
                  className={cn(
                    "flex gap-3 rounded-card border bg-surface p-2.5 shadow-[var(--shadow-card)] transition-colors",
                    point.id === activeId
                      ? "border-brand bg-brand-soft"
                      : "border-edge hover:border-brand",
                  )}
                >
                  <ListingImage
                    src={point.coverImage}
                    className={cn(
                      "aspect-[4/3] shrink-0 rounded-lg",
                      // En la vista a pantalla completa la lista es la columna de
                      // apoyo: miniatura chica para que quepan mas propiedades sin
                      // perder el precio ni el titulo. Inline conserva el tamano.
                      isOverlay ? "w-16" : "w-24",
                    )}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5">
                    <span className="text-sm font-bold text-brand">{point.priceLabel}</span>
                    <span className="line-clamp-2 text-xs leading-snug font-semibold text-ink">
                      {point.title}
                    </span>
                    <span className="truncate text-[11px] text-muted">{point.districtLabel}</span>
                    {published ? (
                      <time dateTime={published.iso} className="flex items-center gap-1 text-[11px] text-muted">
                        <ClockIcon className="size-3" />
                        {published.fullWithPrefix}
                      </time>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

