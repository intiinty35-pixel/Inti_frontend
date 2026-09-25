import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/shared/lib/env";
import { ROUTES } from "@/shared/config/routes";
import type { Session, SessionUser } from "@/features/auth/types/session";

function decodeSession(value: string | undefined): Session {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64").toString("utf8")) as SessionUser;

    if (
      typeof parsed === "object" &&
      typeof parsed.id === "string" &&
      typeof parsed.name === "string" &&
      typeof parsed.role === "string"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export async function getSession(): Promise<Session> {
  const store = await cookies();
  return decodeSession(store.get(env.authCookieName)?.value);
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    redirect(ROUTES.login);
  }

  return session;
}