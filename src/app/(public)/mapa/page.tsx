import { MapExplorerSection } from "@/features/home";
import { buildMetadata } from "@/shared/lib/seo";
import { ROUTES } from "@/shared/config/routes";

export const metadata = buildMetadata({
  title: "Mapa de proyectos — ARIZ",
  description: "Explora los proyectos de ARIZ, sus planos y lotes en el mapa interactivo.",
  path: ROUTES.map,
});

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ proyecto?: string }>;
}) {
  const { proyecto } = await searchParams;
  return <MapExplorerSection initialSlug={proyecto} />;
}
