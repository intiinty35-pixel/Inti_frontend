"use client";

import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { CampaignForm } from "@/features/admin/components/campaign-form";
import { updateCampaign, listArizProjects, type Campaign } from "@/features/admin/api/campaigns-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/shared/lib/api/client";

export default function AdminEditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [arizProjects, setArizProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { id } = await params;
        const [campaignData, projectsData] = await Promise.all([
          apiClient.get<Campaign>(`/admin/campaigns/${encodeURIComponent(id)}`),
          listArizProjects(),
        ]);
        setCampaign(campaignData);
        setArizProjects(projectsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar la campaña");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params]);

  async function handleSubmit(input: Parameters<typeof updateCampaign>[1]) {
    if (!campaign) return;
    try {
      await updateCampaign(campaign.id, input);
      router.push("/panel/admin/campaigns");
      router.refresh();
    } catch {
      throw new Error("No se pudo actualizar la campaña. Intenta nuevamente.");
    }
  }

  async function handleCopyCode() {
    if (!campaign?.code) return;
    try {
      await navigator.clipboard.writeText(campaign.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex min-w-0 max-w-full flex-col gap-7 overflow-x-hidden">
        <div className="h-10 w-32 animate-pulse rounded-card bg-surface-muted" />
        <div className="h-48 animate-pulse rounded-card bg-surface" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex min-w-0 max-w-full flex-col gap-7 overflow-x-hidden">
        <Link
          href={ROUTES.panel.admin.campaigns}
          className="inline-flex w-fit items-center gap-2 text-sm font-bold text-brand hover:underline"
        >
          <ArrowLeft className="size-4" />
          Volver a campañas
        </Link>
        <div className="rounded-card border border-error/30 bg-error/10 p-6 text-center">
          <p className="text-sm font-bold text-error">
            {error || "No se encontró la campaña"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-7 overflow-x-hidden">
      <Link
        href={ROUTES.panel.admin.campaigns}
        className="inline-flex w-fit items-center gap-2 text-sm font-bold text-brand hover:underline"
      >
        <ArrowLeft className="size-4" />
        Volver a campañas
      </Link>

      <AdminPageHeader
        eyebrow="ArizClub"
        title={`Editar: ${campaign.name}`}
        description="Modifica los detalles de la campaña."
      />

      {campaign.code && (
        <div className="rounded-card border border-brand/20 bg-brand-soft p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            Código de campaña (para referentes)
          </p>
          <div className="mt-2 flex items-center gap-3">
            <code className="flex-1 rounded-md bg-white px-3 py-2 font-mono text-lg font-bold tracking-wider text-brand">
              {campaign.code}
            </code>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-card bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
            >
              {copied ? (
                <>
                  <Check className="size-4" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  Copiar
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <CampaignForm
        campaign={campaign}
        arizProjects={arizProjects}
        onSubmit={handleSubmit}
        mode="edit"
      />
    </div>
  );
}
