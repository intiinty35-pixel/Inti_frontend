import { Card, CardContent } from "@/shared/ui";
import { getMyProfile } from "@/features/owner/api/server";
import { ProfileForm } from "@/features/owner/components/profile-form";

const TYPE_LABELS: Record<string, string> = {
  INDEPENDENT_AGENT: "Agente independiente",
  REAL_ESTATE_AGENCY: "Inmobiliaria",
  DEVELOPER: "Desarrolladora",
};

export default async function OwnerProfilePage() {
  const profile = await getMyProfile();
  const displayName = (profile.businessName ?? `${profile.user.firstName} ${profile.user.lastName ?? ""}`).trim();
  const initial = displayName.charAt(0).toUpperCase() || "A";

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-brand font-display text-2xl font-black text-on-brand">
            {initial}
          </span>
          <div>
            <p className="text-[11px] font-black tracking-[0.2em] text-accent uppercase">Cuenta profesional</p>
            <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-brand sm:text-4xl">
              {displayName}
            </h1>
            <p className="mt-2 text-sm font-medium text-muted">
              {TYPE_LABELS[profile.type] ?? profile.type} · Esta información aparecerá en tus propiedades y
              proyectos publicados.
            </p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-edge">
        <div className="h-1 bg-brand" aria-hidden />
        <CardContent className="pt-6">
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
