import { getPublicProjectsServer } from "@/features/projects/api/server";
import { projectToMapListing } from "@/features/projects/lib/project-map";
import type { Listing } from "@/features/listings/types/listing";
import { MapPageExplorer } from "@/features/listings/components/map-page-explorer";

export async function MapExplorerSection({ mapToolbarHref }: { mapToolbarHref?: string } = {}) {
  const listings: Listing[] = [];
  let loadError = false;

  try {
    let page = 1;
    while (true) {
      const result = await getPublicProjectsServer(50, undefined, "recent", page, true);
      listings.push(...result.items.flatMap(project => projectToMapListing(project) ?? []));
      if (!result.hasMore || !result.items.length) break;
      page += 1;
    }
  } catch {
    loadError = true;
  }

  return (
      <section id="mapa" className="w-full">
        <MapPageExplorer listings={listings} loadError={loadError} mapToolbarHref={mapToolbarHref} />
      </section>
  );
}
