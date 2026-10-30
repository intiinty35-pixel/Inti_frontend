import Link from "next/link";
import { ArrowLeft, Coins, Settings2 } from "lucide-react";
import { Card, CardContent } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { listAdminProjectPoints } from "@/features/admin/api/project-points";
import { ProjectPointsTable } from "@/features/admin/components/project-points-table";

export default async function AdminCampaignProjectPointsPage() {
  const projects = await listAdminProjectPoints();

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-7 overflow-x-hidden">
      <section className="relative overflow-hidden rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden="true" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <Link
              href={ROUTES.panel.admin.campaigns}
              className="inline-flex w-fit items-center gap-2 text-sm font-bold text-brand hover:underline"
            >
              <ArrowLeft className="size-4" />
              Volver a campañas
            </Link>
            <p className="mt-3 text-sm font-black uppercase tracking-[0.22em] text-accent">
              Puntos adicionales
            </p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-brand sm:text-5xl">
              Puntos por proyecto
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted sm:text-base sm:mx-0">
              Configura puntos adicionales para proyectos INTI. Estos puntos se suman a las reglas
              globales de referidos.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-black text-brand">
              <Settings2 className="size-3.5" aria-hidden="true" />
              Solo proyectos INTI
            </span>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-black text-accent">
              <Coins className="size-3.5" aria-hidden="true" />
              Se suman a globales
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-card border border-edge bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
              Configuración
            </p>
            <h2 className="mt-1 text-lg font-black text-brand">
              Proyectos INTI ({projects.length})
            </h2>
          </div>
        </div>
        <ProjectPointsTable projects={projects} />
      </section>

      {projects.length === 0 && (
        <Card>
          <CardContent className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Settings2 className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-xl font-black text-brand">
              No hay proyectos INTI disponibles
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              Cuando se creen proyectos desde el panel de administración, aparecerán aquí para configurar puntos adicionales.
            </p>
          </CardContent>
        </Card>
      )}

      {projects.length > 0 && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="p-5">
            <h3 className="text-sm font-black uppercase tracking-wide text-accent">
              Cómo funciona
            </h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm font-semibold text-ink">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>
                  Los puntos por proyecto se <strong>suman</strong> a los puntos globales de
                  referidos.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>
                  Solo aplica a proyectos creados por INTI o el panel de administración.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>
                  Si hay una campaña activa para el proyecto, los puntos de la campaña tienen
                  prioridad y son independientes.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>
                  Ejemplo: Si global = 100 pts y proyecto = 50 pts, el referido suma 150 pts a su
                  cuenta.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
