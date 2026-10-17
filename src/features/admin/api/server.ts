import { backendFetch } from "@/shared/lib/api/server";
import type { ApprovalStatus } from "@/features/auth";
import type { Plan } from "@/features/owner/types/plan";
import type { PagedResult } from "@/features/listings";
import type { ProjectApiDetail, ProjectApiSummary } from "@/features/projects/types/api";
import type { Listing, PropertyDetail } from "@/features/listings/types/listing";

export type DeveloperReviewStatus = "DRAFT" | "PENDING_REVIEW" | "REJECTED" | "PUBLISHED";

export interface AdminDeveloperSummary {
  id: string;
  type: "DEVELOPER";
  status: ApprovalStatus;
  businessName: string | null;
  whatsapp: string | null;
  city: string;
  user: { firstName: string; lastName: string | null; email: string };
  properties?: Listing[];
  projects?: ProjectApiSummary[];
}

export interface AdminDeveloperDetail extends AdminDeveloperSummary {
  ruc: string | null;
  dni: string | null;
  address: string | null;
  website: string | null;
  createdAt: string;
  properties: Listing[];
  projects: ProjectApiSummary[];
}

export interface AdminAgencySummary {
  id: string;
  type: "REAL_ESTATE_AGENCY";
  status: ApprovalStatus;
  businessName: string | null;
  whatsapp: string | null;
  city: string;
  user: { firstName: string; lastName: string | null; email: string };
  properties: Array<{ id: string; title: string; status: string }>;
  projects: Array<{ id: string; name: string; status: string }>;
}

export type AdminAgencyPropertyReview = Pick<Listing, "id" | "title"> &
  Partial<Omit<Listing, "id" | "title">> &
  Partial<Pick<PropertyDetail, "details" | "maintenanceFee" | "negotiable" | "amenities" | "agent">>;
export type AdminAgencyProjectReview = Pick<ProjectApiSummary, "id" | "name"> &
  Partial<Omit<ProjectApiDetail, "id" | "name">>;

export type AdminAgencyDetail = Omit<AdminAgencySummary, "properties" | "projects"> & {
  properties: AdminAgencyPropertyReview[];
  projects: AdminAgencyProjectReview[];
};

export interface PendingSubscription {
  id: string;
  status: "PENDING_PAYMENT" | "ACTIVE" | "REJECTED" | "EXPIRED";
  receiptUrl: string | null;
  createdAt: string;
  startedAt?: string | null;
  expiresAt?: string | null;
  plan: Plan;
  agentProfile: {
    id: string;
    type: "INDEPENDENT_AGENT" | "REAL_ESTATE_AGENCY" | "DEVELOPER" | "INDIVIDUAL_OWNER";
    businessName: string | null;
    user: { firstName: string; lastName: string | null; email: string };
  };
}

export interface ProfessionalRecord {
  id: string;
  type: "INDEPENDENT_AGENT" | "REAL_ESTATE_AGENCY" | "DEVELOPER" | "INDIVIDUAL_OWNER";
  status: ApprovalStatus;
  dni: string | null;
  ruc: string | null;
  businessName: string | null;
  whatsapp: string | null;
  city: string;
  isOfficialDeveloper: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    phone: string | null;
  };
}

export interface ContactReport {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  topic: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function listProfessionals(page?: number, pageSize?: number): Promise<PagedResult<ProfessionalRecord>> {
  const params = new URLSearchParams();
  params.set("page", String(page ?? 1));
  if (pageSize) params.set("pageSize", String(pageSize));

  const response = await backendFetch(`/admin/professionals?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`No se pudo cargar la lista de profesionales (${response.status})`);
  }

  return (await response.json()) as PagedResult<ProfessionalRecord>;
}

export async function setProfessionalStatus(id: string, status: ApprovalStatus): Promise<void> {
  const response = await backendFetch(`/admin/professionals/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo actualizar el estado (${response.status})`);
  }
}

async function getJson<T>(path: string): Promise<T> {
  const response = await backendFetch(path);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path} (${response.status})`);
  }
  return (await response.json()) as T;
}

