import { notFound } from "next/navigation";
import { backendFetch } from "@/shared/lib/api/server";
import { SitePlanEditor } from "@/features/projects/components/site-plan-editor";
import { ApartmentPlanEditor } from "@/features/projects/components/apartment-plan-editor";
import type { PlanSession } from "@/features/projects/types/site-plan";

export default async function SitePlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { id } = await params;
  const response = await backendFetch(
    `/admin/projects/${encodeURIComponent(id)}/site-plan`,
  );
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("No se pudo cargar el editor del plano.");
  const query = await searchParams;
  const initial = (await response.json()) as PlanSession;
  const apartments = initial.project.category === "DEPARTAMENTOS" || (!initial.project.category && initial.plan.mode === "APARTMENTS");
  initial.plan = { ...initial.plan, mode: apartments ? "APARTMENTS" : "LOTS" };
  if (apartments && query.view === "environment") return <SitePlanEditor initial={initial} environmentOnly />;
  return apartments ? <ApartmentPlanEditor initial={initial} /> : <SitePlanEditor initial={initial} initialShowLots={query.view === 'lots'} />;
}
