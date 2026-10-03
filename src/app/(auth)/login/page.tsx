import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  AuthEyebrow,
  AuthShell,
  AuthSubtitle,
  AuthTitle,
  LoginForm,
  getSession,
} from "@/features/auth";
import { getHomeRoute, ROUTES } from "@/shared/config/routes";
import { buildMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de Ariz Proyectos.",
  path: ROUTES.login,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [session, { next }] = await Promise.all([getSession(), searchParams]);

  if (session) {
    redirect(getHomeRoute(session.role));
  }

  return (
    <AuthShell
      headline="Todo tu ecosistema inmobiliario en una sola cuenta."
      description="Accede a tus favoritos, consultas, publicaciones y herramientas profesionales."
      centeredBackground
      showCardLogo
    >
      <div className="flex flex-col items-center text-center">
        <AuthEyebrow>BIENVENIDO</AuthEyebrow>
        <AuthTitle>Iniciar sesión</AuthTitle>
        <AuthSubtitle>Ingresa con el correo asociado a tu cuenta.</AuthSubtitle>
      </div>
      <LoginForm next={next} />
    </AuthShell>
  );
}