export function listAllPlans(page?: number, pageSize?: number): Promise<PagedResult<Plan>> {
  const params = new URLSearchParams();
  params.set("page", String(page ?? 1));
  if (pageSize) params.set("pageSize", String(pageSize));
  return getJson<PagedResult<Plan>>(`/admin/plans?${params.toString()}`);
}

export function listPendingSubscriptions(
  page?: number,
  pageSize?: number,
): Promise<PagedResult<PendingSubscription>> {
  const params = new URLSearchParams();
  params.set("page", String(page ?? 1));
  if (pageSize) params.set("pageSize", String(pageSize));
  return getJson<PagedResult<PendingSubscription>>(`/admin/subscriptions/pending?${params.toString()}`);
}

export function listSubscriptions(page?: number, pageSize?: number): Promise<PagedResult<PendingSubscription>> {
  const params = new URLSearchParams();
  params.set("page", String(page ?? 1));
  if (pageSize) params.set("pageSize", String(pageSize));
  return getJson<PagedResult<PendingSubscription>>(`/admin/subscriptions?${params.toString()}`);
}

export async function deleteContactReport(id: string): Promise<void> {
  const response = await backendFetch(`/admin/contact-reports/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) throw new Error("No se pudo eliminar el reporte.");
}

export function listContactReports(page?: number, pageSize?: number): Promise<PagedResult<ContactReport>> {
  const params = new URLSearchParams();
  params.set("page", String(page ?? 1));
  if (pageSize) params.set("pageSize", String(pageSize));
  return getJson<PagedResult<ContactReport>>(`/admin/contact-reports?${params.toString()}`);
}

export async function listDevelopers(status: DeveloperReviewStatus = "PENDING_REVIEW", page = 1, pageSize = 10) {
  const params = new URLSearchParams({ status, page: String(page), pageSize: String(pageSize) });
  return getJson<PagedResult<AdminDeveloperSummary>>(`/admin/developers?${params.toString()}`);
}

export async function getDeveloper(id: string, status?: DeveloperReviewStatus) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return getJson<AdminDeveloperDetail>(`/admin/developers/${encodeURIComponent(id)}${query}`);
}

export async function listAgencies(page = 1, pageSize = 10) {
  const params = new URLSearchParams({
    status: "PENDING_REVIEW",
    page: String(page),
    pageSize: String(pageSize),
  });
  return getJson<PagedResult<AdminAgencySummary>>(`/admin/agencies?${params.toString()}`);
}

export async function getAgency(id: string) {
  return getJson<AdminAgencyDetail>(
    `/admin/agencies/${encodeURIComponent(id)}?status=PENDING_REVIEW`,
  );
}

async function updateDeveloperReview(path: string) {
  const response = await backendFetch(path, { method: "PATCH" });
  if (!response.ok) throw new Error(`No se pudo actualizar la publicación (${response.status})`);
}

export function publishDeveloperProperty(id: string) { return updateDeveloperReview(`/admin/developers/properties/${encodeURIComponent(id)}/publish`); }
export function rejectDeveloperProperty(id: string) { return updateDeveloperReview(`/admin/developers/properties/${encodeURIComponent(id)}/reject`); }
export function publishDeveloperProject(id: string) { return updateDeveloperReview(`/admin/developers/projects/${encodeURIComponent(id)}/publish`); }
export function rejectDeveloperProject(id: string) { return updateDeveloperReview(`/admin/developers/projects/${encodeURIComponent(id)}/reject`); }

async function updateAgencyReview(path: string) {
  const response = await backendFetch(path, { method: "PATCH" });
  if (!response.ok) throw new Error(`No se pudo actualizar la publicación (${response.status})`);
}

export function publishAgencyProperty(id: string) { return updateAgencyReview(`/admin/agencies/properties/${encodeURIComponent(id)}/publish`); }
export function rejectAgencyProperty(id: string) { return updateAgencyReview(`/admin/agencies/properties/${encodeURIComponent(id)}/reject`); }
export function publishAgencyProject(id: string) { return updateAgencyReview(`/admin/agencies/projects/${encodeURIComponent(id)}/publish`); }
export function rejectAgencyProject(id: string) { return updateAgencyReview(`/admin/agencies/projects/${encodeURIComponent(id)}/reject`); }
