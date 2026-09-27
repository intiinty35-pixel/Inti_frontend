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

export async function uploadPropertyImage(file: File): Promise<{ url: string; publicId: string }> {
  const signature = await apiClient.post<CloudinarySignature>("/media/cloudinary/signature", {
    folder: "ariz/properties",
  });
  const body = new FormData();
  body.set("file", file);
  body.set("api_key", signature.apiKey);
  body.set("timestamp", String(signature.timestamp));
  body.set("folder", signature.folder);
  body.set("signature", signature.signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    throw new Error("No se pudo subir la imagen a Cloudinary");
  }

  const data = (await response.json()) as CloudinaryUploadResult;
  return { url: data.secure_url, publicId: data.public_id };
}
