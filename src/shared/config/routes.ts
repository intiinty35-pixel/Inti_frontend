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
  rewards: "/rewards",
  rewardsMy: "/rewards/my",
  panel: {
    admin: {
      base: "/panel/admin",
      plans: "/panel/admin/plans",
      subscriptions: "/panel/admin/subscriptions",
      projects: "/panel/admin/projects",
      newProject: "/panel/admin/projects/new",
      investmentOpportunities: "/panel/admin/investment-opportunities",
      developers: "/panel/admin/developers",
      developer: (id: string): string => `/panel/admin/developers/${id}`,
      agencies: "/panel/admin/agencies",
      referrals: "/panel/admin/referrals",
      agency: (id: string): string => `/panel/admin/agencies/${id}`,
      referrer: (id: string): string => `/panel/admin/referrals/${id}`,
      incentives: "/panel/admin/incentives",
      incentive: (id: string): string => `/panel/admin/incentives/${id}`,
      newIncentive: "/panel/admin/incentives/new",
      redemptions: "/panel/admin/redemptions",
      redemption: (id: string): string => `/panel/admin/redemptions/${id}`,
    },
    client: {
      base: "/panel/client",
      favorites: "/panel/client/favorites",
      profile: "/panel/client/profile",
      properties: "/panel/client/properties",
      newProperty: "/panel/client/properties/new",
      rentals: "/panel/client/rentals",
      membership: "/panel/client/membership",
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

export function getAuthenticatedLandingRoute(role: UserRole): string {
  return role === "USER" ? ROUTES.home : getHomeRoute(role);
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
