import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/shared/lib/env";
import { backendFetch } from "@/shared/lib/api/server";
import { getHomeRoute, ROUTES } from "@/shared/config/routes";
import type { UserRole } from "@/shared/config/roles";
import type { Session, SessionUser } from "@/features/auth/types/session";

export const getSession = cache(async (): Promise<Session> => {
  const store = await cookies();

  if (!store.has(env.authCookieName)) {
    return null;
  }

  try {
    const response = await backendFetch("/auth/me");

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { user: SessionUser };
    return data.user;
  } catch {
    return null;
  }
});

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    redirect(ROUTES.login);
  }

  return session;
}

export async function requireRole(role: UserRole): Promise<SessionUser> {
  const session = await requireSession();

  if (session.role !== role) {
    redirect(getHomeRoute(session.role));
  }

  return session;
}
