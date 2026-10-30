import type { Metadata } from "next";
import Link from "next/link";
import { Building, House } from "lucide-react";
import { redirect } from "next/navigation";
import {
  AuthEyebrow,
  AuthShell,
  AuthSubtitle,
  AuthTitle,
  getSession,
} from "@/features/auth";
import { getAuthenticatedLandingRoute, ROUTES } from "@/shared/config/routes";
import { buildMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Crear cuenta",
  description: "Crea tu cuenta en Inti Proyectos.",
  path: ROUTES.register,
});

const OPTIONS = [
  {
    href: ROUTES.registerCustomer,
    icon: <House className="size-5" aria-hidden />,
    title: "Eres dueño de propiedad",
    description: "Busca propiedades, guarda favoritos y recibe oportunidades según tus necesidades.",
    action: "Crear cuenta →",
  },
  {
    href: ROUTES.registerProfessional,
    icon: <Building className="size-5" aria-hidden />,
    title: "Publico propiedades",
    description: "Publica propiedades y proyectos, recibe contactos y administra tus anuncios.",
    action: "Crear cuenta profesional →",
  },
] as const;

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    redirect(getAuthenticatedLandingRoute(session.role));
  }

  return (
    <AuthShell
      headline="Encuentra oportunidades o haz crecer tu negocio."
      description="Elige el tipo de cuenta que mejor se adapte a lo que quieres hacer."
      sideImage="/web_v/register.png"
      cardWidth="md"
    >
      <AuthEyebrow>CREAR CUENTA</AuthEyebrow>
      <AuthTitle>¿Cómo quieres utilizar la plataforma?</AuthTitle>
      <AuthSubtitle>Podrás completar tu perfil después del registro.</AuthSubtitle>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {OPTIONS.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            className="group flex min-w-0 flex-col gap-3 rounded-xl border border-edge bg-white p-4 shadow-[0_5px_18px_rgb(11_20_55_/_0.04)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_12px_28px_rgb(11_20_55_/_0.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:p-5"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-accent/20">
              {option.icon}
            </span>
            <span className="text-sm font-black tracking-tight text-brand sm:text-base">{option.title}</span>
            <span className="flex-1 text-xs leading-relaxed text-muted sm:text-[13px]">
              {option.description}
            </span>
            <span className="mt-1 text-xs font-bold text-brand">{option.action}</span>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-center text-[11px] text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href={ROUTES.login} className="font-bold text-brand">
          Iniciar sesión
        </Link>
      </p>
    </AuthShell>
  );
}
