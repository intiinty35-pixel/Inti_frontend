import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "ariz_session";

// [OCULTO-DEMO R1] Rutas del panel ocultas para la demo (ver README-OCULTOS.md).
// Responden 404 aunque se escriba la URL. Vaciar la lista para volver a permitirlas.
const HIDDEN_PANEL_PATHS: readonly string[] = [
  "/panel/admin/plans",
  "/panel/admin/subscriptions",
  "/panel/admin/reports",
  "/panel/admin/promotions",
  "/panel/admin/referrals",
  "/panel/admin/campaigns",
  "/panel/admin/incentives",
  "/panel/admin/redemptions",
  "/panel/admin/investment-opportunities",
  "/panel/client/rentals",
  "/panel/owner/stats",
  "/panel/owner/subscription",
  "/panel/owner/settings",
];

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(AUTH_COOKIE_NAME);

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);

    return NextResponse.redirect(url);
  }

  const { pathname } = request.nextUrl;
  if (HIDDEN_PANEL_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.rewrite(new URL("/panel/no-disponible", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/panel/:path*",
};