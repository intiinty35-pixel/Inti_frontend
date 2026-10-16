"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/shared/lib/api/server";
import { ROUTES } from "@/shared/config/routes";

// Las fechas se eligen como dia calendario (hora de Lima, UTC-5): la promocion
// empieza a las 00:00 del primer dia y termina a las 23:59 del ultimo.
const LIMA_OFFSET = "-05:00";

async function readError(response: Response, fallback: string) {
  const error = await response.json().catch(() => ({ message: fallback }));
  return new Error(Array.isArray(error.message) ? error.message.join(", ") : error.message || fallback);
}

function readPromotionForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const publicId = String(formData.get("publicId") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");

  if (!title) throw new Error("El título es obligatorio");
  if (!imageUrl) throw new Error("Sube la imagen de la promoción");
  if (!startDate || !endDate) throw new Error("Indica desde y hasta cuándo se muestra");

  return {
    title,
    imageUrl,
    publicId: publicId || undefined,
    startsAt: `${startDate}T00:00:00${LIMA_OFFSET}`,
    endsAt: `${endDate}T23:59:59${LIMA_OFFSET}`,
  };
}

export async function createPromotion(formData: FormData) {
  const response = await backendFetch("/admin/promotions", {
    method: "POST",
    body: JSON.stringify(readPromotionForm(formData)),
  });

  if (!response.ok) throw await readError(response, "Error al crear la promoción");

  revalidatePath(ROUTES.panel.admin.promotions);
  revalidatePath("/");
}

export async function updatePromotion(id: string, formData: FormData) {
  const response = await backendFetch(`/admin/promotions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(readPromotionForm(formData)),
  });

  if (!response.ok) throw await readError(response, "Error al actualizar la promoción");

  revalidatePath(ROUTES.panel.admin.promotions);
  revalidatePath("/");
}

export async function setPromotionActive(id: string, isActive: boolean) {
  const response = await backendFetch(`/admin/promotions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
  if (!response.ok) throw await readError(response, "Error al actualizar la promoción");

  revalidatePath(ROUTES.panel.admin.promotions);
  revalidatePath("/");
}

export async function deletePromotion(id: string) {
  const response = await backendFetch(`/admin/promotions/${id}`, { method: "DELETE" });
  if (!response.ok) throw await readError(response, "Error al eliminar la promoción");

  revalidatePath(ROUTES.panel.admin.promotions);
  revalidatePath("/");
}
