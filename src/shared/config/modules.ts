import type { Permission, UserRole } from "@/shared/config/roles";
import { can } from "@/shared/config/roles";
import { ROUTES } from "@/shared/config/routes";

export type ModuleKey =
  | "admin-home"
<<<<<<< HEAD
=======
  | "admin-plans"
  | "admin-subscriptions"
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
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
<<<<<<< HEAD
=======
    key: "admin-plans",
    label: "Planes",
    description: "Planes de suscripción",
    href: ROUTES.panel.admin.plans,
    roles: ["ADMIN"],
    permission: "panel:admin",
  },
  {
    key: "admin-subscriptions",
    label: "Solicitudes de pago",
    description: "Comprobantes pendientes de revisión",
    href: ROUTES.panel.admin.subscriptions,
    roles: ["ADMIN"],
    permission: "panel:admin",
  },
  {
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
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
