import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { env } from "@/shared/lib/env";
import { SEO_KEYWORDS, SITE_NAME, absoluteUrl } from "@/shared/lib/seo";
import "./globals.css";

const logoUrl = absoluteUrl("/web_v/logo_web.png");

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "Ariz Proyectos | Inmobiliaria, propiedades y proyectos en Peru",
    template: "%s | Ariz Proyectos",
  },
  description:
    "Portal inmobiliario para comprar, alquilar y vender propiedades, lotes y proyectos inmobiliarios en Peru. Servicios inmobiliarios, intermediacion, rentabilidad, plusvalia y comisiones.",
  applicationName: SITE_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: SEO_KEYWORDS,
  authors: [{ name: SITE_NAME, url: env.siteUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Real Estate",
  icons: {
    icon: [
      { rel: "icon", url: "/web_v/logo_web.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", url: "/web_v/logo_web.png", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: env.siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: env.siteUrl,
    siteName: SITE_NAME,
    title: "Ariz Proyectos | Propiedades, alquileres y proyectos inmobiliarios",
    description:
      "Busca propiedades en venta y alquiler, proyectos de lotizacion, servicios inmobiliarios e inversiones con potencial de rentabilidad y plusvalia.",
    images: [{ url: logoUrl, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ariz Proyectos | Inmobiliaria en Peru",
    description:
      "Propiedades en venta y alquiler, proyectos inmobiliarios, lotes, servicios y oportunidades de inversion.",
    images: [logoUrl],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: SITE_NAME,
    url: env.siteUrl,
    logo: logoUrl,
    image: logoUrl,
    areaServed: {
      "@type": "Country",
      name: "Peru",
    },
    knowsAbout: [
      "venta de propiedades",
      "alquiler de propiedades",
      "proyectos inmobiliarios",
      "lotizacion",
      "intermediacion inmobiliaria",
      "servicios inmobiliarios",
      "rentabilidad inmobiliaria",
      "plusvalia inmobiliaria",
    ],
    sameAs: [env.siteUrl],
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: env.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${env.siteUrl}/propiedades?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
