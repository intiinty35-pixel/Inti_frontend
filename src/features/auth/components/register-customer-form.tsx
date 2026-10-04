"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button, Checkbox, Input } from "@/shared/ui";
import { getAuthenticatedLandingRoute, ROUTES } from "@/shared/config/routes";
import { AuthAlert } from "@/features/auth/components/auth-shell";
import { AuthRequestError, registerCustomer } from "@/features/auth/api/client";
import { PASSWORD_MESSAGE, PASSWORD_PATTERN } from "@/features/auth/lib/password";

type CustomerField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "password"
  | "confirmPassword"
  | "acceptTerms";

type CustomerFieldErrors = Partial<Record<CustomerField, string>>;

export function RegisterCustomerForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<CustomerFieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function clearFieldError(field: CustomerField) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setErrors([]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("firstName") ?? "").trim();
    const lastName = String(form.get("lastName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    const acceptTerms = form.get("acceptTerms") === "on";
    const nextErrors: CustomerFieldErrors = {};

    if (!firstName) nextErrors.firstName = "Escribe tu nombre.";
    if (!lastName) nextErrors.lastName = "Escribe tu apellido.";
    if (!email) {
      nextErrors.email = "Escribe tu correo.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Ingresa un correo válido, por ejemplo nombre@correo.com.";
    }
    if (!phone) {
      nextErrors.phone = "Escribe tu teléfono.";
    } else if (phone.replace(/\D/g, "").length < 7) {
      nextErrors.phone = "El teléfono debe tener al menos 7 dígitos.";
    }
    if (!password) {
      nextErrors.password = "Crea una contraseña.";
    } else if (!new RegExp(`^(?:${PASSWORD_PATTERN})$`).test(password)) {
      nextErrors.password = PASSWORD_MESSAGE;
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirma tu contraseña.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Las contraseñas no coinciden.";
    }
    if (!acceptTerms) {
      nextErrors.acceptTerms = "Debes aceptar los términos y la política de privacidad.";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(["Revisa los campos señalados antes de continuar."]);
      return;
    }

    setErrors([]);
    setLoading(true);

    try {
      const user = await registerCustomer({
        firstName,
        lastName,
        email,
        phone,
        password,
        acceptTerms,
      });

      router.push(getAuthenticatedLandingRoute(user.role));
      router.refresh();
    } catch (error) {
      setErrors(error instanceof AuthRequestError ? error.messages : ["Ocurrió un error inesperado."]);
      setLoading(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          name="firstName"
          label="Nombre"
          autoComplete="given-name"
          required
          error={fieldErrors.firstName}
          onChange={() => clearFieldError("firstName")}
        />
        <Input
          name="lastName"
          label="Apellido"
          autoComplete="family-name"
          required
          error={fieldErrors.lastName}
          onChange={() => clearFieldError("lastName")}
        />
        <Input
          name="email"
          type="email"
          label="Correo"
          autoComplete="email"
          required
          error={fieldErrors.email}
          onChange={() => clearFieldError("email")}
        />
        <Input
          name="phone"
          type="tel"
          label="Teléfono"
          autoComplete="tel"
          minLength={7}
          required
          error={fieldErrors.phone}
          onChange={() => clearFieldError("phone")}
        />
        <Input
          name="password"
          type={showPassword ? "text" : "password"}
          label="Contraseña"
          hint={PASSWORD_MESSAGE}
          autoComplete="new-password"
          pattern={PASSWORD_PATTERN}
          title={PASSWORD_MESSAGE}
          required
          error={fieldErrors.password}
          containerClassName="border-edge bg-surface focus-within:ring-2 focus-within:ring-brand/20"
          trailing={
            <button
              type="button"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowPassword((visible) => !visible)}
              className="flex h-full items-center justify-center px-3 text-muted transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
          onChange={() => {
            clearFieldError("password");
            clearFieldError("confirmPassword");
          }}
        />
        <Input
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          label="Confirmar contraseña"
          autoComplete="new-password"
          required
          error={fieldErrors.confirmPassword}
          containerClassName="border-edge bg-surface focus-within:ring-2 focus-within:ring-brand/20"
          trailing={
            <button
              type="button"
              aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              className="flex h-full items-center justify-center px-3 text-muted transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
          onChange={() => clearFieldError("confirmPassword")}
        />
      </div>
      <div>
        <Checkbox
          name="acceptTerms"
          label="Acepto los términos y condiciones y la política de privacidad."
          required
          aria-invalid={Boolean(fieldErrors.acceptTerms)}
          aria-describedby={fieldErrors.acceptTerms ? "accept-terms-error" : undefined}
          className="size-4 rounded border-edge focus-visible:outline-2 focus-visible:outline-brand"
          onChange={() => clearFieldError("acceptTerms")}
        />
        {fieldErrors.acceptTerms ? (
          <p id="accept-terms-error" className="mt-1 text-xs font-medium text-error">
            {fieldErrors.acceptTerms}
          </p>
        ) : null}
      </div>
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
