"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import { PASSWORD_MESSAGE, PASSWORD_PATTERN } from "@/features/auth/lib/password";
import { OwnerRequestError, changeOwnerPassword } from "@/features/owner/api/client";

export function OwnerPasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    setError("");
    setSaved(false);

    if (!new RegExp(`^(?:${PASSWORD_PATTERN})$`).test(newPassword)) {
      setError(PASSWORD_MESSAGE);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("La nueva contrasena y su confirmacion no coinciden.");
      return;
    }

    setSaving(true);
    try {
      await changeOwnerPassword({ currentPassword, newPassword });
      formElement.reset();
      setSaved(true);
    } catch (passwordError) {
      setError(
        passwordError instanceof OwnerRequestError
          ? passwordError.messages[0]
          : "No se pudo actualizar la contrasena. Intentalo de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Input
        name="currentPassword"
        label="Contrasena actual"
        type={showCurrent ? "text" : "password"}
        autoComplete="current-password"
        required
        trailing={
          <button
            type="button"
            aria-label={showCurrent ? "Ocultar contrasena" : "Mostrar contrasena"}
            onClick={() => setShowCurrent((current) => !current)}
            className="px-3 text-muted hover:text-brand"
          >
            {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
      />
      <Input
        name="newPassword"
        label="Nueva contrasena"
        type={showNew ? "text" : "password"}
        autoComplete="new-password"
        required
        pattern={PASSWORD_PATTERN}
        hint={PASSWORD_MESSAGE}
        trailing={
          <button
            type="button"
            aria-label={showNew ? "Ocultar contrasena" : "Mostrar contrasena"}
            onClick={() => setShowNew((current) => !current)}
            className="px-3 text-muted hover:text-brand"
          >
            {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
      />
      <Input
        name="confirmPassword"
        label="Confirmar nueva contrasena"
        type={showNew ? "text" : "password"}
        autoComplete="new-password"
        required
      />
      {error ? <p role="alert" className="text-sm font-medium text-error">{error}</p> : null}
      {saved ? <p role="status" className="text-sm font-medium text-success">Contrasena actualizada.</p> : null}
      <div>
        <Button type="submit" disabled={saving}>
          {saving ? "Actualizando..." : "Actualizar contrasena"}
        </Button>
      </div>
    </form>
  );
}
