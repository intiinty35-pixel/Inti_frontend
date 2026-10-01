import { backendFetch } from "@/shared/lib/api/server";
import type { ApprovalStatus } from "@/features/auth";
import type { Plan } from "@/features/owner/types/plan";
import type { PagedResult } from "@/features/listings";

export interface PendingSubscription {
  id: string;
  status: "PENDING_PAYMENT";
  receiptUrl: string | null;
  createdAt: string;
  plan: Plan;
  agentProfile: {
    id: string;
    businessName: string | null;
    user: { firstName: string; lastName: string | null; email: string };
  };
}

export interface ProfessionalRecord {
  id: string;
  type: "INDEPENDENT_AGENT" | "REAL_ESTATE_AGENCY" | "DEVELOPER";
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
