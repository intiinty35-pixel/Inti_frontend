import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AuthEyebrow,
  AuthShell,
  AuthSubtitle,
  AuthTitle,
  getSession,
} from "@/features/auth";
import { getHomeRoute, ROUTES } from "@/shared/config/routes";
import { buildMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Crear cuenta",
  description: "Crea tu cuenta en Ariz Proyectos.",
  path: ROUTES.register,
});

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 11 12 4l8 7v9H4z" strokeLinejoin="round" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" strokeLinecap="round" />
    </svg>
  );
}

const OPTIONS = [
  {
    href: ROUTES.registerCustomer,
    icon: <HomeIcon />,
    title: "Busco una propiedad",
    description: "Busca propiedades, guarda favoritos y recibe oportunidades según tus necesidades.",
    action: "Crear cuenta como comprador →",
  },
  {
    href: ROUTES.registerProfessional,
    icon: <BuildingIcon />,
    title: "Publico propiedades",
    description: "Publica propiedades y proyectos, recibe contactos y administra tus anuncios.",
    action: "Crear cuenta profesional →",
  },
] as const;

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    redirect(getHomeRoute(session.role));
  }

  return (
    <AuthShell
      headline="Encuentra oportunidades o haz crecer tu negocio."
      description="Elige el tipo de cuenta que mejor se adapte a lo que quieres hacer."
      cardWidth="md"
    >
      <AuthEyebrow>CREAR CUENTA</AuthEyebrow>
      <AuthTitle>¿Cómo quieres utilizar la plataforma?</AuthTitle>
      <AuthSubtitle>Podrás completar tu perfil después del registro.</AuthSubtitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {OPTIONS.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            className="group flex flex-col gap-3 rounded-card border border-edge p-4 transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-brand"
          >
            <span className="flex size-10 items-center justify-center rounded-card bg-brand-soft text-brand">
              {option.icon}
            </span>
            <span className="text-sm font-bold text-brand">{option.title}</span>
            <span className="flex-1 text-[11px] leading-relaxed text-muted">
              {option.description}
            </span>
            <span className="mt-2 text-[11px] font-bold text-brand">{option.action}</span>
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
