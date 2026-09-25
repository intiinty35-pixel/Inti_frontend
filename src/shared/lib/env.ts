export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  authCookieName: process.env.AUTH_COOKIE_NAME ?? "ariz_session",
} as const;