import Link from "next/link";
import { Plus, TrendingUp } from "lucide-react";
import { InvestmentOpportunityAdminList } from "@/features/investment-opportunities/components/investment-opportunity-admin-list";
import { getAdminInvestmentOpportunities } from "@/features/investment-opportunities/api/server";

export default async function AdminInvestmentOpportunitiesPage() {
  const opportunities = await getAdminInvestmentOpportunities();
  const published = opportunities.filter((item) => item.isPublished).length;

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-6 overflow-x-hidden">
      <section className="rounded-card border border-edge bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Contenido publico
            </p>
            <h1 className="mt-1 font-display text-2xl font-black text-brand sm:text-3xl">
              Proyectos de inversion
            </h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-5 text-muted">
              {opportunities.length} oportunidades registradas, {published} publicadas en la pagina
              de inversiones.
            </p>
          </div>
          <Link
            href="/panel/admin/investment-opportunities/new"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-card bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            <Plus className="size-4" />
            Crear proyecto
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-card border border-edge bg-surface px-5 py-4 text-center shadow-[var(--shadow-card)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Total</p>
          <p className="mt-2 font-display text-2xl font-black text-brand">{opportunities.length}</p>
          <p className="mt-1 text-xs font-semibold text-muted">Oportunidades creadas</p>
        </div>
        <div className="rounded-card border border-edge bg-surface px-5 py-4 text-center shadow-[var(--shadow-card)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Publicadas</p>
          <p className="mt-2 font-display text-2xl font-black text-brand">{published}</p>
          <p className="mt-1 text-xs font-semibold text-muted">Visibles al publico</p>
        </div>
        <div className="rounded-card border border-edge bg-surface px-5 py-4 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex size-8 items-center justify-center rounded-card bg-brand/10 text-brand">
            <TrendingUp className="size-4" />
          </div>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">Inversiones</p>
          <p className="mt-1 text-xs font-semibold text-muted">Contenido del portal publico</p>
        </div>
      </section>

      <InvestmentOpportunityAdminList opportunities={opportunities} />
    </div>
  );
}
