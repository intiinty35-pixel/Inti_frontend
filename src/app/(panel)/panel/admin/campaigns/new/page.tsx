"use client";

import Link from "next/link";
import { ArrowLeft, Copy, Check, PartyPopper } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { CampaignForm } from "@/features/admin/components/campaign-form";
import { createCampaign, type CreateCampaignInput, type UpdateCampaignInput } from "@/features/admin/api/campaigns-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/shared/lib/api/client";

export default function AdminNewCampaignPage() {
  const router = useRouter();
  const [arizProjects, setArizProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await apiClient.get<{ items: Array<{ id: string; name: string }> }>(
          "/admin/projects?pageSize=200"
        );
        const projects = response.items.map((p) => ({ id: p.id, name: p.name }));
        setArizProjects(projects);
      } catch {
        setArizProjects([]);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  async function handleSubmit(input: CreateCampaignInput | UpdateCampaignInput) {
    try {
      const result = await createCampaign(input as CreateCampaignInput);
      setCreatedCode(result.code);
    } catch {
      throw new Error("No se pudo crear la campaña. Intenta nuevamente.");
    }
  }

  async function handleCopyCode() {
    if (!createdCode) return;
    try {
      await navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  if (createdCode) {
    return (
      <div className="flex min-w-0 max-w-full flex-col gap-7 overflow-x-hidden">
        <Link
          href={ROUTES.panel.admin.campaigns}
          className="inline-flex w-fit items-center gap-2 text-sm font-bold text-brand hover:underline"
        >
          <ArrowLeft className="size-4" />
          Volver a campañas
        </Link>

        <div className="flex flex-col items-center justify-center rounded-card border border-success/30 bg-success/5 p-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-success/15">
            <PartyPopper className="size-8 text-success" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-black text-brand">
            ¡Campaña creada con éxito!
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted">
            Este es el código que los referentes usarán para asociar sus referidos a esta campaña:
          </p>
          
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="rounded-card border-2 border-dashed border-brand bg-brand-soft px-6 py-4">
              <p className="font-mono text-2xl font-black tracking-wider text-brand">
                {createdCode}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
            >
              {copied ? (
                <>
                  <Check className="size-4" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  Copiar código
                </>
              )}
            </button>
          </div>

          <div className="mt-8 flex gap-3">
            <Link
              href={ROUTES.panel.admin.campaigns}
              className="inline-flex h-10 items-center justify-center rounded-card border border-brand px-5 text-sm font-bold text-brand transition-colors hover:bg-brand hover:text-on-brand"
            >
              Ver todas las campañas
            </Link>
            <button
              type="button"
              onClick={() => setCreatedCode(null)}
              className="inline-flex h-10 items-center justify-center rounded-card bg-accent px-5 text-sm font-bold text-on-accent transition-colors hover:bg-accent-hover"
            >
              Crear otra campaña
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-w-0 max-w-full flex-col gap-7 overflow-x-hidden">
        <div className="h-10 w-32 animate-pulse rounded-card bg-surface-muted" />
        <div className="h-48 animate-pulse rounded-card bg-surface" />
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
        title="Nueva campaña"
        description="Crea una campaña y genera un código único para que los referentes lo usen al registrar referidos."
      />

      <CampaignForm
        arizProjects={arizProjects}
        onSubmit={handleSubmit}
        mode="create"
      />
    </div>
  );
}
