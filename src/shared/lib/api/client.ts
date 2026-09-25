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

async function request<T>(path: string, init: ApiInit = {}): Promise<T> {
  const baseUrl = env.apiUrl;

  if (!baseUrl) {
    throw new ApiError(`NEXT_PUBLIC_API_URL no está configurado para GET ${path}`, 503);
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
    throw new ApiError(`GET ${path} respondió ${response.status}`, response.status);
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
};