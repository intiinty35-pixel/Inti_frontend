import type { Metadata } from "next";
import { env } from "@/shared/lib/env";

export interface SeoOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
}

export function buildMetadata({ title, description, path = "/", image }: SeoOptions): Metadata {
  const canonical = `${env.siteUrl}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Ariz",
      type: "website",
      locale: "en_US",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
