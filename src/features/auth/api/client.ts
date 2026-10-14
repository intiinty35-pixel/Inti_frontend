import type { SessionUser } from "@/features/auth/types/session";
import { signInWithPopup } from "firebase/auth";
import { getFirebaseSignIn } from "@/shared/lib/firebase";

export type ProfessionalType = "INDEPENDENT_AGENT" | "REAL_ESTATE_AGENCY" | "DEVELOPER";

export interface RegisterCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  acceptTerms: boolean;
}

export interface RegisterProfessionalInput {
  type: ProfessionalType;
  firstName?: string;
  lastName?: string;
  dni?: string;
  businessName?: string;
  ruc?: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  districts?: string;
  address?: string;
  website?: string;
  socialLinks?: string;
  password: string;
  acceptTerms: boolean;
}

export class AuthRequestError extends Error {
  readonly messages: string[];

  constructor(messages: string[]) {
    super(messages[0]);
    this.name = "AuthRequestError";
    this.messages = [...new Set(messages)];
  }
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new AuthRequestError(["No pudimos conectar con el servidor. Inténtalo de nuevo."]);
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new AuthRequestError(["Demasiados intentos. Espera un minuto e inténtalo de nuevo."]);
    }

    const data = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = data?.message;
    const messages = Array.isArray(message)
      ? message
      : [message ?? "No se pudo completar la solicitud."];

    throw new AuthRequestError(messages);
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export async function login(input: {
  email: string;
  password: string;
  rememberMe: boolean;
}): Promise<SessionUser> {
  return (await post<{ user: SessionUser }>("login", input)).user;
}

export async function loginWithGoogle(): Promise<SessionUser> {
  try {
    const { firebaseAuth, googleProvider } = getFirebaseSignIn();
    const credential = await signInWithPopup(firebaseAuth, googleProvider);
    const idToken = await credential.user.getIdToken();
    return (await post<{ user: SessionUser }>("google", { idToken })).user;
  } catch (error) {
    if (error instanceof AuthRequestError) throw error;
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "auth/popup-closed-by-user") {
      throw new AuthRequestError(["Se cerró la ventana de Google antes de completar el ingreso."]);
    }
    throw new AuthRequestError(["No se pudo iniciar sesión con Google."]);
  }
}

export async function registerCustomer(input: RegisterCustomerInput): Promise<SessionUser> {
  return (await post<{ user: SessionUser }>("register/customer", input)).user;
}

export async function registerProfessional(
  input: RegisterProfessionalInput,
): Promise<SessionUser> {
  return (await post<{ user: SessionUser }>("register/professional", input)).user;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await post<{ ok: true }>("forgot-password", { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await post<{ ok: true }>("reset-password", { token, password });
}

export async function logout(): Promise<void> {
  await post<void>("logout");
}
