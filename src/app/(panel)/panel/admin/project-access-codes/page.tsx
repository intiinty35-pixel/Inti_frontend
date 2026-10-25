import { backendFetch } from "@/shared/lib/api/server";
import { ArrowLeft, KeyRound } from "lucide-react";
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
    <div className="grid gap-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid gap-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Portafolio / Accesos</p>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-brand"><KeyRound size={22} strokeWidth={1.6}/>Códigos de acceso</h1>
          <p className="text-[13px] text-muted">Gestiona el acceso temporal a los planos de tus proyectos.</p>
        </div>
        <Link href={ROUTES.panel.admin.allProjects} className="inline-flex items-center gap-2 rounded border border-edge bg-white px-3 py-2 text-xs font-medium text-brand hover:bg-slate-50">
          <ArrowLeft size={14} /> Proyectos
        </Link>
      </header>
      <ProjectAccessCodeManager projects={projects} selectedProjectId={project} />
    </div>
  );
}
