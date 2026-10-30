"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ClipboardEvent, type FormEvent } from "react";
import { LocationPicker, type MapPoint } from "@/shared/ui/location-picker";
import { uploadImageToCloudinary } from "@/shared/lib/api/cloudinary";
import {
  createInvestmentOpportunity,
  updateInvestmentOpportunity,
} from "@/features/investment-opportunities/api/client";
import {
  INVESTMENT_GOAL_LABELS,
  INVESTMENT_RISK_LABELS,
  INVESTMENT_STATUS_LABELS,
  type InvestmentGoal,
  type InvestmentOpportunity,
  type InvestmentOpportunityInput,
  type InvestmentRiskLevel,
  type InvestmentStatus,
  type InvestmentType,
} from "@/features/investment-opportunities/types";
import { ImageIcon, UploadIcon } from "@/shared/ui";
import styles from './investment-opportunity-form.module.css';
import { MapFilterSelect } from '@/features/listings/components/map-filter-select';

const INITIAL_POINT: MapPoint = { latitude: -3.5669, longitude: -80.4515 };

function getInitialPoint(opportunity?: InvestmentOpportunity): MapPoint {
  if (
    opportunity &&
    opportunity.latitude !== 0 &&
    opportunity.longitude !== 0
  ) {
    return {
      latitude: opportunity.latitude,
      longitude: opportunity.longitude,
    };
  }
  return INITIAL_POINT;
}

function createEmptyInput(): InvestmentOpportunityInput {
  return {
    name: "",
    summary: "",
    description: "",
    areaLabel: "",
    investmentTypeId: null,
    investmentKind: "Inversión inmobiliaria",
    assetType: "Proyecto",
    initialInvestment: 0,
    roiPercent: 0,
    estimatedReturnLabel: null,
    estimatedTermMonths: null,
    investmentGoal: "plusvalia",
    status: "AVAILABLE",
    riskLevel: null,
    featured: false,
    sortOrder: 0,
    ctaLabel: "Solicitar información",
    location: "",
    department: "",
    province: "",
    district: "",
    latitude: INITIAL_POINT.latitude,
    longitude: INITIAL_POINT.longitude,
    coverImageUrl: "",
    coverImagePublicId: null,
    galleryImages: [],
    highlights: [],
    isPublished: true,
  };
}

const inputClass =
  "mt-1.5 h-11 w-full rounded-lg border border-edge bg-white px-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15";
const labelClass = "block text-sm font-medium text-ink";

function parseCoordinate(value: string): number | undefined {
  const parsed = Number(value.trim().replace(",", "."));
  return value.trim() && Number.isFinite(parsed) ? parsed : undefined;
}

function parseCoordinatePair(value: string): MapPoint | undefined {
  const normalized = value.trim();
  const candidates = [
    normalized.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/),
    normalized.match(/[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i),
    normalized.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/),
  ];
  const match = candidates.find((candidate) => candidate);
  if (!match) return undefined;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return undefined;
  }
  return { latitude, longitude };
}

