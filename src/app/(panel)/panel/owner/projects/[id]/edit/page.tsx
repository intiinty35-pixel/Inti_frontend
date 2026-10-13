import { notFound, redirect } from "next/navigation";
import { PREVIEW_ARIZ_PROJECTS } from "@/features/listings";
import { getMyProfile } from "@/features/owner/api/server";
import { canManageProjects } from "@/features/owner/lib/profile-permissions";
import { ProjectPublishWizard } from "@/features/projects";
import { getOwnerProjectDetailServer } from "@/features/projects/api/server";
import { ROUTES } from "@/shared/config/routes";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getMyProfile().catch(() => null);
  if (!canManageProjects(profile)) {
    redirect(ROUTES.panel.owner.listings);
  }

  const project = await getOwnerProjectDetailServer(id);
  if (!project) notFound();

  return (
    <div className="grid gap-6">
      <ProjectPublishWizard previewProjects={PREVIEW_ARIZ_PROJECTS} initialProject={project} />
    </div>
  );
}
