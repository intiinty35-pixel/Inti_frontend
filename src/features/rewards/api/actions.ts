"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/shared/lib/api/server";
import { ROUTES } from "@/shared/config/routes";

export async function createIncentive(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const promotion = String(formData.get("promotion") ?? "").trim();
  const pointsRequired = Number(formData.get("pointsRequired"));
  const stock = Number(formData.get("stock"));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const publicId = String(formData.get("publicId") ?? "").trim();

  if (!name || !description) {
    throw new Error("Nombre y descripción son obligatorios");
  }

  if (pointsRequired < 1) {
    throw new Error("Los puntos requeridos deben ser mayores a 0");
  }

  if (stock < 0) {
    throw new Error("El stock no puede ser negativo");
  }

  const response = await backendFetch("/admin/incentives", {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      promotion: promotion || undefined,
      pointsRequired,
      stock,
      imageUrl: imageUrl || undefined,
      publicId: publicId || undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error al crear incentivo" }));
    throw new Error(error.message || "Error al crear incentivo");
  }

  revalidatePath(ROUTES.panel.admin.incentives);
  return await response.json();
}

export async function updateIncentive(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const promotion = String(formData.get("promotion") ?? "").trim();
  const pointsRequired = Number(formData.get("pointsRequired"));
  const stock = Number(formData.get("stock"));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const publicId = String(formData.get("publicId") ?? "").trim();

  if (!name || !description) {
    throw new Error("Nombre y descripción son obligatorios");
  }

  if (pointsRequired < 1) {
    throw new Error("Los puntos requeridos deben ser mayores a 0");
  }

  if (stock < 0) {
    throw new Error("El stock no puede ser negativo");
  }

  const response = await backendFetch(`/admin/incentives/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name,
      description,
      promotion: promotion || undefined,
      pointsRequired,
      stock,
      imageUrl: imageUrl || undefined,
      publicId: publicId || undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error al actualizar incentivo" }));
    throw new Error(error.message || "Error al actualizar incentivo");
  }

  revalidatePath(ROUTES.panel.admin.incentives);
  revalidatePath(`${ROUTES.panel.admin.incentives}/${id}`);
  return await response.json();
}

export async function updateIncentiveStatus(id: string, status: "ACTIVE" | "INACTIVE") {
  const response = await backendFetch(`/admin/incentives/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar estado");
  }

  revalidatePath(ROUTES.panel.admin.incentives);
  revalidatePath(`${ROUTES.panel.admin.incentives}/${id}`);
  return await response.json();
}

export async function deleteIncentive(id: string) {
  const response = await backendFetch(`/admin/incentives/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error al eliminar incentivo" }));
    throw new Error(error.message || "Error al eliminar incentivo");
  }

  revalidatePath(ROUTES.panel.admin.incentives);
  return await response.json();
}

export async function approveRedemption(id: string) {
  const response = await backendFetch(`/admin/redemptions/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error al aprobar canje" }));
    throw new Error(error.message || "Error al aprobar canje");
  }

  revalidatePath(ROUTES.panel.admin.redemptions);
  revalidatePath(`${ROUTES.panel.admin.redemptions}/${id}`);
  return await response.json();
}

export async function rejectRedemption(id: string, reason?: string) {
  const response = await backendFetch(`/admin/redemptions/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error al rechazar canje" }));
    throw new Error(error.message || "Error al rechazar canje");
  }

  revalidatePath(ROUTES.panel.admin.redemptions);
  revalidatePath(`${ROUTES.panel.admin.redemptions}/${id}`);
  return await response.json();
}

export async function deliverRedemption(id: string) {
  const response = await backendFetch(`/admin/redemptions/${id}/deliver`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error al marcar como entregado" }));
    throw new Error(error.message || "Error al marcar como entregado");
  }

  revalidatePath(ROUTES.panel.admin.redemptions);
  revalidatePath(`${ROUTES.panel.admin.redemptions}/${id}`);
  return await response.json();
}
