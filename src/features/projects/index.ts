export { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";
export { ProjectReview } from "@/features/projects/components/project-review";
export {
  LOT_MODES,
  LOT_STATUSES,
  LOT_STATUS_LABELS,
  LOT_STATUS_TONES,
  PROJECT_AMENITIES,
  PROJECT_AMENITY_LABELS,
  PROJECT_CATEGORIES,
  PROJECT_CATEGORY_LABELS,
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
} from "@/features/projects/data/peru-locations";
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
  type CreateProjectLotPayload,
  type CreateProjectMilestonePayload,
  type CreateProjectPayload,
  type UploadedFileRef,
} from "@/features/projects/api";
export * from "@/features/projects/types/draft";
export type { ProjectPreview } from "@/features/projects/types/preview";
