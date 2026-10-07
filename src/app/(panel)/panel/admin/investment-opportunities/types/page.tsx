import Link from "next/link";
import { getAdminInvestmentTypes } from "@/features/investment-opportunities/api/server";
import { InvestmentTypeAdmin } from "@/features/investment-opportunities/components/investment-type-admin";

export default async function AdminInvestmentTypesPage() {
  const types = await getAdminInvestmentTypes();

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-6 overflow-x-hidden">
      <section className="rounded-card border border-edge bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Inversiones</p>
            <h1 className="mt-1 font-display text-2xl font-black text-brand sm:text-3xl">
              Tipos de inversión
            </h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-5 text-muted">
              Mantén las categorías desde el admin para que el frontend no tenga textos fijos.
            </p>
          </div>
          <div className="inline-flex rounded-card border border-edge bg-surface-muted p-1">
            <Link href="/panel/admin/investment-opportunities" className="rounded-card px-3 py-2 text-sm font-bold text-muted hover:text-brand">
              Oportunidades
            </Link>
            <Link href="/panel/admin/investment-opportunities/types" className="rounded-card bg-brand px-3 py-2 text-sm font-bold text-on-brand">
              Tipos
            </Link>
          </div>
        </div>
      </section>

      <InvestmentTypeAdmin types={types} />
    </div>
  );
}
