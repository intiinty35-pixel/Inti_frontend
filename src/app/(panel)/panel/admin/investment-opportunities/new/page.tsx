import { getAdminInvestmentTypes } from "@/features/investment-opportunities/api/server";
import { InvestmentOpportunityForm } from "@/features/investment-opportunities/components/investment-opportunity-form";

export default async function NewAdminInvestmentOpportunityPage() {
  const investmentTypes = await getAdminInvestmentTypes();

  return (
    <div className="flex flex-col gap-6">
      <header className="relative overflow-hidden rounded-card border border-edge bg-surface p-6 text-center shadow-[var(--shadow-card)] sm:p-7">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden="true" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">Contenido público</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-brand sm:text-3xl">Nuevo proyecto de inversión</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted">Agrega la información comercial, imágenes y punto exacto del mapa.</p>
      </header>
      <InvestmentOpportunityForm investmentTypes={investmentTypes} />
    </div>
  );
}
