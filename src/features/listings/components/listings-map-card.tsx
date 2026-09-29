"use client";

import Link from "next/link";
import { ArrowRightIcon, ClockIcon, WhatsappIcon } from "@/shared/ui/icons";
import { ROUTES } from "@/shared/config/routes";
import { formatPublishedDate } from "@/shared/lib/published-date";
import { ListingImage } from "@/features/listings/components/listing-image";

/**
 * Modelo unico que consume el mapa, sin importar si el punto es una propiedad
 * (`/properties`) o un proyecto (`/projects`): el panel solo necesita precio,
 * portada, enlace de detalle y un WhatsApp opcional.
 */
export interface MapPointCard {
  id: string;
  /** Precio ya formateado (los proyectos muestran "Desde S/ …"). */
  priceLabel: string;
  title: string;
  districtLabel: string;
  coverImage?: string;
  href: string;
  /** URL de WhatsApp lista para abrir; si falta, el icono se deshabilita. */
  whatsappUrl?: string;
  /** Etiqueta corta de la operacion o etapa ("VENTA", "En preventa"…). */
  badge?: string;
  publishedAt?: string;
}

/**
 * Card flotante que se abre al pulsar un punto del mapa.
 *
 * Compacta a proposito: el popup de Leaflet no tiene scroll propio, asi que una
 * card alta se sale del mapa en pantallas bajas (laptops de 768px de alto). Con
 * miniatura de 80px y acciones de 32px la card completa mide ~150px.
 */
export function ListingsMapCard({ point }: { point: MapPointCard }) {
  const published = formatPublishedDate(point.publishedAt);

  return (
    <article className="w-56">
      <div className="relative">
        <ListingImage src={point.coverImage} className="h-20 w-full" />
        {point.badge ? (
          <span className="absolute top-2 left-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-black tracking-[0.08em] text-on-brand">
            {point.badge}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-0.5 p-2.5">
        <p className="text-sm font-bold text-brand">{point.priceLabel}</p>
        <h3 className="line-clamp-2 text-xs leading-snug font-semibold text-ink">{point.title}</h3>
        <p className="truncate text-[11px] text-muted">{point.districtLabel}</p>
        {published ? (
          <time dateTime={published.iso} className="flex items-center gap-1 text-[11px] text-muted">
            <ClockIcon className="size-3" />
            {published.fullWithPrefix}
          </time>
        ) : null}

        <div className="mt-2 flex items-center gap-2">
          <Link
            href={point.href}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-card bg-brand px-3 text-xs font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            Ver
            <ArrowRightIcon className="size-3.5" />
          </Link>

          {point.whatsappUrl ? (
            <a
              href={point.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Consultar por WhatsApp: ${point.title}`}
              className="flex size-8 items-center justify-center rounded-card bg-[#25d366] text-white transition-colors hover:bg-[#1fb857]"
            >
              <WhatsappIcon className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** URL de WhatsApp del anunciante con el mensaje ya redactado, o `undefined`. */
export function buildWhatsappUrl(
  rawPhone: string | null | undefined,
  message: string,
): string | undefined {
  const digits = rawPhone?.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : undefined;
}

/** Enlace al detalle segun el tipo: proyecto o propiedad. */
export function pointHref(kind: "property" | "project", slug: string): string {
  return kind === "project" ? ROUTES.project(slug) : ROUTES.property(slug);
}
