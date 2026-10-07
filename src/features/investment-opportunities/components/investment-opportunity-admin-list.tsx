"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, MapPin, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteInvestmentOpportunity } from "@/features/investment-opportunities/api/client";
import {
  INVESTMENT_GOAL_LABELS,
  type InvestmentOpportunity,
} from "@/features/investment-opportunities/types";

function formatMoney(value: number) {
  return `S/ ${value.toLocaleString("es-PE")}`;
}

export function InvestmentOpportunityAdminList({
  opportunities,
}: {
  opportunities: InvestmentOpportunity[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function remove(opportunity: InvestmentOpportunity) {
    if (!window.confirm(`Eliminar el proyecto de inversion "${opportunity.name}"?`)) return;
    setDeletingId(opportunity.id);
    setError("");
    try {
      await deleteInvestmentOpportunity(opportunity.id);
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el proyecto.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {error ? (
        <p role="alert" className="rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {opportunities.length ? (
        <div className="grid min-w-0 max-w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {opportunities.map((opportunity) => (
            <article
              key={opportunity.id}
              className="flex min-w-0 flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]"
            >
              <div className="relative h-36 bg-surface-muted">
                <Image
                  src={opportunity.coverImageUrl}
                  alt={opportunity.name}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <span
                  className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
                    opportunity.isPublished
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-white/90 text-muted"
                  }`}
                >
                  {opportunity.isPublished ? "Publicado" : "Oculto"}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-3.5">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                    {INVESTMENT_GOAL_LABELS[opportunity.investmentGoal]}
                  </p>
                  <h2 className="mt-1 line-clamp-2 text-base font-black leading-tight text-ink">
                    {opportunity.name}
                  </h2>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate">{opportunity.location}</span>
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">
                    {opportunity.summary}
                  </p>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 rounded-card bg-surface-muted px-3 py-2 text-center">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                      Desde
                    </p>
                    <p className="mt-1 text-sm font-black text-brand">
                      {formatMoney(opportunity.initialInvestment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                      ROI
                    </p>
                    <p className="mt-1 text-sm font-black text-brand">
                      {opportunity.roiPercent}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                  <Link
                    href={`/panel/admin/investment-opportunities/${opportunity.id}`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-card bg-brand px-3 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
                  >
                    <Pencil className="size-4" />
                    Editar
                  </Link>
                  <Link
                    href={`/inversiones/${opportunity.slug}`}
                    target="_blank"
                    aria-disabled={!opportunity.isPublished}
                    title="Ver publico"
                    className={`inline-flex size-9 items-center justify-center rounded-card border border-edge text-sm font-bold ${
                      opportunity.isPublished
                        ? "text-ink transition-colors hover:bg-surface-muted"
                        : "pointer-events-none text-muted opacity-50"
                    }`}
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                  <button
                    type="button"
                    disabled={deletingId === opportunity.id}
                    onClick={() => void remove(opportunity)}
                    title="Eliminar"
                    className="inline-flex size-9 items-center justify-center rounded-card border border-red-200 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-edge bg-surface p-8 text-center shadow-[var(--shadow-card)]">
          <h2 className="font-display text-xl font-black text-brand">
            Aun no hay proyectos de inversion
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Crea el primer proyecto para mostrarlo en la pagina publica de inversiones.
          </p>
        </div>
      )}
    </div>
  );
}
