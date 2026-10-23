import { backendFetch } from "@/shared/lib/api/server";
import { KeyRound } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/shared/config/routes";
import { ProjectAccessCodeManager, type ProjectAccessCodeRow } from "@/features/projects/components/project-access-code-manager";

export default async function ProjectAccessCodesPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const response = await backendFetch("/admin/projects/site-plan-access-codes");
  if (!response.ok) throw new Error("No se pudieron cargar los códigos de acceso de los proyectos.");
  const projects = await response.json() as ProjectAccessCodeRow[];
  const { project } = await searchParams;
  return (
    <div className="grid gap-6">
      <header className="grid gap-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Portafolio</p>
        <h1 className="font-display text-3xl font-black text-brand">Códigos de acceso a proyectos</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted">
          Genera códigos temporales para que los usuarios consulten el plano y
          los lotes de un proyecto. La administración de códigos está separada
          del editor de planos.
        </p>
        <Link href={ROUTES.panel.admin.allProjects} className="inline-flex w-fit items-center gap-2 text-sm font-bold text-brand">
          <KeyRound size={16} /> Volver a todos los proyectos
        </Link>
      </header>
      <ProjectAccessCodeManager projects={projects} selectedProjectId={project} />
    </div>
  );
}
