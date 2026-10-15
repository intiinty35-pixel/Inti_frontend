import { getAllPublicListingsServer } from "@/features/listings/api/server";
import { getPublicProjectsServer } from "@/features/projects/api/server";
import { projectToMapListing } from "@/features/projects/lib/project-map";
import type { Listing } from "@/features/listings/types/listing";
import { HomeSection } from "@/features/home/components/section";
import { InvestmentGrowthBanner } from "@/features/home/components/investment-growth-banner";
import { MapPageExplorer } from "@/features/listings/components/map-page-explorer";

export async function MapExplorerSection() {
  let listings: Listing[] = [];
  let loadError = false;

  try {
    listings = await getAllPublicListingsServer();
  } catch {
    loadError = true;
  }

  // Los proyectos publicados con ubicacion tambien aparecen en el mapa.
  try {
    const projects = await getPublicProjectsServer(50);
    const projectListings = projects.items.flatMap((project) => projectToMapListing(project) ?? []);
    listings = [...listings, ...projectListings];
    loadError = false;
  } catch {
    // Si fallan los proyectos, el mapa sigue mostrando las propiedades.
  }

  return (
    <>
      <HomeSection id="mapa" className="min-h-[calc(100vh-var(--header-h))] py-6 sm:py-8">
        <MapPageExplorer listings={listings} loadError={loadError} />
      </HomeSection>
      <InvestmentGrowthBanner />
    </>
  );
}
