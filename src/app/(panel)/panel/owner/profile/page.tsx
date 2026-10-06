import { Card, CardContent } from "@/shared/ui";
import { getMyProfile } from "@/features/owner/api/server";
import { ProfileForm } from "@/features/owner/components/profile-form";
import { PageBanner } from "@/features/owner/components/dashboard-ui";

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
      <PageBanner
        eyebrow="Cuenta profesional"
        title={displayName}
        description={`${TYPE_LABELS[profile.type] ?? profile.type} · Esta información aparecerá en tus propiedades y proyectos publicados.`}
        icon={
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-brand font-display text-2xl font-black text-on-brand">
            {initial}
          </span>
        }
      />

      <Card className="overflow-hidden border-edge">
        <div className="h-1 bg-brand" aria-hidden />
        <CardContent className="pt-6">
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
