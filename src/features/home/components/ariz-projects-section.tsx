import Link from "next/link";
import { Building2 } from "lucide-react";
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
    <section className="bg-[#071b45] px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col items-start gap-4 border-b border-white/15 pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Vivienda e inversión</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Proyectos Inti</h2>
            <p className="mt-2 text-sm text-white/70">Desarrollos pensados para crecer contigo.</p>
          </div>

          <Link
            href={ROUTES.projects}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/25 px-4 text-sm font-semibold text-white transition-colors hover:border-accent hover:bg-white/10 sm:shrink-0"
          >
            Ver todos los proyectos
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>

        {projects.length > 0 ? (
          <>
            <ul className="horizontal-scrollbar-hidden mt-6 flex w-full snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3 sm:mt-7 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 lg:grid-cols-3 xl:grid-cols-5">
              {projects.map((project) => (
                <li key={project.id} className="w-[min(84vw,22rem)] shrink-0 snap-start sm:w-auto">
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
            {projects.length > 1 ? (
              <p className="mt-1 text-[11px] text-white/60 sm:hidden">Desliza para ver más proyectos →</p>
            ) : null}
          </>
        ) : (
          <div role="status" className="mt-7 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 px-6 py-10 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-white/10 text-accent"><Building2 className="size-6" /></span>
            <h3 className="mt-4 font-display text-lg font-bold text-white">Aún no hay proyectos que mostrar</h3>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-white/70">Estamos preparando nuevas oportunidades inmobiliarias para ti.</p>
          </div>
        )}
      </div>
    </section>
  );
}
