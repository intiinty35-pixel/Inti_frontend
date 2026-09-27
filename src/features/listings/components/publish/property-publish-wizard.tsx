"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { createProperty, publishProperty, type ApiOperationType, type ApiPropertyType, type PropertyCreateInput } from "@/features/listings";
import { PROPERTY_FORM_CONFIG, PROPERTY_TYPE_OPTIONS, amenityCode } from "@/features/listings/config/property-form";
import { uploadPropertyImage } from "@/features/listings/api/media";
import { LocationPicker } from "@/features/listings/components/publish/location-picker";

type Step = 1 | 2 | 3 | 4;

const STEPS: Array<{ step: Step; title: string; detail: string }> = [
  { step: 1, title: "Información básica", detail: "Tipo y precio" },
  { step: 2, title: "Ubicación", detail: "Dirección exacta" },
  { step: 3, title: "Características", detail: "Detalles del inmueble" },
  { step: 4, title: "Fotos y publicación", detail: "Multimedia y revisión" },
];

function num(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export function PropertyPublishWizard() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [propertyType, setPropertyType] = useState<ApiPropertyType>("APARTMENT");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; publicId: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [location, setLocation] = useState({ latitude: -12.046374, longitude: -77.042793 });
  const [locationLabel, setLocationLabel] = useState("Lima, Perú");
  const [locating, setLocating] = useState(false);
  const config = useMemo(() => PROPERTY_FORM_CONFIG[propertyType], [propertyType]);

  useEffect(() => {
    const raw = localStorage.getItem("ariz.propertyDraft");
    const form = formRef.current;
    if (!raw || !form) return;
    const draft = JSON.parse(raw) as Record<string, string>;
    Object.entries(draft).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
        if (field.type === "checkbox") {
          (field as HTMLInputElement).checked = value === "on";
        } else {
          field.value = value;
        }
      }
    });
    if (draft.propertyType) setPropertyType(draft.propertyType as ApiPropertyType);
  }, []);

  function saveDraft() {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const draft: Record<string, string> = {};
    data.forEach((value, key) => {
      if (typeof value === "string") draft[key] = value;
    });
    draft.propertyType = propertyType;
    localStorage.setItem("ariz.propertyDraft", JSON.stringify(draft));
  }

  function next() {
    saveDraft();
    setStep((current) => Math.min(4, current + 1) as Step);
  }

  function previous() {
    saveDraft();
    setStep((current) => Math.max(1, current - 1) as Step);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedAmenities = config.amenities
      .filter((amenity) => form.get(`amenity_${amenityCode(amenity)}`) === "on")
      .map(amenityCode);
    const media = uploadedImages.map((image, index) => ({
      url: image.url,
      publicId: image.publicId,
      position: index,
      isCover: index === 0,
    }));

    const input: PropertyCreateInput = {
      operationType: text(form, "operationType") as ApiOperationType,
      propertyType,
      title: text(form, "title"),
      description: text(form, "description"),
      price: Number(form.get("price")),
      currency: text(form, "currency") as "PEN" | "USD",
      negotiable: form.get("negotiable") === "on",
      maintenanceFee: num(form.get("maintenanceFee")),
      location: {
        department: text(form, "department"),
        province: text(form, "province"),
        district: text(form, "district"),
        address: text(form, "address"),
        number: text(form, "number") || undefined,
        sector: text(form, "sector") || undefined,
        reference: text(form, "reference") || undefined,
        latitude: location.latitude,
        longitude: location.longitude,
        approximateLocation: form.get("approximateLocation") === "on",
      },
      details: {
        totalArea: num(form.get("totalArea")),
        constructedArea: num(form.get("constructedArea")),
        bedrooms: num(form.get("bedrooms")),
        bathrooms: num(form.get("bathrooms")),
        halfBathrooms: num(form.get("halfBathrooms")),
        parkingSpaces: num(form.get("parkingSpaces")),
        floor: num(form.get("floor")),
        floors: num(form.get("floors")),
        constructionYear: num(form.get("constructionYear")),
        conservationStatus: text(form, "conservationStatus") as PropertyCreateInput["details"]["conservationStatus"],
      },
      amenityCodes: selectedAmenities,
      media,
      contactName: text(form, "contactName") || undefined,
      contactEmail: text(form, "contactEmail") || undefined,
      contactPhone: text(form, "contactPhone") || undefined,
      contactWhatsapp: text(form, "contactWhatsapp") || undefined,
    };

    const missing = [
      !input.title && "título",
      !input.description && "descripción",
      (!input.price || input.price <= 0) && "precio",
      !input.location.department && "departamento",
      !input.location.province && "provincia",
      !input.location.district && "distrito",
      !input.location.address && "dirección",
      input.media.length === 0 && "al menos una imagen",
      ...config.fields.map((field) => (field.required && input.details[field.key] === undefined ? field.label : false)),
    ].filter(Boolean) as string[];

    if (missing.length > 0) {
      setErrors([`Falta completar: ${missing.join(", ")}`]);
      setStep(4);
      return;
    }

    setErrors([]);
    setLoading(true);
    try {
      const created = await createProperty(input);
      const published = await publishProperty(created.id);
      localStorage.removeItem("ariz.propertyDraft");
      router.push(ROUTES.property(published.slug));
      router.refresh();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "No se pudo publicar la propiedad."]);
      setLoading(false);
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setErrors([]);
    try {
      const results: Array<{ url: string; publicId: string }> = [];
      for (const file of Array.from(files)) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          throw new Error("Solo se permiten imágenes JPG, PNG o WEBP.");
        }
        if (file.size > 8 * 1024 * 1024) {
          throw new Error("Cada imagen debe pesar como máximo 8 MB.");
        }
        results.push(await uploadPropertyImage(file));
      }
      setUploadedImages((current) => [...current, ...results]);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "No se pudieron subir las imágenes."]);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(publicId: string) {
    setUploadedImages((current) => current.filter((image) => image.publicId !== publicId));
  }

  function moveImage(publicId: string, direction: -1 | 1) {
    setUploadedImages((current) => {
      const index = current.findIndex((image) => image.publicId === publicId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  }

  async function locateAddress(form: HTMLFormElement | null) {
    if (!form) return;
    const data = new FormData(form);
    const query = [
      text(data, "address"),
      text(data, "number"),
      text(data, "district"),
      text(data, "province"),
      text(data, "department"),
      "Perú",
    ].filter(Boolean).join(", ");

    if (!query.trim()) {
      setErrors(["Completa la dirección antes de ubicarla en el mapa."]);
      return;
    }

    setLocating(true);
    setErrors([]);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
      const results = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      const match = results[0];
      if (!match) {
        setErrors(["No encontramos esa dirección. Ajusta distrito, provincia o referencia."]);
        return;
      }
      setLocation({
        latitude: Number(Number(match.lat).toFixed(7)),
        longitude: Number(Number(match.lon).toFixed(7)),
      });
      setLocationLabel(match.display_name);
    } catch {
      setErrors(["No pudimos consultar el mapa. Inténtalo nuevamente."]);
    } finally {
      setLocating(false);
    }
  }

  return (
    <form ref={formRef} onInput={saveDraft} onChange={saveDraft} onSubmit={submit} className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-max rounded-card border border-edge bg-surface p-4 lg:sticky lg:top-24">
        <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">Publicar propiedad</p>
        <ol className="mt-4 grid gap-2">
          {STEPS.map((item) => (
            <li key={item.step}>
              <button
                type="button"
                onClick={() => setStep(item.step)}
                className={`w-full rounded-card px-3 py-3 text-left transition-colors ${
                  step === item.step ? "bg-brand text-on-brand" : "bg-surface-muted text-ink hover:bg-brand-soft"
                }`}
              >
                <span className="text-xs font-bold">Paso {item.step}</span>
                <span className="block text-sm font-bold">{item.title}</span>
                <span className={`block text-xs ${step === item.step ? "text-white/75" : "text-muted"}`}>{item.detail}</span>
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <main className="rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)]">
        {errors.length > 0 ? (
          <div className="mb-5 rounded-card bg-error/10 px-4 py-3 text-sm font-semibold text-error">
            {errors.map((error) => <p key={error}>{error}</p>)}
          </div>
        ) : null}

        {step === 1 ? (
          <section className="grid gap-6">
            <header>
              <p className="text-xs font-bold text-accent">PASO 1 DE 4</p>
              <h1 className="mt-1 text-3xl font-light text-brand">Información básica</h1>
              <p className="mt-2 text-sm text-muted">Tipo, operación y precio.</p>
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select name="operationType" label="¿Qué deseas hacer?">
                <option value="SALE">Vender</option>
                <option value="RENT">Alquilar</option>
                <option value="TEMPORARY_RENT">Alquiler temporal</option>
                <option value="TRANSFER">Traspaso</option>
              </Select>
              <Select name="propertyType" label="Tipo de propiedad" value={propertyType} onChange={(event) => setPropertyType(event.target.value as ApiPropertyType)}>
                {PROPERTY_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </Select>
              <Select name="currency" label="Moneda">
                <option value="PEN">Soles</option>
                <option value="USD">Dólares</option>
              </Select>
              <Input name="price" label="Precio" type="number" min={1} required />
              <Input name="maintenanceFee" label="Mantenimiento mensual" type="number" min={0} />
              <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold text-brand">
                <input name="negotiable" type="checkbox" />
                Precio negociable
              </label>
            </div>
            <Input name="title" label="Título" maxLength={100} required />
            <div className="grid gap-1.5">
              <label className="text-[13px] font-semibold text-brand">Descripción</label>
              <textarea name="description" required maxLength={5000} className="min-h-36 rounded-card border border-edge bg-surface p-3 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25" />
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="grid gap-6">
            <header>
              <p className="text-xs font-bold text-accent">PASO 2 DE 4</p>
              <h1 className="mt-1 text-3xl font-light text-brand">Ubicación</h1>
              <p className="mt-2 text-sm text-muted">Indica dónde se encuentra el inmueble.</p>
            </header>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input name="department" label="Departamento/Región" required />
              <Input name="province" label="Provincia" required />
              <Input name="district" label="Distrito" required />
              <Input name="address" label="Dirección" required />
              <Input name="number" label="Número" />
              <Input name="sector" label="Urbanización/Sector" />
              <Input name="reference" label="Referencia" className="sm:col-span-3" />
              <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold text-brand">
                <input name="approximateLocation" type="checkbox" defaultChecked />
                Mostrar ubicación aproximada públicamente
              </label>
            </div>
            <div>
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand">Arrastra el marcador o haz click en el mapa.</p>
                  <p className="text-xs text-muted">{locationLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={(event) => locateAddress(event.currentTarget.form)}
                  className="h-9 rounded-card border border-brand px-3 text-xs font-bold text-brand"
                  disabled={locating}
                >
                  {locating ? "Ubicando..." : "Ubicar dirección"}
                </button>
              </div>
              <LocationPicker latitude={location.latitude} longitude={location.longitude} onChange={setLocation} />
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="grid gap-6">
            <header>
              <p className="text-xs font-bold text-accent">PASO 3 DE 4</p>
              <h1 className="mt-1 text-3xl font-light text-brand">Características</h1>
              <p className="mt-2 text-sm text-muted">Campos relevantes para {config.label.toLowerCase()}.</p>
            </header>
            <div className="grid gap-4 sm:grid-cols-3">
              {config.fields.map((field) => (
                <Input key={field.key} name={field.key} label={field.label} type="number" min={0} required={field.required} />
              ))}
              <Select name="conservationStatus" label="Estado de conservación">
                <option value="GOOD">Bueno</option>
                <option value="NEW">Nuevo</option>
                <option value="EXCELLENT">Excelente</option>
                <option value="REMODELED">Remodelado</option>
                <option value="TO_REMODEL">Por remodelar</option>
                <option value="UNDER_CONSTRUCTION">En construcción</option>
              </Select>
            </div>
            <div>
              <h2 className="text-base font-bold text-brand">Comodidades</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {config.amenities.map((amenity) => (
                  <label key={amenity} className="rounded-card border border-edge bg-surface-muted px-3 py-2 text-sm font-semibold text-ink">
                    <input name={`amenity_${amenityCode(amenity)}`} type="checkbox" className="mr-2" />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="grid gap-6">
            <header>
              <p className="text-xs font-bold text-accent">PASO 4 DE 4</p>
              <h1 className="mt-1 text-3xl font-light text-brand">Fotos y publicación</h1>
              <p className="mt-2 text-sm text-muted">La primera imagen será la portada de la publicación.</p>
            </header>
            <div className="grid gap-1.5">
              <label className="text-[13px] font-semibold text-brand">Sube fotos del inmueble</label>
              <div className="rounded-card border border-dashed border-edge bg-surface-muted p-6 text-center">
                <input
                  id="property-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  onChange={(event) => handleFiles(event.target.files)}
                />
                <label htmlFor="property-images" className="inline-flex h-10 cursor-pointer items-center justify-center rounded-card bg-brand px-4 text-sm font-bold text-on-brand">
                  {uploading ? "Subiendo..." : "Seleccionar archivos"}
                </label>
                <p className="mt-2 text-xs text-muted">JPG, PNG o WEBP. Máximo 8 MB por imagen.</p>
              </div>
              {uploadedImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {uploadedImages.map((image, index) => (
                    <div key={image.publicId} className="relative aspect-[4/3] overflow-hidden rounded-card border border-edge bg-cover bg-center" style={{ backgroundImage: `url(${image.url})` }}>
                      {index === 0 ? <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-1 text-[10px] font-bold text-on-brand">Portada</span> : null}
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between gap-1">
                        <button type="button" onClick={() => moveImage(image.publicId, -1)} className="rounded-card bg-surface px-2 py-1 text-[10px] font-bold text-brand">Subir</button>
                        <button type="button" onClick={() => moveImage(image.publicId, 1)} className="rounded-card bg-surface px-2 py-1 text-[10px] font-bold text-brand">Bajar</button>
                        <button type="button" onClick={() => removeImage(image.publicId)} className="rounded-card bg-error px-2 py-1 text-[10px] font-bold text-white">Quitar</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              <p className="text-xs text-muted">Las imágenes se cargan desde tu equipo y quedan almacenadas en Cloudinary.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="contactName" label="Nombre de contacto" />
              <Input name="contactEmail" label="Email de contacto" type="email" />
              <Input name="contactPhone" label="Teléfono" />
              <Input name="contactWhatsapp" label="WhatsApp" />
            </div>
            <label className="flex items-start gap-2 text-sm text-muted">
              <input name="acceptTerms" type="checkbox" required className="mt-1" />
              Acepto los términos y condiciones de publicación de ARIZ.
            </label>
          </section>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-edge pt-5 sm:flex-row sm:justify-between">
          <Button variant="secondary" onClick={previous} disabled={step === 1 || loading}>Anterior</Button>
          {step < 4 ? (
            <Button onClick={next}>Continuar</Button>
          ) : (
            <Button type="submit" disabled={loading}>{loading ? "Publicando..." : "Publicar propiedad"}</Button>
          )}
        </div>
      </main>
    </form>
  );
}
