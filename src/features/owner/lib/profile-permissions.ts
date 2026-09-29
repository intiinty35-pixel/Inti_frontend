import type { ProfessionalProfile } from "@/features/owner/types/property";

export function canManageProjects(profile: Pick<ProfessionalProfile, "type"> | null | undefined) {
  return profile?.type === "REAL_ESTATE_AGENCY" || profile?.type === "DEVELOPER";
}
