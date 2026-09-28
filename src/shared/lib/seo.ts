import type { Metadata } from "next";
import { env } from "@/shared/lib/env";

export interface SeoOptions {
  title: string;
  description: string;
  path?: string;
<<<<<<< HEAD
}

export function buildMetadata({ title, description, path = "/" }: SeoOptions): Metadata {
=======
  image?: string;
}

export function buildMetadata({ title, description, path = "/", image }: SeoOptions): Metadata {
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
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
<<<<<<< HEAD
=======
      images: image ? [{ url: image }] : undefined,
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
<<<<<<< HEAD
    },
  };
}
=======
      images: image ? [image] : undefined,
    },
  };
}
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
