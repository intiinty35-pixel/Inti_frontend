import Link from "next/link";
import { Button } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { getSession } from "@/features/auth";
import { getMySubscription } from "@/features/owner/api/server";
import { PREVIEW_ARIZ_PROJECTS } from "@/features/listings";
import { ProjectPublishWizard } from "@/features/projects";

export default async function NewProjectPage() {
  const session = await getSession();

  let subscription = null;
  try {
    subscription = await getMySubscription();
  } catch {
    subscription = null;
  }

  const approved = session?.professionalStatus === "APPROVED";
  const hasActivePlan = subscription?.status === "ACTIVE";

  return (
    <div className="grid gap-6">
      {!approved ? (
        <div className="grid gap-3">
          <h1 className="font-display text-2xl font-black tracking-tight text-brand">
            Nuevo proyecto
          </h1>
          <div className="rounded-card bg-warning/10 px-4 py-3 text-sm font-semibold text-warning">
            Tu perfil anunciante debe estar aprobado para publicar proyectos.
          </div>
        </div>
      ) : !hasActivePlan ? (
        <div className="rounded-card border border-edge bg-surface p-6 text-center shadow-[var(--shadow-card)]">
          <h1 className="font-display text-2xl font-black tracking-tight text-brand">
            Nuevo proyecto
          </h1>
          <p className="mt-3 text-lg font-semibold text-brand">
            Necesitas un plan activo para publicar
          </p>
          <p className="mt-1 text-sm text-muted">
            Activa una membresia pagando con Yape, Plin o transferencia. En cuanto el agente valide tu pago,
            podras publicar tus proyectos.
          </p>
          <Link href={ROUTES.panel.owner.subscription} className="mt-4 inline-flex">
            <Button>Ver planes y pagar</Button>
          </Link>
        </div>
      ) : (
        <ProjectPublishWizard previewProjects={PREVIEW_ARIZ_PROJECTS} />
      )}
    </div>
  );
}
