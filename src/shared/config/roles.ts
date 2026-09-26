export type UserRole = "ADMIN" | "USER" | "REAL_ESTATE";

export const ROLES: readonly UserRole[] = ["ADMIN", "USER", "REAL_ESTATE"] as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  USER: "Usuario",
  REAL_ESTATE: "Inmobiliaria",
};

export type Permission =
  | "panel:access"
  | "panel:admin"
  | "panel:customers"
  | "panel:owners"
  | "favorites:view"
  | "favorites:edit"
  | "listings:view"
  | "listings:edit";

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  ADMIN: ["panel:access", "panel:admin"],
  USER: ["panel:access", "panel:customers", "favorites:view", "favorites:edit"],
  REAL_ESTATE: ["panel:access", "panel:owners", "listings:view", "listings:edit"],
};

export function can(permission: Permission, role: UserRole | null | undefined): boolean {
  return role !== null && role !== undefined && ROLE_PERMISSIONS[role].includes(permission);
}
