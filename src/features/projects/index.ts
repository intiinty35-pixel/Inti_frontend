export { ProjectPublishWizard, type ProjectPublishWizardProps } from "@/features/projects/components/project-publish-wizard";
export { ProjectReview } from "@/features/projects/components/project-review";
export { OwnerProjectCard } from "@/features/projects/components/owner-project-card";
export {
  FINANCING_CONDITIONS,
  FINANCING_CONDITION_LABELS,
  LOT_MODES,
  LOT_STATUSES,
  LOT_STATUS_LABELS,
  LOT_STATUS_TONES,
  PROJECT_AMENITIES,
  PROJECT_AMENITY_LABELS,
  PROJECT_CATEGORY_LABELS,
  PROJECT_CERTIFICATIONS,
  PROJECT_CERTIFICATION_LABELS,
  PROJECT_SERVICES,
  PROJECT_SERVICE_LABELS,
  PROJECT_STAGES,
  PROJECT_STAGE_LABELS,
} from "@/features/projects/data/project-catalogs";
export {
  PERU_DEPARTMENTS,
  PERU_PLACE_OPTIONS,
  getDistricts,
  getProvinces,
  isConsistentLocation,
} from "@/shared/data/peru-locations";
export {
  createEmptyLot,
  createEmptyMilestone,
  isLotComplete,
  isMilestoneRowBlank,
  PROJECT_DRAFT_DEFAULTS,
} from "@/features/projects/lib/project-draft";
export {
  LAST_STEP_INDEX,
  WIZARD_STEPS,
  projectDraftSchema,
  type WizardStep,
} from "@/features/projects/lib/project-schema";
export {
  formatAmenityLabels,
  formatLocation,
  summarizeLots,
  type ProjectTotals,
} from "@/features/projects/lib/project-summary";
export {
  buildProjectPayload,
  createAdminProject,
  createProject,
  getOwnerProjects,
  publishProject,
  publishAdminProject,
  toProjectInput,
  uploadProjectFiles,
  type CreateProjectInput,
  type CreateProjectLotPayload,
  type CreateProjectMilestonePayload,
  type CreateProjectPayload,
  type ProjectMediaInput,
  type UploadedFileRef,
} from "@/features/projects/api";
export { toProjectCardModel } from "@/features/projects/lib/project-card";
export * from "@/features/projects/types/draft";
export * from "@/features/projects/types/api";
export type { ProjectPreview } from "@/features/projects/types/preview";
