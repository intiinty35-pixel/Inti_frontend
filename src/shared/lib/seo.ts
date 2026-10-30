import type { Metadata } from "next";
import { env } from "@/shared/lib/env";

export const SITE_NAME = "Inti Proyectos";
export const SEO_KEYWORDS = [
  "inmobiliaria en Peru",
  "propiedades en venta",
  "propiedades en alquiler",
  "alquiler de departamentos",
  "venta de casas",
  "venta de terrenos",
  "proyectos inmobiliarios",
  "proyectos de lotizacion",
  "lotes en venta",
  "servicios inmobiliarios",
  "intermediacion inmobiliaria",
  "corretaje inmobiliario",
  "rentabilidad inmobiliaria",
  "plusvalia inmobiliaria",
  "ganar comisiones inmobiliarias",
  "inversion inmobiliaria",
];

export interface SeoOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: readonly string[];
  noIndex?: boolean;
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${env.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata({
  title,
  description,
  path = "/",
  image = "/web_v/logo_web.png",
  keywords = [],
  noIndex = false,
}: SeoOptions): Metadata {
  const canonical = `${env.siteUrl}${path}`;
  const imageUrl = absoluteUrl(image);

  return {
    metadataBase: new URL(env.siteUrl),
    title,
    description,
    keywords: [...SEO_KEYWORDS, ...keywords],
    alternates: {
      canonical,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: "es_PE",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
