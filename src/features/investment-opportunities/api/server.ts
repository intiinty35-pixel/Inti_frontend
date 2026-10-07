import { backendFetch } from "@/shared/lib/api/server";
import { env } from "@/shared/lib/env";
import type { InvestmentOpportunity, InvestmentType } from "@/features/investment-opportunities/types";

export async function getPublicInvestmentOpportunities(): Promise<InvestmentOpportunity[]> {
  const response = await fetch(`${env.backendUrl}/investment-opportunities`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`No se pudieron cargar las oportunidades (${response.status})`);
  }
  return (await response.json()) as InvestmentOpportunity[];
}

export async function getPublicInvestmentOpportunity(
  slug: string,
): Promise<InvestmentOpportunity> {
  const response = await fetch(
    `${env.backendUrl}/investment-opportunities/${encodeURIComponent(slug)}`,
    { headers: { Accept: "application/json" }, cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error(`No se pudo cargar la oportunidad (${response.status})`);
  }
  return (await response.json()) as InvestmentOpportunity;
}

export async function getPublicInvestmentTypes(): Promise<InvestmentType[]> {
  const response = await fetch(`${env.backendUrl}/investment-opportunities/types`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`No se pudieron cargar los tipos de inversion (${response.status})`);
  }
  return (await response.json()) as InvestmentType[];
}

export async function getAdminInvestmentOpportunities(): Promise<InvestmentOpportunity[]> {
  const response = await backendFetch("/admin/investment-opportunities");
  if (!response.ok) {
    throw new Error(`No se pudieron cargar los proyectos de inversión (${response.status})`);
  }
  return (await response.json()) as InvestmentOpportunity[];
}

export async function getAdminInvestmentTypes(): Promise<InvestmentType[]> {
  const response = await backendFetch("/admin/investment-opportunities/types");
  if (!response.ok) {
    throw new Error(`No se pudieron cargar los tipos de inversion (${response.status})`);
  }
  return (await response.json()) as InvestmentType[];
}

export async function getAdminInvestmentOpportunity(
  id: string,
): Promise<InvestmentOpportunity> {
  const response = await backendFetch(
    `/admin/investment-opportunities/${encodeURIComponent(id)}`,
  );
  if (!response.ok) {
    throw new Error(`No se pudo cargar el proyecto de inversión (${response.status})`);
  }
  return (await response.json()) as InvestmentOpportunity;
}
