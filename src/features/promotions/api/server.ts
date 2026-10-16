import { backendFetch } from "@/shared/lib/api/server";
import { env } from "@/shared/lib/env";
import type { AdminPromotion, CurrentPromotion } from "../types";

export async function listAdminPromotionsServer(): Promise<AdminPromotion[]> {
  try {
    const response = await backendFetch("/admin/promotions");
    if (!response.ok) return [];
    return (await response.json()) as AdminPromotion[];
  } catch {
    return [];
  }
}

/** Promociones vigentes ahora mismo. Ante cualquier error devuelve [] (el home muestra la imagen por defecto). */
export async function getCurrentPromotionsServer(): Promise<CurrentPromotion[]> {
  try {
    const response = await fetch(`${env.backendUrl}/promotions/current`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    return (await response.json()) as CurrentPromotion[];
  } catch {
    return [];
  }
}
