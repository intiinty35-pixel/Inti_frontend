import { InvestmentsExperience } from "@/app/(public)/inversiones/investments-experience";
import { ROUTES } from "@/shared/config/routes";
import { buildMetadata } from "@/shared/lib/seo";
import {
  getPublicInvestmentOpportunities,
  getPublicInvestmentTypes,
} from "@/features/investment-opportunities/api/server";
import type { InvestmentOpportunity, InvestmentType } from "@/features/investment-opportunities/types";

export const metadata = buildMetadata({
  title: "Inversion Ariz | Oportunidades inmobiliarias",
  description:
    "Evalua oportunidades de inversion inmobiliaria y contacta con un asesor de ARIZ.",
  path: ROUTES.investments,
  keywords: [
    "inversion inmobiliaria",
    "invertir en Tumbes",
    "plusvalia inmobiliaria",
    "oportunidades de inversion",
  ],
});

export default async function InvestmentsPage() {
  let opportunities: InvestmentOpportunity[] = [];
  let investmentTypes: InvestmentType[] = [];
  let loadError: string | undefined;
  try {
    [opportunities, investmentTypes] = await Promise.all([
      getPublicInvestmentOpportunities(),
      getPublicInvestmentTypes(),
    ]);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "No se pudieron cargar las oportunidades de inversión.";
  }
  return (
    <InvestmentsExperience
      opportunities={opportunities}
      investmentTypes={investmentTypes}
      loadError={loadError}
    />
  );
}
