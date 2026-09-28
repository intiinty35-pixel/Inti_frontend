"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Checkbox, Input } from "@/shared/ui";
import { getHomeRoute, ROUTES } from "@/shared/config/routes";
import { AuthAlert } from "@/features/auth/components/auth-shell";
<<<<<<< HEAD
import { AuthRequestError, login } from "@/features/auth/api/client";
=======
import { AuthRequestError, login, loginWithGoogle } from "@/features/auth/api/client";
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a

export interface LoginFormProps {
  next?: string;
}

function isSafePath(path: string | undefined): path is string {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setErrors([]);
    setLoading(true);

    try {
      const user = await login({
        email: String(form.get("email") ?? "").trim(),
        password: String(form.get("password") ?? ""),
        rememberMe: form.get("rememberMe") === "on",
      });

      router.push(isSafePath(next) ? next : getHomeRoute(user.role));
      router.refresh();
    } catch (error) {
      setErrors(error instanceof AuthRequestError ? error.messages : ["Ocurrió un error inesperado."]);
      setLoading(false);
    }
  }

<<<<<<< HEAD
=======
  async function handleGoogleLogin() {
    setErrors([]);
    setLoading(true);

    try {
      const user = await loginWithGoogle();
      router.push(isSafePath(next) ? next : getHomeRoute(user.role));
      router.refresh();
    } catch (error) {
      setErrors(error instanceof AuthRequestError ? error.messages : ["Ocurrió un error inesperado."]);
      setLoading(false);
    }
  }

>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        name="email"
        type="email"
        label="Correo"
        placeholder="correo@ejemplo.com"
        autoComplete="email"
        required
      />
      <Input
        name="password"
        type="password"
        label="Contraseña"
        autoComplete="current-password"
        required
      />
      <div className="flex items-center justify-between">
        <Checkbox name="rememberMe" label="Recordarme" />
        <span
          className="cursor-not-allowed text-[11px] font-semibold text-brand/60"
          title="Disponible próximamente"
        >
          ¿Olvidaste tu contraseña?
        </span>
      </div>
      <AuthAlert messages={errors} />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </Button>

      <div className="flex items-center gap-3 text-[10px] text-muted" aria-hidden>
        <span className="h-px flex-1 bg-edge" />o<span className="h-px flex-1 bg-edge" />
      </div>

      <Button
<<<<<<< HEAD
        variant="secondary"
        size="lg"
        className="w-full"
        disabled
        title="Disponible próximamente"
=======
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        disabled={loading}
        onClick={handleGoogleLogin}
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
      >
        <span aria-hidden className="text-base font-bold text-info">
          G
        </span>
        Continuar con Google
      </Button>

      <p className="text-center text-[11px] text-muted">
        ¿Aún no tienes cuenta?{" "}
        <Link href={ROUTES.register} className="font-bold text-brand">
          Registrarse
        </Link>
      </p>
    </form>
  );
}
