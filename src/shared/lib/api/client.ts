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

<<<<<<< HEAD
async function request<T>(path: string, init: ApiInit = {}): Promise<T> {
  const baseUrl = env.apiUrl;

  if (!baseUrl) {
    throw new ApiError(`NEXT_PUBLIC_API_URL no está configurado para GET ${path}`, 503);
=======
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
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
<<<<<<< HEAD
    throw new ApiError(`GET ${path} respondió ${response.status}`, response.status);
=======
    throw new ApiError(`${method} ${path} responded ${response.status}`, response.status);
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
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
<<<<<<< HEAD
};
=======
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body ?? {}),
    });
  },
};
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
