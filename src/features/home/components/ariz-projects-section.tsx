import Link from "next/link";
import { ArrowRightIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { ProjectCard } from "@/features/listings";
import { getPublicProjectsServer } from "@/features/projects/api/server";
import { toProjectCardModel } from "@/features/projects/lib/project-card";

export async function ArizProjectsSection() {
  const projects = await getPublicProjectsServer(5, "ADMIN")
    .then(({ items }) => items.map(toProjectCardModel))
    .catch(() => []);

  return (
    <section className="bg-[#F3F4F8] px-3 pt-3 pb-8 sm:px-4 lg:px-5 xl:px-6">
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="text-[22px] leading-none font-black tracking-tight text-[#071A5A] sm:text-[26px]">
              Proyectos Ariz
            </h2>
            <span aria-hidden className="hidden h-0.5 w-7 rounded-full bg-accent sm:block" />
            <p className="text-[10px] leading-none font-bold text-[#596273] sm:text-[11px]">
              Desarrollos que transforman Tumbes
            </p>
          </div>

          <Link
            href={ROUTES.projects}
            className="flex shrink-0 items-center gap-2 text-[10px] font-black text-[#071A5A] transition-colors hover:text-brand sm:text-xs"
          >
            Ver todos los proyectos
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>

        {projects.length > 0 ? (
          <ul className="horizontal-scrollbar-hidden mt-5 flex w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-3 xl:grid-cols-5">
            {projects.map((project) => (
              <li key={project.id} className="w-[calc((100vw_-_2.25rem)/2)] shrink-0 snap-start sm:w-auto">
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-card border border-dashed border-edge bg-surface p-8 text-center text-sm text-muted">
            Pronto veras aqui los proyectos publicados por ARIZ.
          </p>
        )}
      </div>
    </section>
  );
}
