import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { InvestmentOpportunityForm } from "@/features/investment-opportunities/components/investment-opportunity-form";

export default function NewAdminInvestmentOpportunityPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Contenido público"
        title="Nuevo proyecto de inversión"
        description="Agrega la información comercial, imágenes y punto exacto del mapa."
      />
      <InvestmentOpportunityForm />
    </div>
  );
}
