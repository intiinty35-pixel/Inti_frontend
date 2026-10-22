import type { UserRole } from "@/shared/config/roles";

export const ROUTES = {
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  register: "/register",
  registerCustomer: "/register/customer",
  registerProfessional: "/register/professional",
  properties: "/propiedades",
  map: "/mapa",
  mapProject: (slug: string): string => `/mapa?proyecto=${encodeURIComponent(slug)}`,
  property: (slug: string): string => `/propiedades/${slug}`,
  projects: "/proyectos",
  project: (slug: string): string => `/project/${slug}`,
  services: "/servicios",
  construye: "/construye",
  investments: "/inversiones",
  terms: "/terminos",
  rewards: "/rewards",
  rewardsMy: "/rewards/my",
  claims: "/libro-reclamaciones",
  panel: {
    admin: {
      base: "/panel/admin",
      accounts: "/panel/admin/accounts",
      plans: "/panel/admin/plans",
      subscriptions: "/panel/admin/subscriptions",
      properties: "/panel/admin/properties",
      newProperty: "/panel/admin/properties/new",
      editProperty: (id: string): string => `/panel/admin/properties/${id}/edit`,
      projects: "/panel/admin/projects",
      allProjects: "/panel/admin/projects/all",
      newProject: "/panel/admin/projects/new",
      editProject: (id: string): string => `/panel/admin/projects/${id}/edit`,
      investmentOpportunities: "/panel/admin/investment-opportunities",
      developers: "/panel/admin/developers",
      developer: (id: string): string => `/panel/admin/developers/${id}`,
      agencies: "/panel/admin/agencies",
      referrals: "/panel/admin/referrals",
      referralRanking: "/panel/admin/referrals/ranking",
      referralRecords: "/panel/admin/referrals/records",
      referralRegistrations: "/panel/admin/referrals/registrations",
      reports: "/panel/admin/reports",
      agency: (id: string): string => `/panel/admin/agencies/${id}`,
      referrer: (id: string): string => `/panel/admin/referrals/${id}`,
      incentives: "/panel/admin/incentives",
      incentive: (id: string): string => `/panel/admin/incentives/${id}`,
      newIncentive: "/panel/admin/incentives/new",
      redemptions: "/panel/admin/redemptions",
      redemption: (id: string): string => `/panel/admin/redemptions/${id}`,
      claims: "/panel/admin/claims",
      claim: (id: string): string => `/panel/admin/claims/${id}`,
      promotions: "/panel/admin/promotions",
      campaigns: "/panel/admin/campaigns",
      campaignProjectPoints: "/panel/admin/campaigns/project-points",
      newCampaign: "/panel/admin/campaigns/new",
      campaign: (id: string): string => `/panel/admin/campaigns/${id}`,
    },
    client: {
      base: "/panel/client",
      favorites: "/panel/client/favorites",
      profile: "/panel/client/profile",
      properties: "/panel/client/properties",
      newProperty: "/panel/client/properties/new",
      editProperty: (id: string): string => `/panel/client/properties/${id}/edit`,
      rentals: "/panel/client/rentals",
      membership: "/panel/client/membership",
    },
    owner: {
      base: "/panel/owner",
      listings: "/panel/owner/listings",
      newListing: "/panel/owner/listings/new",
      editListing: (id: string): string => `/panel/owner/listings/${id}/edit`,
      projects: "/panel/owner/projects",
      newProject: "/panel/owner/projects/new",
      editProject: (id: string): string => `/panel/owner/projects/${id}/edit`,
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
