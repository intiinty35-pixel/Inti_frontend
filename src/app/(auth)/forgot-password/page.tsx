import type { Metadata } from "next";
import { AuthEyebrow, AuthShell, AuthSubtitle, AuthTitle } from "@/features/auth";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { ROUTES } from "@/shared/config/routes";
import { buildMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Recuperar contraseña",
  description: "Recupera el acceso a tu cuenta de Ariz Proyectos.",
  path: ROUTES.forgotPassword,
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      headline="Recupera el acceso a tu cuenta."
      description="Te enviaremos un enlace seguro a tu correo para crear una contraseña nueva."
      centeredBackground
      showCardLogo
    >
      <div className="flex flex-col items-center text-center">
        <AuthEyebrow>RECUPERAR ACCESO</AuthEyebrow>
        <AuthTitle>¿Olvidaste tu contraseña?</AuthTitle>
        <AuthSubtitle>Escribe el correo de tu cuenta y te enviaremos un enlace. Vence en 15 minutos.</AuthSubtitle>
      </div>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
