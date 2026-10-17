import { apiClient } from "@/shared/lib/api/client";

interface CloudinarySignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export interface CloudinaryUpload {
  url: string;
  publicId: string;
}

export type CloudinaryResourceType = "image" | "raw" | "auto" | "video";

/** Sube un archivo firmado a Cloudinary dentro de la carpeta indicada. */
export async function uploadToCloudinary(
  file: File,
  folder: string,
  resourceType: CloudinaryResourceType = "image",
): Promise<CloudinaryUpload> {
  const signature = await apiClient.post<CloudinarySignature>("/media/cloudinary/signature", {
    folder,
  });
  const body = new FormData();
  body.set("file", file);
  body.set("api_key", signature.apiKey);
  body.set("timestamp", String(signature.timestamp));
  body.set("folder", signature.folder);
  body.set("signature", signature.signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/${resourceType}/upload`,
    { method: "POST", body },
  );

  if (!response.ok) {
    throw new Error("No se pudo subir el archivo a Cloudinary");
  }

  const data = (await response.json()) as CloudinaryUploadResult;
  return { url: data.secure_url, publicId: data.public_id };
}

/** Atajo para imágenes: `image/jpeg`, `image/png` o `image/webp`. */
export function uploadImageToCloudinary(file: File, folder: string): Promise<CloudinaryUpload> {
  return uploadToCloudinary(file, folder, "image");
}

export const PROJECT_MEDIA_FOLDER = "ariz/projects";
