import { backendFetch } from "@/shared/lib/api/server";
import type {
  Lead,
  OwnerProperty,
  PagedResult,
  ProfessionalProfile,
} from "@/features/owner/types/property";
import type { Plan, Subscription } from "@/features/owner/types/plan";
import type { OwnerNotificationSettings } from "@/features/owner/types/settings";

async function getJson<T>(path: string): Promise<T> {
  const response = await backendFetch(path);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path} (${response.status})`);
  }
  return (await response.json()) as T;
}

async function getJsonOrNull<T>(path: string): Promise<T | null> {
  const response = await backendFetch(path);
  if (response.status === 204) return null;
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path} (${response.status})`);
  }
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : null;
}

export function listMyProperties(): Promise<OwnerProperty[]> {
  return getJson<OwnerProperty[]>("/properties/owner/me");
}

export function listMyPropertiesPaged(page: number, pageSize = 6): Promise<PagedResult<OwnerProperty>> {
  return getJson<PagedResult<OwnerProperty>>(`/properties/owner/me?page=${page}&pageSize=${pageSize}`);
}

export function listMyLeads(): Promise<Lead[]> {
  return getJson<Lead[]>("/leads/mine");
}

export function listMyLeadsPaged(page: number, pageSize = 4): Promise<PagedResult<Lead>> {
  return getJson<PagedResult<Lead>>(`/leads/mine?page=${page}&pageSize=${pageSize}`);
}

export function getMyProfile(): Promise<ProfessionalProfile> {
  return getJson<ProfessionalProfile>("/professionals/me");
}

export function listPlans(): Promise<Plan[]> {
  return getJson<Plan[]>("/plans");
}

export function getMySubscription(): Promise<Subscription | null> {
  return getJsonOrNull<Subscription>("/plans/me/subscription");
}

export function getMyNotificationSettings(): Promise<OwnerNotificationSettings> {
  return getJson<OwnerNotificationSettings>("/professionals/me/settings");
}
