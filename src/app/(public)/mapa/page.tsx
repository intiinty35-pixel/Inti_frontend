import { MapExplorerSection } from "@/features/home";
import { buildMetadata } from "@/shared/lib/seo";
import { ROUTES } from "@/shared/config/routes";

export const metadata = buildMetadata({
  title: "Mapa de propiedades y proyectos — ARIZ",
  description: "Explora propiedades y proyectos publicados en ARIZ usando el mapa interactivo.",
  path: ROUTES.map,
});

export default function MapPage() {
  return <MapExplorerSection />;
}
