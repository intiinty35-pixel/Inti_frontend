"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Checkbox, Input } from "@/shared/ui";
import { getHomeRoute, ROUTES } from "@/shared/config/routes";
import { AuthAlert } from "@/features/auth/components/auth-shell";
import { AuthRequestError, login, loginWithGoogle } from "@/features/auth/api/client";

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
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        name="email"
        type="email"
        label="Correo"
        placeholder="correo@ejemplo.com"
        autoComplete="email"
        required
        className="border-[#8793ad] bg-surface-muted"
      />
      <Input
        id="login-password"
        name="password"
        type={showPassword ? "text" : "password"}
        label="Contraseña"
        placeholder="*********"
        autoComplete="current-password"
        required
        containerClassName="border-[#8793ad] bg-surface-muted"
        trailing={
          <button
            type="button"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShowPassword((current) => !current)}
            className="flex h-full items-center justify-center bg-transparent px-3 text-muted transition-colors hover:text-brand"
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        }
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
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        disabled={loading}
        onClick={handleGoogleLogin}
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1c-.22-.66-.35-1.37-.35-2.1s.13-1.44.35-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.27c1.62 0 2.97.56 4.09 1.64l3.06-3.06C17.45 2.02 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.84C6.71 7.2 9.14 5.27 12 5.27Z"
          />
        </svg>
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
