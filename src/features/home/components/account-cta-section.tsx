import { formatPrice } from "@/shared/lib/format";
import { ROUTES } from "@/shared/config/routes";
import { getPublicProjectsServer } from "@/features/projects/api/server";
import { toProjectCardModel } from "@/features/projects/lib/project-card";
import { AccountProjectMapPreview } from "@/features/home/components/account-project-map-preview";
import type { MapPoint } from "@/features/listings/components/listings-map";

export async function AccountCtaSection() {
  const projectPoints: MapPoint[] = await getPublicProjectsServer(20)
    .then(({ items }) =>
      items
        .map(toProjectCardModel)
        .flatMap((project): MapPoint[] => {
          const { lat, lng } = project.location;
          if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
            return [];
          }

          return [{
            id: project.id,
            lat,
            lng,
            priceLabel: `Desde ${formatPrice(project.startingPrice.amount, project.startingPrice.currency)}`,
            title: project.name,
            districtLabel: `${project.location.district}, ${project.location.department}`,
            coverImage: project.images[0],
            href: ROUTES.project(project.slug),
            badge: project.deliveryStage,
            publishedAt: project.publishedAt,
          }];
        }),
    )
    .catch(() => []);

  return (
    <section aria-label="Mapa de proyectos INTI" className="relative isolate z-0 w-full overflow-hidden bg-brand-soft">
      <AccountProjectMapPreview points={projectPoints} />
    </section>
  );
}
