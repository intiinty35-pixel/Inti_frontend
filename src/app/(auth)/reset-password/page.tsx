import type { Metadata } from "next";
import { AuthEyebrow, AuthShell, AuthSubtitle, AuthTitle } from "@/features/auth";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { ROUTES } from "@/shared/config/routes";
import { buildMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Crear contraseña nueva",
  description: "Elige una contraseña nueva para tu cuenta de Inti Proyectos.",
  path: ROUTES.resetPassword,
  noIndex: true,
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthShell
      headline="Elige una contraseña nueva."
      description="Usa una contraseña que no hayas usado antes en otros sitios."
      centeredBackground
      showCardLogo
    >
      <div className="flex flex-col items-center text-center">
        <AuthEyebrow>CONTRASEÑA NUEVA</AuthEyebrow>
        <AuthTitle>Crea tu nueva contraseña</AuthTitle>
        <AuthSubtitle>Escríbela dos veces para confirmarla.</AuthSubtitle>
      </div>
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
