"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { AuthAlert } from "@/features/auth/components/auth-shell";
import { AuthRequestError, requestPasswordReset } from "@/features/auth/api/client";

export function ForgotPasswordForm() {
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();

    setErrors([]);
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSentTo(email);
    } catch (error) {
      setErrors(error instanceof AuthRequestError ? error.messages : ["Ocurrió un error inesperado."]);
    } finally {
      setLoading(false);
    }
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success/12 text-success">
          <MailCheck className="size-7" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-ink">Revisa tu correo</p>
        <p className="text-xs leading-6 text-muted">
          Enviamos un enlace a <span className="font-semibold text-ink">{sentTo}</span> para crear una contraseña
          nueva. El enlace vence en <strong>15 minutos</strong>. Si no lo ves, revisa la carpeta de spam.
        </p>
        <Link href={ROUTES.login} className="text-xs font-bold text-brand">
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
      <Input
        name="email"
        type="email"
        label="Correo"
        placeholder="correo@ejemplo.com"
        autoComplete="email"
        required
        className="border-[#8793ad] bg-surface-muted"
      />
      <AuthAlert messages={errors} />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Enviando..." : "Enviar enlace"}
      </Button>
      <p className="text-center text-[11px] text-muted">
        <Link href={ROUTES.login} className="font-bold text-brand">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