export function InvestmentOpportunityForm({
  opportunity,
  investmentTypes = [],
}: {
  opportunity?: InvestmentOpportunity;
  investmentTypes?: InvestmentType[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<InvestmentOpportunityInput>(() =>
    opportunity
      ? {
          ...opportunity,
          ...getInitialPoint(opportunity),
          investmentTypeId: opportunity.investmentTypeId ?? null,
          investmentKind: opportunity.investmentKind || "Inversión inmobiliaria",
          assetType: opportunity.assetType || "Proyecto",
          estimatedReturnLabel: opportunity.estimatedReturnLabel ?? null,
          estimatedTermMonths: opportunity.estimatedTermMonths ?? null,
          status: opportunity.status ?? "AVAILABLE",
          riskLevel: opportunity.riskLevel ?? null,
          featured: opportunity.featured ?? false,
          sortOrder: opportunity.sortOrder ?? 0,
          ctaLabel: opportunity.ctaLabel || "Solicitar información",
          coverImagePublicId: opportunity.coverImagePublicId,
          galleryImages: [...opportunity.galleryImages],
          highlights: [...opportunity.highlights],
        }
      : createEmptyInput(),
  );
  const [latitudeText, setLatitudeText] = useState(() =>
    String(getInitialPoint(opportunity).latitude),
  );
  const [longitudeText, setLongitudeText] = useState(() =>
    String(getInitialPoint(opportunity).longitude),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function applyCoordinates(point: MapPoint) {
    setLatitudeText(String(point.latitude));
    setLongitudeText(String(point.longitude));
    setForm((current) => ({
      ...current,
      latitude: point.latitude,
      longitude: point.longitude,
    }));
  }

  function handleCoordinatePaste(event: ClipboardEvent<HTMLInputElement>) {
    const point = parseCoordinatePair(event.clipboardData.getData("text"));
    if (!point) return;
    event.preventDefault();
    applyCoordinates(point);
    setError("");
  }

  function setField<K extends keyof InvestmentOpportunityInput>(
    key: K,
    value: InvestmentOpportunityInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadCover(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      validateImageFile(file);
      const uploaded = await uploadImageToCloudinary(file, "ariz/investment-opportunities");
      setForm((current) => ({
        ...current,
        coverImageUrl: uploaded.url,
        coverImagePublicId: uploaded.publicId,
      }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la portada.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadGallery(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      if (form.galleryImages.length + files.length > 12) {
        throw new Error("La galería admite hasta 12 imágenes.");
      }
      Array.from(files).forEach(validateImageFile);
      const uploads = await Promise.all(
        Array.from(files).map((file) =>
          uploadImageToCloudinary(file, "ariz/investment-opportunities"),
        ),
      );
      setForm((current) => ({
        ...current,
        galleryImages: [...current.galleryImages, ...uploads.map(({ url }) => url)].slice(0, 12),
      }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudieron subir las imágenes.");
    } finally {
      setBusy(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (!form.coverImageUrl) {
        throw new Error("Sube una imagen de portada antes de guardar.");
      }
      if (!form.department || !form.province || !form.district || !form.location) {
        throw new Error("Completa la ubicación y sus datos administrativos.");
      }
      const latitude = parseCoordinate(latitudeText);
      const longitude = parseCoordinate(longitudeText);
      if (
        latitude === undefined ||
        longitude === undefined ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        throw new Error("Ingresa una latitud entre -90 y 90 y una longitud entre -180 y 180.");
      }
      const input = { ...form, latitude, longitude };
      if (opportunity) {
        await updateInvestmentOpportunity(opportunity.id, input);
      } else {
        await createInvestmentOpportunity(input);
      }
      router.push("/panel/admin/investment-opportunities");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el proyecto.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className={`${styles.form} flex flex-col gap-6`}>
      <section className="grid gap-4 rounded-2xl border border-edge bg-surface p-5 shadow-[var(--shadow-card)] sm:grid-cols-2">
        <div className={styles.sectionHeading}><span>01</span><div><h2>Información del proyecto</h2><p>Identidad y presentación de la oportunidad de inversión.</p></div></div>
        <label className={labelClass}>
          Nombre del proyecto
          <input className={inputClass} value={form.name} maxLength={120} required onChange={(e) => setField("name", e.target.value)} />
        </label>
        <label className={labelClass}>
          Ubicación visible
          <input className={inputClass} value={form.location} maxLength={180} placeholder="Ej. Zorritos, Tumbes" required onChange={(e) => setField("location", e.target.value)} />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Resumen para las tarjetas
          <input className={inputClass} value={form.summary} maxLength={180} required onChange={(e) => setField("summary", e.target.value)} />
        </label>
        <div className={styles.selectField}><span>Tipo de inversión</span>
          <MapFilterSelect compact label="Tipo de inversión" value={form.investmentTypeId ?? ''} onChange={value => setField('investmentTypeId', value || null)} options={[{ value: '', label: 'Sin tipo asignado' }, ...investmentTypes.map(type => ({ value: type.id, label: type.name }))]} />
        </div>
        <label className={labelClass}>
          Tipo visible
          <input className={inputClass} value={form.investmentKind} maxLength={80} required onChange={(e) => setField("investmentKind", e.target.value)} />
        </label>
        <label className={labelClass}>
          Tipo de activo
          <input className={inputClass} value={form.assetType} maxLength={80} placeholder="Terreno / Departamento / Proyecto / Local" required onChange={(e) => setField("assetType", e.target.value)} />
        </label>
        <label className={labelClass}>
          Área / metraje
          <input className={inputClass} value={form.areaLabel} maxLength={80} placeholder="Desde 120 m²" required onChange={(e) => setField("areaLabel", e.target.value)} />
        </label>
        <div className={styles.sectionHeading}><span>02</span><div><h2>Condiciones de inversión</h2><p>Importes, objetivos y estimaciones comerciales.</p></div></div>
        <div className={styles.selectField}><span>Objetivo de inversión</span>
          <MapFilterSelect compact label="Objetivo de inversión" value={form.investmentGoal} onChange={value => setField('investmentGoal', value as InvestmentGoal)} options={Object.entries(INVESTMENT_GOAL_LABELS).map(([value, label]) => ({ value, label }))} />
        </div>
        <label className={labelClass}>
          Inversión inicial desde (S/)
          <input className={inputClass} type="number" min="1" step="0.01" required value={form.initialInvestment || ""} onChange={(e) => setField("initialInvestment", Number(e.target.value))} />
        </label>
        <label className={labelClass}>
          ROI estimado (%)
          <input className={inputClass} type="number" min="0" max="100" step="0.01" required value={form.roiPercent} onChange={(e) => setField("roiPercent", Number(e.target.value))} />
        </label>
        <label className={labelClass}>
          Rentabilidad estimada
          <input className={inputClass} value={form.estimatedReturnLabel ?? ""} maxLength={80} placeholder="12% anual" onChange={(e) => setField("estimatedReturnLabel", e.target.value || null)} />
        </label>
        <label className={labelClass}>
          Plazo estimado (meses)
          <input className={inputClass} type="number" min="0" step="1" value={form.estimatedTermMonths ?? ""} onChange={(e) => setField("estimatedTermMonths", e.target.value ? Number(e.target.value) : null)} />
        </label>
        <div className={styles.sectionHeading}><span>03</span><div><h2>Publicación y disponibilidad</h2><p>Estado de la oportunidad y presentación del contacto.</p></div></div>
        <div className={styles.selectField}><span>Estado comercial</span>
          <MapFilterSelect compact label="Estado comercial" value={form.status} onChange={value => setField('status', value as InvestmentStatus)} options={Object.entries(INVESTMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))} />
        </div>
        <div className={styles.selectField}><span>Nivel de riesgo</span>
          <MapFilterSelect compact label="Nivel de riesgo" value={form.riskLevel ?? ''} onChange={value => setField('riskLevel', (value || null) as InvestmentRiskLevel | null)} options={[{ value: '', label: 'No mostrar' }, ...Object.entries(INVESTMENT_RISK_LABELS).map(([value, label]) => ({ value, label }))]} />
        </div>
        <label className={labelClass}>
          Orden
          <input className={inputClass} type="number" step="1" value={form.sortOrder} onChange={(e) => setField("sortOrder", Number(e.target.value))} />
        </label>
        <label className={labelClass}>
          Texto del botón de contacto
          <input className={inputClass} value={form.ctaLabel} maxLength={80} required onChange={(e) => setField("ctaLabel", e.target.value)} />
        </label>
        <div className={styles.sectionHeading}><span>04</span><div><h2>Ubicación y descripción</h2><p>Datos de ubicación y argumentos que destacan el proyecto.</p></div></div>
        <label className={labelClass}>
          Región / departamento
          <input className={inputClass} value={form.department} maxLength={80} required onChange={(e) => setField("department", e.target.value)} />
        </label>
        <label className={labelClass}>
          Provincia
          <input className={inputClass} value={form.province} maxLength={80} required onChange={(e) => setField("province", e.target.value)} />
        </label>
        <label className={labelClass}>
          Distrito
          <input className={inputClass} value={form.district} maxLength={80} required onChange={(e) => setField("district", e.target.value)} />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Descripción del proyecto y tesis de inversión
          <textarea className="mt-1.5 min-h-36 w-full rounded-lg border border-edge bg-white p-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" value={form.description} maxLength={12000} required onChange={(e) => setField("description", e.target.value)} />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Aspectos destacados (uno por línea)
          <textarea
            className="mt-1.5 min-h-24 w-full rounded-lg border border-edge bg-white p-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            value={form.highlights.join("\n")}
            onChange={(e) => setField("highlights", e.target.value.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 12))}
          />
        </label>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-edge bg-surface p-5 shadow-[var(--shadow-card)]">
        <div>
          <h2 className="text-lg font-black text-ink">Ubicación exacta en el mapa</h2>
          <p className="mt-1 text-sm text-muted">
            Haz clic o arrastra el marcador, o pega las coordenadas o el enlace de Google Maps en cualquiera de los campos.
          </p>
        </div>
        <LocationPicker
          latitude={form.latitude}
          longitude={form.longitude}
          onChange={applyCoordinates}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Latitud
            <input
              className={inputClass}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="-3.5669"
              value={latitudeText}
              required
              onPaste={handleCoordinatePaste}
              onChange={(event) => {
                const value = event.target.value;
                setLatitudeText(value);
                const latitude = parseCoordinate(value);
                if (latitude !== undefined) {
                  setForm((current) => ({ ...current, latitude }));
                }
              }}
            />
          </label>
          <label className={labelClass}>
            Longitud
            <input
              className={inputClass}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="-80.4515"
              value={longitudeText}
              required
              onPaste={handleCoordinatePaste}
              onChange={(event) => {
                const value = event.target.value;
                setLongitudeText(value);
                const longitude = parseCoordinate(value);
                if (longitude !== undefined) {
                  setForm((current) => ({ ...current, longitude }));
                }
              }}
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-2xl border border-edge bg-surface p-5 shadow-[var(--shadow-card)]">
        <div>
          <h2 className="text-lg font-black text-ink">Imágenes del proyecto</h2>
          <p className="mt-1 text-sm text-muted">
            Primero elige la portada que verán en las tarjetas. Luego puedes añadir más fotos a la galería.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="text-sm font-black text-ink">1. Imagen de portada <span className="text-red-600">*</span></h3>
              <p className="mt-1 text-xs leading-5 text-muted">Esta será la imagen principal de la ficha de inversión.</p>
            </div>
            <div className="relative flex min-h-56 flex-col overflow-hidden rounded-xl border border-dashed border-edge bg-surface-muted">
              {form.coverImageUrl ? (
                <>
                  <div className="absolute inset-0">
                    <Image
                      src={form.coverImageUrl}
                      alt="Vista previa de la portada del proyecto"
                      fill
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="relative mt-auto flex items-center justify-between gap-3 bg-gradient-to-t from-black/75 to-transparent p-4 pt-12">
                    <span className="text-xs font-bold text-white">Portada cargada</span>
                    <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-white px-3 text-xs font-black text-brand shadow-sm transition hover:bg-white/90">
                      <UploadIcon className="size-4" />
                      Cambiar portada
                      <input
                        className="sr-only"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={busy}
                        onChange={(event) => {
                          void uploadCover(event.target.files?.[0]);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center px-5 py-6 text-center transition hover:bg-brand/5">
                  <span className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <ImageIcon className="size-6" />
                  </span>
                  <span className="mt-3 text-sm font-black text-ink">
                    {busy ? "Subiendo portada..." : "Selecciona la imagen principal"}
                  </span>
                  <span className="mt-1 text-xs text-muted">JPG, PNG o WebP · Máximo 12 MB</span>
                  <span className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-3 text-xs font-black text-on-brand">
                    <UploadIcon className="size-4" />
                    Elegir archivo
                  </span>
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={busy}
                    onChange={(event) => {
                      void uploadCover(event.target.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-ink">2. Galería adicional <span className="font-semibold text-muted">(opcional)</span></h3>
                <p className="mt-1 text-xs leading-5 text-muted">Añade hasta 12 fotos para mostrar más detalles del proyecto.</p>
              </div>
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-edge bg-white px-3 text-xs font-black text-brand transition hover:border-brand hover:bg-brand/5">
                <UploadIcon className="size-4" />
                {busy ? "Subiendo..." : "Añadir fotos"}
                <input
                  className="sr-only"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={busy || form.galleryImages.length >= 12}
                  onChange={(event) => {
                    void uploadGallery(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>

            <div className="flex min-h-56 flex-col rounded-xl border border-edge bg-[#f1efea] p-3">
              {form.galleryImages.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {form.galleryImages.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-muted">
                      <Image
                        src={url}
                        alt={`Foto ${index + 1} de la galería del proyecto`}
                        fill
                        sizes="(min-width: 640px) 180px, 45vw"
                        className="object-cover"
                      />
                      <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        Foto {index + 1}
                      </span>
                      <button
                        type="button"
                        aria-label={`Quitar foto ${index + 1}`}
                        onClick={() =>
                          setField(
                            "galleryImages",
                            form.galleryImages.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                        className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full bg-black/70 text-lg leading-none text-white transition hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center px-5 py-6 text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-white text-muted shadow-sm">
                    <ImageIcon className="size-5" />
                  </span>
                  <p className="mt-3 text-sm font-bold text-ink">Todavía no hay fotos en la galería</p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-muted">
                    Las fotos que agregues aparecerán aquí. Puedes seleccionar varias a la vez.
                  </p>
                </div>
              )}
              <p className="mt-auto pt-3 text-right text-xs font-semibold text-muted">
                {form.galleryImages.length} de 12 fotos
              </p>
            </div>
            <p className="text-xs text-muted">Formatos permitidos: JPG, PNG y WebP · Máximo 12 MB por foto.</p>
          </div>
        </div>

        {busy ? (
          <p role="status" className="rounded-lg bg-brand/5 px-3 py-2 text-sm font-semibold text-brand">
            Subiendo imágenes. Espera a que termine antes de guardar el proyecto.
          </p>
        ) : null}

        <label className="flex items-center gap-3 text-sm font-bold text-ink sm:col-span-2">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setField("isPublished", e.target.checked)} />
          Mostrar este proyecto en la página pública de inversiones
        </label>
      </section>

      <label className="flex items-center gap-3 rounded-2xl border border-edge bg-surface p-4 text-sm font-bold text-ink shadow-[var(--shadow-card)]">
        <input type="checkbox" checked={form.featured} onChange={(e) => setField("featured", e.target.checked)} />
        Marcar como oportunidad destacada
      </label>

      {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="h-11 rounded-xl border border-edge px-5 text-sm font-bold text-ink">Cancelar</button>
        <button type="submit" disabled={busy} className="h-11 rounded-xl bg-brand px-6 text-sm font-black text-on-brand disabled:cursor-wait disabled:opacity-60">
          {busy ? "Guardando..." : opportunity ? "Guardar cambios" : "Crear proyecto de inversión"}
        </button>
      </div>
    </form>
  );
}

function validateImageFile(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Usa imágenes JPG, PNG o WebP.");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Cada imagen debe pesar como máximo 12 MB.");
  }
}
