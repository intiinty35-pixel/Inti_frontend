import { cookies } from "next/headers";
import { env } from "@/shared/lib/env";

export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const store = await cookies();

  return fetch(`${env.backendUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      Cookie: store.toString(),
      ...init.headers,
    },
  });
}
