"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteInvestmentOpportunity } from "@/features/investment-opportunities/api/client";
import { INVESTMENT_GOAL_LABELS, type InvestmentOpportunity } from "@/features/investment-opportunities/types";

export function InvestmentOpportunityAdminList({
  opportunities,
}: {
  opportunities: InvestmentOpportunity[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function remove(opportunity: InvestmentOpportunity) {
    if (!window.confirm(`¿Eliminar el proyecto de inversión "${opportunity.name}"?`)) return;
    setDeletingId(opportunity.id);
    setError("");
    try {
      await deleteInvestmentOpportunity(opportunity.id);
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el proyecto.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
      {opportunities.length ? opportunities.map((opportunity) => (
        <article key={opportunity.id} className="grid overflow-hidden rounded-2xl border border-edge bg-surface shadow-[var(--shadow-card)] sm:grid-cols-[220px_minmax(0,1fr)]">
          <div className="relative min-h-44 bg-surface-muted">
            <Image src={opportunity.coverImageUrl} alt={opportunity.name} fill sizes="220px" className="object-cover" />
          </div>
          <div className="flex min-w-0 flex-col justify-between gap-4 p-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-ink">{opportunity.name}</h2>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${opportunity.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-surface-muted text-muted"}`}>
                  {opportunity.isPublished ? "Publicado" : "Oculto"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{opportunity.location}</p>
              <p className="mt-3 text-sm text-ink">{opportunity.summary}</p>
              <p className="mt-3 text-xs font-bold text-muted">
                Desde S/ {opportunity.initialInvestment.toLocaleString("es-PE")} · ROI {opportunity.roiPercent}% · {INVESTMENT_GOAL_LABELS[opportunity.investmentGoal]}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/panel/admin/investment-opportunities/${opportunity.id}`} className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-bold text-on-brand">
                Editar
              </Link>
              {opportunity.isPublished ? (
                <Link href={`/inversiones/${opportunity.slug}`} target="_blank" className="inline-flex h-10 items-center rounded-lg border border-edge px-4 text-sm font-bold text-ink">
                  Ver público
                </Link>
              ) : null}
              <button type="button" disabled={deletingId === opportunity.id} onClick={() => void remove(opportunity)} className="inline-flex h-10 items-center rounded-lg border border-red-200 px-4 text-sm font-bold text-red-700 disabled:opacity-50">
                {deletingId === opportunity.id ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </article>
      )) : (
        <div className="rounded-2xl border border-dashed border-edge bg-surface p-10 text-center">
          <h2 className="font-display text-xl font-black text-brand">Aún no hay proyectos de inversión</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">Crea el primer proyecto para mostrarlo en la página pública de inversiones.</p>
        </div>
      )}
    </div>
  );
}
