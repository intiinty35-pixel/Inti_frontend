import { ShieldCheck, UserRound } from "lucide-react";
import { Card, CardContent } from "@/shared/ui";
import { getMyProfile } from "@/features/owner/api/server";
import { OwnerPasswordForm } from "@/features/owner/components/owner-password-form";
import { ProfileForm } from "@/features/owner/components/profile-form";
import { PageBanner } from "@/features/owner/components/dashboard-ui";

const TYPE_LABELS: Record<string, string> = {
  INDEPENDENT_AGENT: "Agente independiente",
  REAL_ESTATE_AGENCY: "Inmobiliaria",
  DEVELOPER: "Desarrolladora",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

export default async function OwnerProfilePage() {
  const profile = await getMyProfile();
  const displayName = (profile.businessName ?? `${profile.user.firstName} ${profile.user.lastName ?? ""}`).trim();
  const avatarUrl = profile.user.avatarUrl;
  const initial = displayName.charAt(0).toUpperCase() || "A";

  return (
    <div className="flex flex-col gap-6">
      <PageBanner
        eyebrow="Cuenta profesional"
        title="Mi perfil"
        description="Actualiza tu identidad profesional, datos de contacto, foto de perfil y contrasena de acceso."
        icon={
          avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="size-16 shrink-0 rounded-2xl object-cover ring-2 ring-white/70"
            />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-brand font-display text-2xl font-black text-on-brand">
              {initial}
            </span>
          )
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <UserRound className="size-5 text-brand" />
            <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-muted">Perfil</p>
            <p className="mt-1 text-lg font-black text-ink">{TYPE_LABELS[profile.type] ?? profile.type}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <ShieldCheck className="size-5 text-brand" />
            <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-muted">Estado</p>
            <p className="mt-1 text-lg font-black text-ink">{STATUS_LABELS[profile.status] ?? profile.status}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">Correo de acceso</p>
            <p className="mt-3 break-all text-lg font-black text-brand">{profile.user.email}</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="overflow-hidden border-edge">
          <div className="h-1 bg-brand" aria-hidden />
          <CardContent className="p-5 sm:p-6">
            <div className="mb-5">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">Informacion publica</p>
              <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-brand">Datos del perfil</h2>
              <p className="mt-1 text-sm text-muted">Esta informacion aparecera en tus propiedades y proyectos publicados.</p>
            </div>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>

        <Card className="h-max overflow-hidden border-edge">
          <div className="h-1 bg-accent" aria-hidden />
          <CardContent className="p-5 sm:p-6">
            <div className="mb-5">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">Seguridad</p>
              <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-brand">Cambiar contrasena</h2>
              <p className="mt-1 text-sm text-muted">Actualiza tu contrasena para mantener protegida tu cuenta.</p>
            </div>
            <OwnerPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
