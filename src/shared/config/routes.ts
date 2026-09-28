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
<<<<<<< HEAD
  property: (slug: string): string => `/property/${slug}`,
=======
  properties: "/propiedades",
  property: (slug: string): string => `/propiedades/${slug}`,
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
  project: (slug: string): string => `/project/${slug}`,
  panel: {
    admin: {
      base: "/panel/admin",
<<<<<<< HEAD
=======
      plans: "/panel/admin/plans",
      subscriptions: "/panel/admin/subscriptions",
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
    },
    client: {
      base: "/panel/client",
      favorites: "/panel/client/favorites",
    },
    owner: {
      base: "/panel/owner",
      listings: "/panel/owner/listings",
<<<<<<< HEAD
=======
      newListing: "/panel/owner/listings/new",
      projects: "/panel/owner/projects",
      newProject: "/panel/owner/projects/new",
      leads: "/panel/owner/leads",
      stats: "/panel/owner/stats",
      subscription: "/panel/owner/subscription",
      profile: "/panel/owner/profile",
      settings: "/panel/owner/settings",
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
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
