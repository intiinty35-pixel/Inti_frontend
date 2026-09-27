import { Card, CardContent } from "@/shared/ui";
import { OwnerPageHeader } from "@/app/(panel)/panel/owner/owner-shell";
import { getMyProfile } from "@/features/owner/api/server";
import { ProfileForm } from "@/features/owner/components/profile-form";

export default async function OwnerProfilePage() {
  const profile = await getMyProfile();

  return (
    <div className="flex flex-col gap-6">
      <OwnerPageHeader eyebrow="Cuenta profesional" title="Mi perfil profesional" />
      <p className="-mt-4 text-sm text-muted">
        Esta información aparecerá en tus propiedades y proyectos publicados.
      </p>
      <Card>
        <CardContent className="pt-6">
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
