"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Checkbox, Input } from "@/shared/ui";
import { getHomeRoute, ROUTES } from "@/shared/config/routes";
import { AuthAlert } from "@/features/auth/components/auth-shell";
import { AuthRequestError, registerCustomer } from "@/features/auth/api/client";
import { PASSWORD_MESSAGE, PASSWORD_PATTERN } from "@/features/auth/lib/password";

export function RegisterCustomerForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");

    if (password !== String(form.get("confirmPassword") ?? "")) {
      setErrors(["Las contraseñas no coinciden."]);
      return;
    }

    setErrors([]);
    setLoading(true);

    try {
      const user = await registerCustomer({
        firstName: String(form.get("firstName") ?? "").trim(),
        lastName: String(form.get("lastName") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim(),
        password,
        acceptTerms: form.get("acceptTerms") === "on",
      });

      router.push(getHomeRoute(user.role));
      router.refresh();
    } catch (error) {
      setErrors(error instanceof AuthRequestError ? error.messages : ["Ocurrió un error inesperado."]);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input name="firstName" label="Nombre" autoComplete="given-name" required />
        <Input name="lastName" label="Apellido" autoComplete="family-name" required />
        <Input name="email" type="email" label="Correo" autoComplete="email" required />
        <Input name="phone" type="tel" label="Teléfono" autoComplete="tel" minLength={7} required />
        <Input
          name="password"
          type="password"
          label="Contraseña"
          autoComplete="new-password"
          pattern={PASSWORD_PATTERN}
          title={PASSWORD_MESSAGE}
          required
        />
        <Input
          name="confirmPassword"
          type="password"
          label="Confirmar contraseña"
          autoComplete="new-password"
          required
        />
      </div>
      <Checkbox
        name="acceptTerms"
        label="Acepto los términos y condiciones y la política de privacidad."
        required
      />
      <AuthAlert messages={errors} />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
      <p className="text-center text-[11px] text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href={ROUTES.login} className="font-bold text-brand">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
