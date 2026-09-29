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
          <span title="Disponible próximamente" className="shrink-0 text-xs font-bold text-muted">
            Ver todos
          </span>
        }
      />

      <ul className="mt-8 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {PREVIEW_ARIZ_PROJECTS.map((project) => (
          <li key={project.id}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
