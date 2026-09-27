import Link from "next/link";
import { ArrowRightIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { PREVIEW_ARIZ_PROJECTS, ProjectCard } from "@/features/listings";
import { HomeSection, SectionHeading } from "@/features/home/components/section";

export function ArizProjectsSection() {
  return (
    <HomeSection>
      <SectionHeading
        eyebrow="Ariz Proyectos"
        title="Proyectos Ariz"
        description="Lotizaciones y edificios en preventa que estamos desarrollando en Lima."
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
        {PREVIEW_ARIZ_PROJECTS.map((project) => (
          <li key={project.id}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
