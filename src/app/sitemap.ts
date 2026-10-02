import type { MetadataRoute } from "next";
import { env } from "@/shared/lib/env";

const routes = [
  { path: "/", priority: 1 },
  { path: "/propiedades", priority: 0.95 },
  { path: "/proyectos", priority: 0.9 },
  { path: "/mapa", priority: 0.8 },
  { path: "/servicios", priority: 0.85 },
  { path: "/register/professional", priority: 0.65 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${env.siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.path === "/" ? "daily" : "weekly",
    priority: route.priority,
  }));
}
