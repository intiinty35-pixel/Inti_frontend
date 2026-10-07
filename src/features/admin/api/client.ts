import type { Plan } from "@/features/owner/types/plan";

export class AdminRequestError extends Error {
  readonly messages: string[];

  constructor(messages: string[]) {
    super(messages[0]);
    this.name = "AdminRequestError";
    this.messages = [...new Set(messages)];
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`/api${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new AdminRequestError(["No pudimos conectar con el servidor. Inténtalo de nuevo."]);
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = data?.message;
    throw new AdminRequestError(
      Array.isArray(message) ? message : [message ?? "No se pudo completar la solicitud."],
    );
  }

  return (await response.json()) as T;
}

export interface PlanFormInput {
  name: string;
  price: number;
  durationDays: number;
  propertyLimit: number;
  projectLimit: number;
  features: string[];
  isFree: boolean;
  isDefault: boolean;
  highlight: boolean;
}

export function createPlan(input: PlanFormInput): Promise<Plan> {
  return request<Plan>("/admin/plans", { method: "POST", body: JSON.stringify(input) });
}

export function updatePlan(id: string, input: PlanFormInput & { isActive: boolean }): Promise<Plan> {
  return request<Plan>(`/admin/plans/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function setOfficialDeveloper(id: string, isOfficialDeveloper: boolean): Promise<void> {
  return request<void>(`/admin/professionals/${id}/official-developer`, {
    method: "PATCH",
    body: JSON.stringify({ isOfficialDeveloper }),
  });
}

export interface NotifyProfessionalInput {
  subject?: string;
  message?: string;
}

export function notifyProfessional(
  id: string,
  input: NotifyProfessionalInput = {},
): Promise<{ ok: boolean; email: string }> {
  return request<{ ok: boolean; email: string }>(`/admin/professionals/${id}/notify`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function reviewSubscription(
  id: string,
  status: "ACTIVE" | "REJECTED",
  rejectionReason?: string,
): Promise<void> {
  return request<void>(`/admin/subscriptions/${id}/review`, {
    method: "PATCH",
    body: JSON.stringify({ status, rejectionReason }),
  });
}
