export interface SearchPathParams {
  operation: string;
  type: string;
  location?: string[];
}

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  search: ({ operation, type, location = [] }: SearchPathParams): string => {
    const places = location.length > 0 ? `/${location.join("/")}` : "";
    return `/${operation}/${type}${places}`;
  },
  property: (slug: string): string => `/property/${slug}`,
  project: (slug: string): string => `/project/${slug}`,
  panel: {
    client: {
      base: "/panel/client",
      favorites: "/panel/client/favorites",
    },
    owner: {
      base: "/panel/owner",
      listings: "/panel/owner/listings",
    },
  },
} as const;