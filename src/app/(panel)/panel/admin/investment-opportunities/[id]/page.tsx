import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { getAdminInvestmentOpportunity, getAdminInvestmentTypes } from "@/features/investment-opportunities/api/server";
import { InvestmentOpportunityForm } from "@/features/investment-opportunities/components/investment-opportunity-form";

export default async function EditAdminInvestmentOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let opportunity;
  let investmentTypes;
  try {
    [opportunity, investmentTypes] = await Promise.all([
      getAdminInvestmentOpportunity(id),
      getAdminInvestmentTypes(),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message.includes("(404)")) notFound();
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Contenido público"
        title={`Editar: ${opportunity.name}`}
        description="Actualiza la ficha pública del proyecto de inversión."
      />
      <InvestmentOpportunityForm opportunity={opportunity} investmentTypes={investmentTypes} />
    </div>
  );
}
