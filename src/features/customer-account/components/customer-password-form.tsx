"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import { ApiError } from "@/shared/lib/api/client";
import { changeCustomerPassword } from "@/features/customer-account/api/client";
import { PASSWORD_MESSAGE, PASSWORD_PATTERN } from "@/features/auth/lib/password";

export function CustomerPasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError("");
    setSaved(false);
    const form = new FormData(formElement);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (!new RegExp(`^(?:${PASSWORD_PATTERN})$`).test(newPassword)) {
      setError(PASSWORD_MESSAGE);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    setSaving(true);
    try {
      await changeCustomerPassword({ currentPassword, newPassword });
      formElement.reset();
      setSaved(true);
    } catch (passwordError) {
      setError(
        passwordError instanceof ApiError
          ? passwordError.message
          : "No se pudo actualizar la contraseña. Inténtalo de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
      <Input
        name="currentPassword"
        label="Contraseña actual"
        type={showCurrent ? "text" : "password"}
        autoComplete="current-password"
        required
        trailing={
          <button
            type="button"
            aria-label={showCurrent ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShowCurrent((current) => !current)}
            className="px-3 text-muted hover:text-brand"
          >
            {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
      />
      <Input
        name="newPassword"
        label="Nueva contraseña"
        type={showNew ? "text" : "password"}
        autoComplete="new-password"
        required
        pattern={PASSWORD_PATTERN}
        hint={PASSWORD_MESSAGE}
        trailing={
          <button
            type="button"
            aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShowNew((current) => !current)}
            className="px-3 text-muted hover:text-brand"
          >
            {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
      />
      <Input
        name="confirmPassword"
        label="Confirmar contraseña nueva"
        type={showNew ? "text" : "password"}
        autoComplete="new-password"
        required
      />
      {error ? <p role="alert" className="text-sm font-medium text-error">{error}</p> : null}
      {saved ? <p role="status" className="text-sm font-medium text-success">Contraseña actualizada.</p> : null}
      <div>
        <Button type="submit" disabled={saving}>
          {saving ? "Actualizando..." : "Cambiar contraseña"}
        </Button>
      </div>
    </form>
  );
}
