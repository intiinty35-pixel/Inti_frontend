export type UserRole = "customer" | "owner";

export const ROLES: readonly UserRole[] = ["customer", "owner"] as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Customer",
  owner: "Owner",
};

export type Permission =
  | "panel:access"
  | "panel:customers"
  | "panel:owners"
  | "favorites:view"
  | "favorites:edit"
  | "listings:view"
  | "listings:edit";

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  customer: ["panel:access", "panel:customers", "favorites:view", "favorites:edit"],
  owner: ["panel:access", "panel:owners", "listings:view", "listings:edit"],
};

export function can(permission: Permission, role: UserRole | null | undefined): boolean {
  return role !== null && role !== undefined && ROLE_PERMISSIONS[role].includes(permission);
}