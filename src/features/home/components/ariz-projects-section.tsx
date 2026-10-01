import Link from "next/link";
import { ArrowRightIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { ProjectCard } from "@/features/listings";
import { getPublicProjectsServer } from "@/features/projects/api/server";
import { toProjectCardModel } from "@/features/projects/lib/project-card";
import { HomeSection, SectionHeading } from "@/features/home/components/section";

export async function ArizProjectsSection() {
  const projects = await getPublicProjectsServer(5, "ADMIN")
    .then(({ items }) => items.map(toProjectCardModel))
    .catch(() => []);

  return (
    <HomeSection>
      <SectionHeading
        eyebrow="Ariz Proyectos"
        title="Proyectos Ariz"
        description="Proyectos inmobiliarios desarrollados y publicados por ARIZ."
        action={
          <Link href={ROUTES.projects} className="flex shrink-0 items-center gap-2 text-xs font-bold text-brand">
            Ver todos
            <ArrowRightIcon className="size-4" />
          </Link>
        }
      />

      {projects.length > 0 ? (
        <ul className="mt-8 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 rounded-card border border-dashed border-edge bg-surface-muted p-8 text-center text-sm text-muted">
          Pronto verás aquí los proyectos publicados por ARIZ.
        </p>
      )}
    </HomeSection>
  );
}
