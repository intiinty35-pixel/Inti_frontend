import { InvestmentsExperience } from "@/app/(public)/inversiones/investments-experience";
import { ROUTES } from "@/shared/config/routes";
import { buildMetadata } from "@/shared/lib/seo";
import { getPublicInvestmentOpportunities } from "@/features/investment-opportunities/api/server";
import type { InvestmentOpportunity } from "@/features/investment-opportunities/types";

export const metadata = buildMetadata({
  title: "Inversion Ariz | Oportunidades inmobiliarias",
  description:
    "Simula tu inversion inmobiliaria, revisa oportunidades exclusivas y contacta con un asesor de ARIZ.",
  path: ROUTES.investments,
  keywords: [
    "inversion inmobiliaria",
    "Ariz Invest Club",
    "invertir en Tumbes",
    "plusvalia inmobiliaria",
    "oportunidades de inversion",
  ],
});

export default async function InvestmentsPage() {
  let opportunities: InvestmentOpportunity[] = [];
  let loadError: string | undefined;
  try {
    opportunities = await getPublicInvestmentOpportunities();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "No se pudieron cargar las oportunidades de inversión.";
  }
  return <InvestmentsExperience opportunities={opportunities} loadError={loadError} />;
}
