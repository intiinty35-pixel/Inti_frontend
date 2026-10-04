import {
  AtSign,
  ContactRound,
  KeyRound,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { CustomerPasswordForm } from "@/features/customer-account/components/customer-password-form";
import { CustomerProfileForm } from "@/features/customer-account/components/customer-profile-form";
import { getCustomerProfile } from "@/features/customer-account/api/server";

export default async function PanelClientProfilePage() {
  const profile = await getCustomerProfile();
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="relative overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden />
        <div className="flex min-w-0 items-start gap-4 p-6 sm:items-center sm:p-8">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand sm:size-14">
            <UserRound className="size-6 sm:size-7" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
              Configuración de cuenta
            </p>
            <h1 className="mt-1 break-words font-display text-3xl font-black tracking-tight text-brand sm:text-4xl">
              Mi perfil
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Administra tus datos, agrega una foto y mantén segura tu cuenta ARIZ.
            </p>
          </div>
        </div>
      </header>

      <section aria-label="Resumen del perfil" className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="relative min-w-0 overflow-hidden rounded-card border border-edge bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
          <span className="absolute inset-x-0 top-0 h-1 bg-accent" aria-hidden />
          <div className="flex items-center gap-2 text-muted">
            <ContactRound className="size-4 shrink-0" aria-hidden />
            <p className="text-[11px] font-black tracking-wide uppercase">Nombre de cuenta</p>
          </div>
          <p className="mt-2 break-words font-display text-xl font-black text-brand">{fullName}</p>
          <p className="mt-1 text-xs text-muted">Así te identificarán en ARIZ</p>
        </div>
        <div className="relative min-w-0 overflow-hidden rounded-card border border-edge bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
          <span className="absolute inset-x-0 top-0 h-1 bg-brand" aria-hidden />
          <div className="flex items-center gap-2 text-muted">
            <AtSign className="size-4 shrink-0" aria-hidden />
            <p className="text-[11px] font-black tracking-wide uppercase">Correo de acceso</p>
          </div>
          <p className="mt-2 break-all text-base font-bold text-brand">{profile.email}</p>
          <p className="mt-1 text-xs text-muted">Se usa para iniciar sesión</p>
        </div>
        <div className="relative min-w-0 overflow-hidden rounded-card border border-edge bg-surface px-5 py-4 shadow-[var(--shadow-card)] sm:col-span-2 xl:col-span-1">
          <span className="absolute inset-x-0 top-0 h-1 bg-success" aria-hidden />
          <div className="flex items-center gap-2 text-muted">
            <ShieldCheck className="size-4 shrink-0" aria-hidden />
            <p className="text-[11px] font-black tracking-wide uppercase">Seguridad</p>
          </div>
          <p className="mt-2 font-display text-xl font-black text-brand">Protege tu cuenta</p>
          <p className="mt-1 text-xs text-muted">Actualiza tu contraseña cuando lo necesites</p>
        </div>
      </section>

      <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
        <Card className="min-w-0 overflow-hidden">
          <div className="h-1.5 bg-accent" aria-hidden />
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <UserRound className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <CardTitle>Datos personales</CardTitle>
                <p className="mt-1 text-sm text-muted">
                  Completa tu información para que puedan reconocerte y contactarte.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CustomerProfileForm profile={profile} />
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <div className="h-1.5 bg-brand" aria-hidden />
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <KeyRound className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <CardTitle>Seguridad</CardTitle>
                <p className="mt-1 text-sm text-muted">Cambia tu contraseña de acceso.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CustomerPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
