import { notFound } from "next/navigation";
import { PREVIEW_ARIZ_PROJECTS } from "@/features/listings";
import { ProjectPublishWizard } from "@/features/projects";
import { getAdminProjectDetailServer } from "@/features/projects/api/server";

export default async function AdminEditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getAdminProjectDetailServer(id);
  if (!project) notFound();

  return (
    <div className="grid gap-6">
      <ProjectPublishWizard previewProjects={PREVIEW_ARIZ_PROJECTS} adminMode initialProject={project} />
    </div>
  );
}
