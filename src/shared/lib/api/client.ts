import { env } from "@/shared/lib/env";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiInit = Omit<RequestInit, "headers"> & { headers?: Record<string, string> };

function getApiBaseUrl() {
  if (!env.apiUrl) return "";
  if (env.apiUrl.startsWith("/")) {
    return typeof window === "undefined" ? `${env.siteUrl}${env.apiUrl}` : env.apiUrl;
  }
  return env.apiUrl;
}

async function request<T>(path: string, init: ApiInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const method = init.method ?? "GET";

  if (!baseUrl) {
    throw new ApiError(`NEXT_PUBLIC_API_URL is not configured for ${method} ${path}`, 503);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    let message = `${method} ${path} responded ${response.status}`;
    try {
      const body = (await response.json()) as { message?: unknown };
      if (typeof body.message === "string") message = body.message;
      else if (Array.isArray(body.message)) message = body.message.join(" ");
    } catch {
      // Mantiene el mensaje de estado HTTP si la respuesta no contiene JSON.
    }
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get<T>(path: string, init?: ApiInit): Promise<T> {
    return request<T>(path, init);
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    });
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body ?? {}),
    });
  },
  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" });
  },
};
