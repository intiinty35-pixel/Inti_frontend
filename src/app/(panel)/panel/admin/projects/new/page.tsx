import { PREVIEW_ARIZ_PROJECTS } from "@/features/listings";
import { ProjectPublishWizard } from "@/features/projects";

export default function AdminNewProjectPage() {
  return <ProjectPublishWizard previewProjects={PREVIEW_ARIZ_PROJECTS} adminMode />;
}
