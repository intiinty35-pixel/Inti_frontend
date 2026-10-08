"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { Button, Input, Select } from "@/shared/ui";
import { OwnerRequestError, updateMyProfile, uploadProfilePhoto } from "@/features/owner/api/client";
import { mapMessagesToFields } from "@/shared/lib/field-errors";
import type { ProfessionalProfile } from "@/features/owner/types/property";

const TYPE_LABELS: Record<ProfessionalProfile["type"], string> = {
  INDEPENDENT_AGENT: "Agente independiente",
  REAL_ESTATE_AGENCY: "Inmobiliaria",
  DEVELOPER: "Desarrolladora",
};

type Field =
  | "displayName"
  | "phone"
  | "whatsapp"
  | "city"
  | "districts"
  | "address"
  | "website"
  | "socialLinks"
  | "ruc";

const FIELD_PATTERNS: Record<Field, RegExp> = {
  displayName: /nombre|razón social/i,
  phone: /tel[eé]fono/i,
  whatsapp: /whatsapp/i,
  city: /ciudad/i,
  districts: /distritos/i,
  address: /dirección/i,
  website: /sitio web/i,
  socialLinks: /redes sociales/i,
  ruc: /ruc/i,
};

export function ProfileForm({ profile }: { profile: ProfessionalProfile }) {
  const router = useRouter();
  const isCompany = profile.type !== "INDEPENDENT_AGENT";
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.user.avatarUrl ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFieldErrors({});
    setFormError("");
    setSaved(false);
    setLoading(true);

    try {
      await updateMyProfile({
        firstName: String(form.get("displayName") ?? "").trim(),
        businessName: isCompany ? String(form.get("displayName") ?? "").trim() : undefined,
        phone: String(form.get("phone") ?? "").trim(),
        avatarUrl: avatarUrl || undefined,
        whatsapp: String(form.get("whatsapp") ?? "").trim(),
        city: String(form.get("city") ?? "").trim(),
        districts: String(form.get("districts") ?? "").trim() || undefined,
        website: String(form.get("website") ?? "").trim() || undefined,
        socialLinks: String(form.get("socialLinks") ?? "").trim() || undefined,
        ruc: isCompany ? String(form.get("ruc") ?? "").trim() || undefined : undefined,
        address: isCompany ? String(form.get("address") ?? "").trim() || undefined : undefined,
      });
      setSaved(true);
      router.refresh();
    } catch (error) {
      if (error instanceof OwnerRequestError) {
        const { fieldErrors: mapped, rest } = mapMessagesToFields(error.messages, FIELD_PATTERNS);
        setFieldErrors(mapped);
        setFormError(rest[0] ?? "");
      } else {
        setFormError("Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    setFormError("");
    setSaved(false);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Sube una foto JPG, PNG o WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("La foto debe pesar como maximo 5 MB.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const uploaded = await uploadProfilePhoto(file);
      setAvatarUrl(uploaded.url);
    } catch (error) {
      setFormError(error instanceof OwnerRequestError ? error.messages[0] : "No se pudo subir la foto.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  const displayName = profile.businessName ?? `${profile.user.firstName} ${profile.user.lastName ?? ""}`.trim();
  const initial = displayName.charAt(0).toUpperCase() || "A";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-5 rounded-card border border-edge bg-canvas p-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
        <div className="relative mx-auto size-28 overflow-hidden rounded-2xl border border-edge bg-brand text-on-brand shadow-[var(--shadow-card)] sm:mx-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center font-display text-4xl font-black">
              {initial}
            </span>
          )}
        </div>
        <div className="min-w-0 text-center sm:text-left">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">Foto de perfil</p>
          <h2 className="mt-1 text-xl font-black text-brand">{displayName}</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Esta imagen se usara en tu perfil profesional y ayudara a que tus publicaciones se vean mas confiables.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-card bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover">
              {uploadingAvatar ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              {uploadingAvatar ? "Subiendo..." : "Cargar foto"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => void handleAvatarChange(event.target.files?.[0])}
              />
            </label>
            {avatarUrl ? (
              <button
                type="button"
                onClick={() => setAvatarUrl("")}
                className="inline-flex h-10 items-center justify-center rounded-card border border-edge bg-surface px-4 text-sm font-bold text-ink transition-colors hover:border-brand"
              >
                Quitar foto
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          name="displayName"
          label={isCompany ? "Nombre comercial" : "Nombre del agente"}
          defaultValue={displayName}
          required
          error={fieldErrors.displayName}
        />
        <Select name="type" label="Tipo de cuenta" defaultValue={profile.type} disabled>
          <option value={profile.type}>{TYPE_LABELS[profile.type]}</option>
        </Select>
        <Input name="email" label="Correo" defaultValue={profile.user.email} disabled />
        <Input name="phone" label="Teléfono" defaultValue={profile.user.phone ?? ""} error={fieldErrors.phone} />
        <Input
          name="whatsapp"
          label="WhatsApp"
          defaultValue={profile.whatsapp ?? ""}
          error={fieldErrors.whatsapp}
        />
        <Input name="city" label="Ciudad" defaultValue={profile.city} required error={fieldErrors.city} />
        {isCompany ? (
          <>
            <Input
              name="districts"
              label="Distritos donde trabaja"
              defaultValue={profile.districts ?? ""}
              error={fieldErrors.districts}
            />
            <Input name="ruc" label="RUC" defaultValue={profile.ruc ?? ""} error={fieldErrors.ruc} />
            <Input
              name="address"
              label="Dirección de empresa"
              defaultValue={profile.address ?? ""}
              error={fieldErrors.address}
            />
          </>
        ) : (
          <Input
            name="districts"
            label="Distritos donde trabaja"
            defaultValue={profile.districts ?? ""}
            error={fieldErrors.districts}
          />
        )}
        <Input
          name="website"
          label="Sitio web"
          defaultValue={profile.website ?? ""}
          error={fieldErrors.website}
        />
        <Input
          name="socialLinks"
          label="Redes sociales"
          defaultValue={profile.socialLinks ?? ""}
          error={fieldErrors.socialLinks}
        />
      </div>

      {formError ? (
        <p role="alert" className="rounded-card bg-error/10 px-3.5 py-2.5 text-sm text-error">
          {formError}
        </p>
      ) : null}
      {saved ? <p className="text-sm text-success">Cambios guardados.</p> : null}

      <div>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
