import { ProjectCard } from "@/features/listings";
import { getPublicProjectsServer } from "@/features/projects/api/server";
import { toProjectCardModel } from "@/features/projects/lib/project-card";

/** Proyectos destacados de agentes, servidos por el backend. */
export async function PublishedProjectsSection() {
  const page = await getPublicProjectsServer(5, "AGENT", "featured").catch(() => null);
  const projects = page?.items.map(toProjectCardModel) ?? [];

  if (!page || projects.length === 0) return null;

  return (
    <section className="bg-[#F3F4F8] px-3 pt-3 pb-8 sm:px-4 lg:px-5 xl:px-6">
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="text-xl leading-none font-black tracking-tight text-[#071A5A] sm:text-2xl">
              Proyectos destacados
            </h2>
            <span aria-hidden className="hidden h-0.5 w-7 rounded-full bg-accent sm:block" />
            <p className="text-[10px] leading-none font-bold text-[#596273] sm:text-[11px]">
              Los 5 proyectos con mayor destaque
            </p>
          </div>

          <span
            title="Disponible proximamente"
            className="shrink-0 text-[10px] font-black text-[#596273] sm:text-xs"
          >
            Ver todos los proyectos
          </span>
        </div>

        <ul className="mt-5 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
