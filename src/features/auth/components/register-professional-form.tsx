"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Checkbox, Input } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { getHomeRoute, ROUTES } from "@/shared/config/routes";
import { AuthAlert } from "@/features/auth/components/auth-shell";
import {
  AuthRequestError,
  registerProfessional,
  type ProfessionalType,
} from "@/features/auth/api/client";
import { PASSWORD_MESSAGE, PASSWORD_PATTERN } from "@/features/auth/lib/password";

const TYPES: readonly { value: ProfessionalType; label: string }[] = [
  { value: "INDEPENDENT_AGENT", label: "Agente independiente" },
  { value: "REAL_ESTATE_AGENCY", label: "Inmobiliaria" },
  { value: "DEVELOPER", label: "Desarrolladora" },
];

function optional(form: FormData, name: string): string | undefined {
  const value = String(form.get(name) ?? "").trim();
  return value === "" ? undefined : value;
}

export function RegisterProfessionalForm() {
  const router = useRouter();
  const [type, setType] = useState<ProfessionalType>("INDEPENDENT_AGENT");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const isPerson = type === "INDEPENDENT_AGENT";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setErrors([]);
    setLoading(true);

    try {
      const user = await registerProfessional({
        type,
        firstName: isPerson ? optional(form, "firstName") : undefined,
        lastName: isPerson ? optional(form, "lastName") : undefined,
        dni: isPerson ? optional(form, "dni") : undefined,
        businessName: isPerson ? undefined : optional(form, "businessName"),
        ruc: isPerson ? undefined : optional(form, "ruc"),
        email: String(form.get("email") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim(),
        whatsapp: String(form.get("whatsapp") ?? "").trim(),
        city: String(form.get("city") ?? "").trim(),
        districts: isPerson ? optional(form, "districts") : undefined,
        address: isPerson ? undefined : optional(form, "address"),
        website: optional(form, "website"),
        socialLinks: optional(form, "socialLinks"),
        password: String(form.get("password") ?? ""),
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
      <div role="radiogroup" aria-label="Tipo de profesional" className="grid grid-cols-3 gap-2">
        {TYPES.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={type === option.value}
            onClick={() => setType(option.value)}
            className={cn(
              "h-11 rounded-card border px-2 text-xs font-bold transition-colors",
              type === option.value
                ? "border-brand bg-brand-soft text-brand"
                : "border-edge bg-surface text-muted hover:border-brand/50",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div
        aria-disabled
        title="Disponible próximamente"
        className="flex size-24 cursor-not-allowed items-center justify-center rounded-card border border-dashed border-edge bg-surface-muted p-2 text-center text-[10px] text-muted"
      >
        {isPerson ? "Agregar foto profesional" : "Agregar logo"}
      </div>

      <div key={type} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isPerson ? (
          <>
            <Input name="firstName" label="Nombre" autoComplete="given-name" required />
            <Input name="lastName" label="Apellido" autoComplete="family-name" required />
            <Input
              name="dni"
              label="DNI"
              inputMode="numeric"
              pattern="[0-9]{8}"
              title="El DNI debe tener 8 dígitos"
              required
            />
            <Input name="email" type="email" label="Correo" autoComplete="email" required />
          </>
        ) : (
          <>
            <Input name="businessName" label="Razón social / Nombre comercial" required />
            <Input
              name="ruc"
              label="RUC"
              inputMode="numeric"
              pattern="[0-9]{11}"
              title="El RUC debe tener 11 dígitos"
              required
            />
            <Input
              name="email"
              type="email"
              label="Correo empresarial"
              autoComplete="email"
              required
            />
          </>
        )}
        <Input name="phone" type="tel" label="Teléfono" autoComplete="tel" minLength={7} required />
        <Input name="whatsapp" type="tel" label="WhatsApp" minLength={7} required />
        <Input name="city" label="Ciudad" defaultValue="Lima" required />
        {isPerson ? (
          <Input name="districts" label="Distritos donde trabaja" />
        ) : (
          <Input name="address" label="Dirección" />
        )}
        <Input name="website" label="Sitio web" />
        <Input name="socialLinks" label="Redes sociales" />
        <Input
          name="password"
          type="password"
          label="Contraseña"
          autoComplete="new-password"
          pattern={PASSWORD_PATTERN}
          title={PASSWORD_MESSAGE}
          required
        />
      </div>

      <Checkbox
        name="acceptTerms"
        label="Acepto los términos, condiciones y política de privacidad."
        required
      />
      <AuthAlert messages={errors} />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Creando cuenta..." : "Crear cuenta profesional"}
      </Button>
      <p className="text-center text-[11px] text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href={ROUTES.login} className="font-bold text-brand">
          Iniciar sesión profesional
        </Link>
      </p>
    </form>
  );
}
