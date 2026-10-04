import Link from "next/link";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { InvestmentOpportunityAdminList } from "@/features/investment-opportunities/components/investment-opportunity-admin-list";
import { getAdminInvestmentOpportunities } from "@/features/investment-opportunities/api/server";

export default async function AdminInvestmentOpportunitiesPage() {
  const opportunities = await getAdminInvestmentOpportunities();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader
          eyebrow="Contenido público"
          title="Proyectos de inversión"
          description="Configura imágenes, datos de inversión, descripción detallada y ubicación exacta para la página de inversiones."
        />
        <Link href="/panel/admin/investment-opportunities/new" className="mb-6 inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-brand px-5 text-sm font-black text-on-brand sm:mb-0">
          Crear proyecto de inversión
        </Link>
      </div>
      <InvestmentOpportunityAdminList opportunities={opportunities} />
    </div>
  );
}
