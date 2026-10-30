import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Inti Proyectos",
    short_name: "Inti",
    description:
      "Portal inmobiliario para buscar propiedades en venta, alquileres, lotes, proyectos inmobiliarios y servicios inmobiliarios en Peru.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#082a6b",
    categories: ["business", "real estate", "productivity"],
    lang: "es-PE",
    icons: [
      {
        src: "/web_v/logo_web.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
