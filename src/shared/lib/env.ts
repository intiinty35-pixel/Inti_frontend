export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  authCookieName: process.env.AUTH_COOKIE_NAME ?? "ariz_session",
  backendUrl: (process.env.BACKEND_URL ?? "http://localhost:4000").replace(/\/$/, ""),
} as const;
