import Link from "next/link";
import { ArrowRightIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { ProjectCard } from "@/features/listings";
import { getPublicProjectsServer } from "@/features/projects/api/server";
import { toProjectCardModel } from "@/features/projects/lib/project-card";
import { HomeSection, SectionHeading } from "@/features/home/components/section";

/** Proyectos publicados por los agentes, servidos por el backend. */
export async function PublishedProjectsSection() {
  // La home se prerrenderiza: si la API no responde la seccion simplemente no
  // se pinta, sin romper el build ni la pagina.
  const projects = await getPublicProjectsServer(5)
    .then((page) => page.items.map(toProjectCardModel))
    .catch(() => []);

  if (projects.length === 0) return null;

  return (
    <HomeSection>
      <SectionHeading
        eyebrow="Publicados en Ariz"
        title="Proyectos publicados"
        description="Lotizaciones y edificios en preventa que los agentes de Ariz publican en tiempo real."
        action={
          <Link
            href={ROUTES.search({ operation: "buy", type: "projects" })}
            className="flex shrink-0 items-center gap-2 text-xs font-bold text-brand"
          >
            Ver todos
            <ArrowRightIcon className="size-4" />
          </Link>
        }
      />

      <ul className="mt-6 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {projects.map((project) => (
          <li key={project.id}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
