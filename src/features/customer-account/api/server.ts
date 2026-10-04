import { backendFetch } from "@/shared/lib/api/server";
import type {
  CustomerMembership,
  CustomerProfile,
} from "@/features/customer-account/types/customer-account";

async function getJson<T>(path: string): Promise<T> {
  const response = await backendFetch(path);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path} (${response.status})`);
  }
  return (await response.json()) as T;
}

export function getCustomerProfile(): Promise<CustomerProfile> {
  return getJson<CustomerProfile>("/customer-account/me");
}

export function getCustomerMembership(): Promise<CustomerMembership> {
  return getJson<CustomerMembership>("/customer/membership");
}
