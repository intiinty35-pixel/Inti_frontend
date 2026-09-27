import type { Permission, UserRole } from "@/shared/config/roles";
import { can } from "@/shared/config/roles";
import { ROUTES } from "@/shared/config/routes";

export type ModuleKey =
  | "admin-home"
  | "customer-home"
  | "customer-favorites"
  | "owner-home"
  | "owner-listings";

export interface ModuleConfig {
  key: ModuleKey;
  label: string;
  description: string;
  href: string;
  roles: readonly UserRole[];
  permission: Permission;
}

export const MODULES: readonly ModuleConfig[] = [
  {
    key: "admin-home",
    label: "Profesionales",
    description: "Validación de cuentas profesionales",
    href: ROUTES.panel.admin.base,
    roles: ["ADMIN"],
    permission: "panel:admin",
  },
  {
    key: "customer-home",
    label: "Mi cuenta",
    description: "Resumen de tu cuenta y actividad",
    href: ROUTES.panel.client.base,
    roles: ["USER"],
    permission: "panel:customers",
  },
  {
    key: "customer-favorites",
    label: "Mis favoritos",
    description: "Propiedades que guardaste",
    href: ROUTES.panel.client.favorites,
    roles: ["USER"],
    permission: "favorites:view",
  },
  {
    key: "owner-home",
    label: "Mi panel",
    description: "Resumen de tus publicaciones",
    href: ROUTES.panel.owner.base,
    roles: ["REAL_ESTATE"],
    permission: "panel:owners",
  },
  {
    key: "owner-listings",
    label: "Mis publicaciones",
    description: "Administra tus propiedades publicadas",
    href: ROUTES.panel.owner.listings,
    roles: ["REAL_ESTATE"],
    permission: "listings:view",
  },
];

export function getModulesForRole(role: UserRole): ModuleConfig[] {
  return MODULES.filter((module) => can(module.permission, role));
}
