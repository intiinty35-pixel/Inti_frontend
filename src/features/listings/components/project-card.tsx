import { SoonButton } from "@/shared/ui";
import { formatArea, formatPrice } from "@/shared/lib/format";
import type { Project, ProjectStatus } from "@/features/listings/types/project";
import { DataCell, DataGrid } from "@/features/listings/components/data-grid";
import { ListingImage } from "@/features/listings/components/listing-image";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  preventa: "En preventa",
  "en-construccion": "En construcción",
  entregado: "Entregado",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
      <ListingImage src={project.images[0]} className="h-36 sm:h-44">
        <span className="absolute top-2 left-2 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-on-accent">
          {STATUS_LABELS[project.status]}
        </span>
      </ListingImage>

      <div className="flex flex-1 flex-col p-2.5">
        <p className="text-[9px] font-bold tracking-[0.16em] text-accent uppercase">
          {project.developer}
        </p>
        <h3 className="mt-0.5 text-[13px] leading-snug font-bold text-brand">{project.name}</h3>
        <p className="mt-1 text-[15px] font-bold text-brand">
          Desde {formatPrice(project.startingPrice.amount, project.startingPrice.currency)}
        </p>

        <DataGrid columns={4} className="mt-2">
          <DataCell label="Área" value={formatArea(project.areaRange.min)} />
          <DataCell label={project.lotsLabel ?? "lotes"} value={project.lotsTotal} />
          <DataCell label="Entrega" value={project.deliveryStage} />
          <DataCell label="Distrito" value={project.location.district} />
        </DataGrid>

        <div className="mt-auto flex gap-1.5 pt-2">
          <SoonButton size="xs" className="flex-1">
            Ver proyecto
          </SoonButton>
          <SoonButton size="xs" variant="secondary" className="flex-1">
            Contactar
          </SoonButton>
        </div>
      </div>
    </article>
  );
}
