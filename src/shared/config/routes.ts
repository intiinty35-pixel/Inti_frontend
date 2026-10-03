import type { UserRole } from "@/shared/config/roles";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  registerCustomer: "/register/customer",
  registerProfessional: "/register/professional",
  properties: "/propiedades",
  map: "/mapa",
  property: (slug: string): string => `/propiedades/${slug}`,
  projects: "/proyectos",
  project: (slug: string): string => `/project/${slug}`,
  services: "/servicios",
  investments: "/inversiones",
  panel: {
    admin: {
      base: "/panel/admin",
      plans: "/panel/admin/plans",
      subscriptions: "/panel/admin/subscriptions",
      projects: "/panel/admin/projects",
      newProject: "/panel/admin/projects/new",
      developers: "/panel/admin/developers",
      developer: (id: string): string => `/panel/admin/developers/${id}`,
      agencies: "/panel/admin/agencies",
      agency: (id: string): string => `/panel/admin/agencies/${id}`,
    },
    client: {
      base: "/panel/client",
      favorites: "/panel/client/favorites",
    },
    owner: {
      base: "/panel/owner",
      listings: "/panel/owner/listings",
      newListing: "/panel/owner/listings/new",
      projects: "/panel/owner/projects",
      newProject: "/panel/owner/projects/new",
      leads: "/panel/owner/leads",
      stats: "/panel/owner/stats",
      subscription: "/panel/owner/subscription",
      profile: "/panel/owner/profile",
      settings: "/panel/owner/settings",
    },
  },
} as const;

export function getHomeRoute(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return ROUTES.panel.admin.base;
    case "REAL_ESTATE":
      return ROUTES.panel.owner.base;
    default:
      return ROUTES.panel.client.base;
  }
}

/**
 * Rutas cuyo primer pantallón es un hero oscuro: el header va transparente y con
 * texto blanco sobre ellas, porque es lo unico que se lee bien.
 *
 * En el resto de paginas publicas (`/propiedades`, `/mapa`, ...) el contenido
 * arranca sobre fondo claro, asi que el header vuelve a su estilo solido con
 * texto azul.
 */
const OVERLAY_HEADER_ROUTES: readonly string[] = [ROUTES.home, ROUTES.services];

export function hasOverlayHeader(pathname: string): boolean {
  return OVERLAY_HEADER_ROUTES.includes(pathname);
}
