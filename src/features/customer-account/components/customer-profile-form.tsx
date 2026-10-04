"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/shared/ui";
import { ApiError } from "@/shared/lib/api/client";
import {
  updateCustomerProfile,
  uploadCustomerAvatar,
} from "@/features/customer-account/api/client";
import type { CustomerProfile } from "@/features/customer-account/types/customer-account";

export function CustomerProfileForm({ profile }: { profile: CustomerProfile }) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setError("Elige una imagen de hasta 5 MB.");
      return;
    }

    setError("");
    setUploading(true);
    try {
      const uploaded = await uploadCustomerAvatar(file);
      setAvatarUrl(uploaded.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la foto.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    const form = new FormData(event.currentTarget);

    try {
      await updateCustomerProfile({
        firstName: String(form.get("firstName") ?? "").trim(),
        lastName: String(form.get("lastName") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim(),
        biography: String(form.get("biography") ?? "").trim(),
        avatarUrl: avatarUrl || null,
      });
      setSaved(true);
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof ApiError
          ? updateError.message
          : "No se pudieron guardar tus datos. Inténtalo de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-card border border-edge bg-canvas p-4 sm:flex-row sm:items-center">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Foto de perfil"
            width={80}
            height={80}
            unoptimized
            className="size-20 rounded-full border border-edge object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-20 items-center justify-center rounded-full bg-brand-soft text-2xl font-bold text-brand"
          >
            {profile.firstName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-brand">Foto de perfil</p>
          <label className="inline-flex h-10 w-fit cursor-pointer items-center rounded-card border border-edge bg-surface px-4 text-sm font-semibold text-brand hover:border-brand">
            {uploading ? "Subiendo..." : "Elegir imagen"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={uploading}
              onChange={(event) => void handleAvatarChange(event.target.files?.[0])}
            />
          </label>
          <p className="text-xs text-muted">JPG, PNG o WebP · máximo 5 MB</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="firstName"
          label="Nombre"
          autoComplete="given-name"
          defaultValue={profile.firstName}
          required
          maxLength={80}
        />
        <Input
          name="lastName"
          label="Apellido"
          autoComplete="family-name"
          defaultValue={profile.lastName ?? ""}
          maxLength={80}
        />
        <Input label="Correo" value={profile.email} disabled hint="El correo de acceso no se puede cambiar aquí." />
        <Input
          name="phone"
          label="Teléfono"
          type="tel"
          autoComplete="tel"
          defaultValue={profile.phone ?? ""}
          maxLength={20}
        />
      </div>

      <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-brand">
        Biografía
        <textarea
          name="biography"
          defaultValue={profile.biography ?? ""}
          maxLength={500}
          rows={4}
          placeholder="Cuéntales un poco sobre ti..."
          className="rounded-card border border-edge bg-surface px-3.5 py-3 text-sm font-normal text-ink placeholder:text-muted/70 focus:border-brand focus:outline-2 focus:outline-brand/25"
        />
      </label>

      {error ? <p role="alert" className="text-sm font-medium text-error">{error}</p> : null}
      {saved ? <p role="status" className="text-sm font-medium text-success">Tus datos se guardaron.</p> : null}

      <div>
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Guardando..." : "Guardar perfil"}
        </Button>
      </div>
    </form>
  );
}
