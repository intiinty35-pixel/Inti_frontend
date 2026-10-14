"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { AuthAlert } from "@/features/auth/components/auth-shell";
import { AuthRequestError, resetPassword } from "@/features/auth/api/client";
import { PASSWORD_MESSAGE, PASSWORD_PATTERN } from "@/features/auth/lib/password";

const TOGGLE_CLASS =
  "flex h-full items-center justify-center px-3 text-muted transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-brand";

export function ResetPasswordForm({ token }: { token: string | undefined }) {
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm font-semibold text-ink">Este enlace no es válido</p>
        <p className="text-xs leading-6 text-muted">
          Solicita un enlace nuevo para cambiar tu contraseña. Los enlaces duran 15 minutos.
        </p>
        <Link href={ROUTES.forgotPassword} className="text-xs font-bold text-brand">
          Solicitar enlace nuevo
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success/12 text-success">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-ink">Contraseña actualizada</p>
        <p className="text-xs leading-6 text-muted">Ya puedes iniciar sesión con tu contraseña nueva.</p>
        <Link href={ROUTES.login}>
          <Button type="button" size="lg">
            Iniciar sesión
          </Button>
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirmPassword") ?? "");

    if (!new RegExp(`^(?:${PASSWORD_PATTERN})$`).test(password)) {
      setErrors([PASSWORD_MESSAGE]);
      return;
    }
    if (password !== confirm) {
      setErrors(["Las contraseñas no coinciden."]);
      return;
    }

    setErrors([]);
    setLoading(true);
    try {
      await resetPassword(token as string, password);
      setDone(true);
    } catch (error) {
      setErrors(error instanceof AuthRequestError ? error.messages : ["Ocurrió un error inesperado."]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
      <Input
        name="password"
        type={showPassword ? "text" : "password"}
        label="Contraseña nueva"
        hint={PASSWORD_MESSAGE}
        autoComplete="new-password"
        required
        containerClassName="border-[#8793ad] bg-surface-muted"
        trailing={
          <button
            type="button"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShowPassword((current) => !current)}
            className={TOGGLE_CLASS}
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        }
      />
      <Input
        name="confirmPassword"
        type={showPassword ? "text" : "password"}
        label="Confirmar contraseña"
        autoComplete="new-password"
        required
        className="border-[#8793ad] bg-surface-muted"
      />
      <AuthAlert messages={errors} />
      {errors.some((message) => message.includes("venció")) ? (
        <Link href={ROUTES.forgotPassword} className="text-center text-xs font-bold text-brand">
          Solicitar enlace nuevo
        </Link>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Guardando..." : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
