import type { CreatePropertyPayload, OwnerProperty, ProfessionalProfile } from "@/features/owner/types/property";
import type { Subscription } from "@/features/owner/types/plan";
import type { OwnerNotificationSettings } from "@/features/owner/types/settings";

export class OwnerRequestError extends Error {
  readonly messages: string[];

  constructor(messages: string[]) {
    super(messages[0]);
    this.name = "OwnerRequestError";
    this.messages = [...new Set(messages)];
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`/api${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new OwnerRequestError(["No pudimos conectar con el servidor. Inténtalo de nuevo."]);
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = data?.message;
    throw new OwnerRequestError(
      Array.isArray(message) ? message : [message ?? "No se pudo completar la solicitud."],
    );
  }

  return (await response.json()) as T;
}

export function createProperty(payload: CreatePropertyPayload): Promise<OwnerProperty> {
  return request<OwnerProperty>("/properties", { method: "POST", body: JSON.stringify(payload) });
}

export function publishProperty(id: string): Promise<OwnerProperty> {
  return request<OwnerProperty>(`/properties/${id}/publish`, { method: "PATCH" });
}

export function updateMyProfile(
  draft: Partial<{
    firstName: string;
    businessName: string;
    phone: string;
    avatarUrl: string;
    whatsapp: string;
    city: string;
    districts: string;
    address: string;
    website: string;
    socialLinks: string;
    ruc: string;
  }>,
): Promise<ProfessionalProfile> {
  return request<ProfessionalProfile>("/professionals/me", {
    method: "PATCH",
    body: JSON.stringify(draft),
  });
}

export function changeOwnerPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return request<{ message: string }>("/professionals/me/password", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function updateOwnerNotificationSettings(
  input: Partial<
    Pick<
      OwnerNotificationSettings,
      "emailLeads" | "whatsappLeads" | "membershipReminders" | "weeklyStats"
    >
  >,
): Promise<OwnerNotificationSettings> {
  return request<OwnerNotificationSettings>("/professionals/me/settings", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

interface CloudinarySignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

async function uploadToCloudinary(
  file: File,
  folder: string,
): Promise<{ url: string; publicId: string }> {
  const signature = await request<CloudinarySignature>("/media/cloudinary/signature", {
    method: "POST",
    body: JSON.stringify({ folder }),
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new OwnerRequestError(["No se pudo subir la foto. Inténtalo de nuevo."]);
  }

  const data = (await response.json()) as { secure_url: string; public_id: string };
  return { url: data.secure_url, publicId: data.public_id };
}

export function uploadPropertyPhoto(file: File): Promise<{ url: string; publicId: string }> {
  return uploadToCloudinary(file, "ariz/properties");
}

export function uploadPaymentReceipt(file: File): Promise<{ url: string; publicId: string }> {
  return uploadToCloudinary(file, "ariz/receipts");
}

export function uploadProfilePhoto(file: File): Promise<{ url: string; publicId: string }> {
  return uploadToCloudinary(file, "ariz/profiles");
}

export function requestPlan(planId: string, receiptUrl?: string): Promise<Subscription> {
  return request<Subscription>(`/plans/${planId}/request`, {
    method: "POST",
    body: JSON.stringify(receiptUrl ? { receiptUrl } : {}),
  });
}
