import { notFound } from "next/navigation";
import { backendFetch } from "@/shared/lib/api/server";
import { SitePlanEditor } from "@/features/projects/components/site-plan-editor";
import type { PlanSession } from "@/features/projects/types/site-plan";

export default async function SitePlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await backendFetch(
    `/admin/projects/${encodeURIComponent(id)}/site-plan`,
  );
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("No se pudo cargar el editor del plano.");
  return <SitePlanEditor initial={(await response.json()) as PlanSession} />;
}
