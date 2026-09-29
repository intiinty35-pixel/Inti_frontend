import { redirect } from "next/navigation";
import { getSession } from "@/features/auth";
import { PREVIEW_ARIZ_PROJECTS } from "@/features/listings";
import { getMyProfile } from "@/features/owner/api/server";
import { canManageProjects } from "@/features/owner/lib/profile-permissions";
import { ProjectPublishWizard } from "@/features/projects";
import { ROUTES } from "@/shared/config/routes";

export default async function NewProjectPage() {
  const session = await getSession();
  const profile = await getMyProfile().catch(() => null);
  if (!canManageProjects(profile)) {
    redirect(ROUTES.panel.owner.listings);
  }

  const approved = session?.professionalStatus === "APPROVED";

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
      ) : (
        <ProjectPublishWizard previewProjects={PREVIEW_ARIZ_PROJECTS} />
      )}
    </div>
  );
}
