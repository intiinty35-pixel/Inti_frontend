import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  AuthEyebrow,
  AuthShell,
  AuthSubtitle,
  AuthTitle,
  RegisterProfessionalForm,
  getSession,
} from "@/features/auth";
import { getHomeRoute, ROUTES } from "@/shared/config/routes";
import { buildMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Crear cuenta profesional",
  description: "Publica propiedades y proyectos con tu identidad profesional.",
  path: ROUTES.registerProfessional,
});

export default async function RegisterProfessionalPage() {
  const session = await getSession();

  if (session) {
    redirect(getHomeRoute(session.role));
  }

  return (
    <AuthShell
      headline="Herramientas para profesionales inmobiliarios."
      description="Crea tu identidad profesional y conecta tus futuras publicaciones con un único perfil."
      cardWidth="lg"
    >
      <AuthEyebrow>CUENTA PROFESIONAL</AuthEyebrow>
      <AuthTitle>¿Qué tipo de profesional eres?</AuthTitle>
      <AuthSubtitle>Tu perfil quedará pendiente de validación administrativa.</AuthSubtitle>
      <RegisterProfessionalForm />
    </AuthShell>
  );
}
