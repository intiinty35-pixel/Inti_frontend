import type { UserRole } from "@/shared/config/roles";

export interface SearchPathParams {
  operation: string;
  type: string;
  location?: string[];
}

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  registerCustomer: "/register/customer",
  registerProfessional: "/register/professional",
  search: ({ operation, type, location = [] }: SearchPathParams): string => {
    const places = location.length > 0 ? `/${location.join("/")}` : "";
    return `/${operation}/${type}${places}`;
  },
  properties: "/propiedades",
  property: (slug: string): string => `/propiedades/${slug}`,
  project: (slug: string): string => `/project/${slug}`,
  panel: {
    admin: {
      base: "/panel/admin",
      plans: "/panel/admin/plans",
      subscriptions: "/panel/admin/subscriptions",
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
