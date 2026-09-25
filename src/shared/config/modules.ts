import type { Permission, UserRole } from "@/shared/config/roles";
import { can } from "@/shared/config/roles";
import { ROUTES } from "@/shared/config/routes";

export type ModuleKey =
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
    key: "customer-home",
    label: "My account",
    description: "Account summary and activity",
    href: ROUTES.panel.client.base,
    roles: ["customer"],
    permission: "panel:customers",
  },
  {
    key: "customer-favorites",
    label: "My favorites",
    description: "Properties you saved",
    href: ROUTES.panel.client.favorites,
    roles: ["customer"],
    permission: "favorites:view",
  },
  {
    key: "owner-home",
    label: "My dashboard",
    description: "Listing overview",
    href: ROUTES.panel.owner.base,
    roles: ["owner"],
    permission: "panel:owners",
  },
  {
    key: "owner-listings",
    label: "My listings",
    description: "Manage your published properties",
    href: ROUTES.panel.owner.listings,
    roles: ["owner"],
    permission: "listings:view",
  },
];

export function getModulesForRole(role: UserRole): ModuleConfig[] {
  return MODULES.filter((module) => can(module.permission, role));
}