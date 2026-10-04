import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  AuthEyebrow,
  AuthShell,
  AuthSubtitle,
  AuthTitle,
  RegisterCustomerForm,
  getSession,
} from "@/features/auth";
import { getAuthenticatedLandingRoute, ROUTES } from "@/shared/config/routes";
import { buildMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Crear cuenta de comprador",
  description: "Guarda propiedades, crea alertas y organiza tus consultas.",
  path: ROUTES.registerCustomer,
});

export default async function RegisterCustomerPage() {
  const session = await getSession();

  if (session) {
    redirect(getAuthenticatedLandingRoute(session.role));
  }

  return (
    <AuthShell
      headline="Tu próxima propiedad comienza con una búsqueda mejor."
      description="Guarda propiedades, crea alertas y mantén tus consultas organizadas."
      sideImage="/web_v/register.png"
      cardWidth="md"
    >
      <AuthEyebrow>CUENTA COMPRADOR</AuthEyebrow>
      <AuthTitle>Crea tu cuenta</AuthTitle>
      <AuthSubtitle>Completa tu información básica.</AuthSubtitle>
      <RegisterCustomerForm />
    </AuthShell>
  );
}
