"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  BedIcon,
  BuildingIcon,
  Button,
  ChartIcon,
  CheckIcon,
  HomeIcon,
  Input,
  MapIcon,
  ParkingIcon,
  Listbox,
  StoreIcon,
  WarehouseIcon,
} from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { buildAddressQuery, searchMapPlace } from "@/shared/lib/geo";
import type { ApiOperationType, ApiPropertyType, PropertyCreateInput } from "@/features/listings/types/listing";
import { createProperty, publishProperty } from "@/features/listings/api";
import { PROPERTY_FORM_CONFIG, PROPERTY_TYPE_OPTIONS, amenityCode } from "@/features/listings/config/property-form";
import { uploadPropertyImage } from "@/features/listings/api/media";
import { LocationPicker, preloadLocationPicker } from "@/features/listings/components/publish/location-picker";

type Step = 1 | 2 | 3 | 4;

const STEPS: Array<{ step: Step; title: string; detail: string }> = [
  { step: 1, title: "Informacion basica", detail: "Tipo y precio" },
  { step: 2, title: "Ubicacion", detail: "Direccion exacta" },
  { step: 3, title: "Caracteristicas", detail: "Detalles del inmueble" },
  { step: 4, title: "Fotos y publicacion", detail: "Multimedia y revision" },
];

const OPERATION_OPTIONS: Array<{ value: ApiOperationType; label: string; hint: string }> = [
  { value: "SALE", label: "Vender", hint: "Venta" },
  { value: "RENT", label: "Alquilar", hint: "Alquiler" },
];

const CURRENCY_OPTIONS = [
  { value: "PEN", label: "Soles" },
  { value: "USD", label: "Dolares" },
] as const;

const CONSERVATION_STATUS_OPTIONS = [
  { value: "GOOD", label: "Bueno" },
  { value: "NEW", label: "Nuevo" },
  { value: "EXCELLENT", label: "Excelente" },
  { value: "REMODELED", label: "Remodelado" },
  { value: "TO_REMODEL", label: "Por remodelar" },
  { value: "UNDER_CONSTRUCTION", label: "En construccion" },
] as const;

function num(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function specificValue(form: FormData, key: string, type: "number" | "text" | "boolean" | "select") {
  if (type === "boolean") return form.get(`specific_${key}`) === "on";
  if (type === "number") return num(form.get(`specific_${key}`));
  const value = text(form, `specific_${key}`);
  return value || undefined;
}

function StepHeader({ current, title, detail }: { current: Step; title: string; detail: string }) {
  return (
    <header className="border-b border-edge pb-5">
      <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">Paso {current} de 4</p>
      <h2 className="mt-1 font-display text-3xl font-black tracking-tight text-brand">{title}</h2>
      <p className="mt-2 text-sm font-medium text-muted">{detail}</p>
    </header>
  );
}

const TYPE_ICONS: Record<ApiPropertyType, typeof HomeIcon> = {
  APARTMENT: BuildingIcon,
  HOUSE: HomeIcon,
  LAND: MapIcon,
  OFFICE: ChartIcon,
  COMMERCIAL: StoreIcon,
  ROOM: BedIcon,
  WAREHOUSE: WarehouseIcon,
  PARKING: ParkingIcon,
};

export function PropertyPublishWizard({
  audience = "owner",
}: {
  audience?: "owner" | "customer";
}) {
  const router = useRouter();
  const listingsPath =
    audience === "customer"
      ? ROUTES.panel.client.properties
      : ROUTES.panel.owner.listings;
  const formRef = useRef<HTMLFormElement>(null);
  const errorsRef = useRef<HTMLDivElement>(null);
  const issuesRef = useRef<string[]>([]);
  const [step, setStep] = useState<Step>(1);
  const [maxStepReached, setMaxStepReached] = useState<Step>(1);
  const [operationType, setOperationType] = useState<ApiOperationType>("SALE");
  const [propertyType, setPropertyType] = useState<ApiPropertyType>("APARTMENT");
  const [currency, setCurrency] = useState<"PEN" | "USD">("PEN");
  const [conservationStatus, setConservationStatus] = useState("GOOD");
  const [specificSelections, setSpecificSelections] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; publicId: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [location, setLocation] = useState({ latitude: -12.046374, longitude: -77.042793 });
  const [locationLabel, setLocationLabel] = useState("Lima, Peru");
  const [locating, setLocating] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const config = useMemo(() => PROPERTY_FORM_CONFIG[propertyType], [propertyType]);

  useEffect(() => {
    setMaxStepReached((current) => (step > current ? step : current));
  }, [step]);

  useEffect(() => {
    void preloadLocationPicker();

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restaura el borrador guardado al montar el formulario.
    if (draft.propertyType) setPropertyType(draft.propertyType as ApiPropertyType);
    if (draft.operationType) setOperationType(draft.operationType as ApiOperationType);
    if (draft.currency) setCurrency(draft.currency as "PEN" | "USD");
    if (draft.conservationStatus) setConservationStatus(draft.conservationStatus);
    setSpecificSelections(
      Object.fromEntries(
        Object.entries(draft)
          .filter(([key]) => key.startsWith("specific_"))
          .map(([key, value]) => [key.replace(/^specific_/, ""), value]),
      ),
    );
  }, []);

  useEffect(() => {
    if (errors.length === 0) return;
    errorsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [errors]);

  // Tras publicar, llevamos automaticamente al listado del owner (dentro del panel).
  useEffect(() => {
    if (!publishedSlug) return;
    const timer = window.setTimeout(() => {
      router.push(listingsPath);
      router.refresh();
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [publishedSlug, router, listingsPath]);

  function saveDraft() {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const draft: Record<string, string> = {};
    data.forEach((value, key) => {
      if (typeof value === "string") draft[key] = value;
    });
    draft.propertyType = propertyType;
    draft.operationType = operationType;
    draft.currency = currency;
    draft.conservationStatus = conservationStatus;
    Object.entries(specificSelections).forEach(([key, value]) => {
      draft[`specific_${key}`] = value;
    });
    localStorage.setItem("ariz.propertyDraft", JSON.stringify(draft));
  }

  function clearFieldError(key: string) {
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const nextErrors = { ...current };
      delete nextErrors[key];
      return nextErrors;
    });
  }

  function validateStepOne() {
    const form = formRef.current;
    if (!form) return true;

    const data = new FormData(form);
    const nextErrors: Record<string, string> = {};
    const title = text(data, "title");
    const description = text(data, "description");
    const price = Number(data.get("price"));

    if (!title) nextErrors.title = "Campo obligatorio";
    if (!Number.isFinite(price) || price <= 0) nextErrors.price = "Campo obligatorio";
    if (!description) {
      nextErrors.description = "Campo obligatorio";
    } else if (description.length < 100) {
      nextErrors.description = "Minimo 100 caracteres";
    }

    setFieldErrors(nextErrors);
    issuesRef.current = Object.values(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateStepTwo() {
    const form = formRef.current;
    if (!form) return true;

    const data = new FormData(form);
    const nextErrors: Record<string, string> = {};

    if (!text(data, "department")) nextErrors.department = "Campo obligatorio";
    if (!text(data, "province")) nextErrors.province = "Campo obligatorio";
    if (!text(data, "district")) nextErrors.district = "Campo obligatorio";
    if (!text(data, "address")) nextErrors.address = "Campo obligatorio";

    setFieldErrors(nextErrors);
    issuesRef.current = Object.values(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateStepThree() {
    const form = formRef.current;
    if (!form) return true;

    const data = new FormData(form);
    const nextErrors: Record<string, string> = {};
    const totalArea = num(data.get("totalArea"));
    const constructedArea = num(data.get("constructedArea"));

    config.fields.forEach((field) => {
      if (field.required && num(data.get(field.key)) === undefined) {
        nextErrors[field.key] = "Campo obligatorio";
      }
    });

    if (totalArea !== undefined && constructedArea !== undefined && constructedArea > totalArea) {
      nextErrors.constructedArea = "El área construida no puede superar el área total";
      nextErrors.totalArea = "Debe ser mayor o igual al área construida";
    }

    const year = num(data.get("constructionYear"));
    const currentYear = new Date().getFullYear();
    if (year !== undefined && (year < 1900 || year > currentYear)) {
      nextErrors.constructionYear = `Debe estar entre 1900 y ${currentYear}`;
    }

    const floor = num(data.get("floor"));
    const floors = num(data.get("floors"));
    if (floor !== undefined && floors !== undefined && floor > floors) {
      nextErrors.floor = "El piso no puede superar el total de pisos";
    }

    setFieldErrors(nextErrors);
    issuesRef.current = Object.values(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateStepFour() {
    const form = formRef.current;
    if (!form) return true;

    const data = new FormData(form);
    const nextErrors: Record<string, string> = {};
    const email = text(data, "contactEmail");
    const phone = text(data, "contactPhone");
    const whatsapp = text(data, "contactWhatsapp");
    const phonePattern = /^\d{9}$/;

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.contactEmail = "Ingresa un correo valido con @";
    }
    if (phone && !phonePattern.test(phone)) {
      nextErrors.contactPhone = "Debe tener 9 numeros";
    }
    if (whatsapp && !phonePattern.test(whatsapp)) {
      nextErrors.contactWhatsapp = "Debe tener 9 numeros";
    }

    setFieldErrors(nextErrors);
    issuesRef.current = Object.values(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function next() {
    const validators: Record<Step, () => boolean> = {
      1: validateStepOne,
      2: validateStepTwo,
      3: validateStepThree,
      4: validateStepFour,
    };
    const labels: Record<Step, string> = {
      1: "Información básica",
      2: "Ubicación",
      3: "Características",
      4: "Fotos y publicación",
    };

    setFieldErrors({});
    if (!validators[step]()) {
      const details = issuesRef.current;
      setErrors([
        details.length > 0
          ? `No puedes continuar con el paso ${step} (${labels[step]}): ${details.join(" · ")}`
          : `Revisa el paso ${step} (${labels[step]}): hay campos con error marcados en rojo.`,
      ]);
      return;
    }
    issuesRef.current = [];
    saveDraft();
    setErrors([]);
    setStep((current) => Math.min(4, current + 1) as Step);
  }

  function goToStep(target: Step) {
    if (target === step) return;
    if (target < step) {
      setFieldErrors({});
      issuesRef.current = [];
      setErrors([]);
      saveDraft();
      setStep(target);
      return;
    }

    const validators: Record<Step, () => boolean> = {
      1: validateStepOne,
      2: validateStepTwo,
      3: validateStepThree,
      4: validateStepFour,
    };
    const labels: Record<Step, string> = {
      1: "Informacion basica",
      2: "Ubicacion",
      3: "Caracteristicas",
      4: "Fotos y publicacion",
    };

    setFieldErrors({});
    for (let current = 1; current < target; current += 1) {
      const currentStep = current as Step;
      if (!validators[currentStep]()) {
        const details = issuesRef.current;
        setErrors([
          details.length > 0
            ? `Completa el paso ${currentStep} (${labels[currentStep]}) antes de continuar: ${details.join(" · ")}`
            : `Completa el paso ${currentStep} (${labels[currentStep]}) antes de continuar.`,
        ]);
        setStep(currentStep);
        return;
      }
    }

    issuesRef.current = [];
    saveDraft();
    setErrors([]);
    setStep(target);
  }

  function previous() {
    setFieldErrors({});
    issuesRef.current = [];
    setErrors([]);
    saveDraft();
    setStep((current) => Math.max(1, current - 1) as Step);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateStepOne()) {
      setStep(1);
      return;
    }
    if (!validateStepTwo()) {
      setStep(2);
      return;
    }
    if (!validateStepThree()) {
      setErrors([
        issuesRef.current.length > 0
          ? `Paso 3 - Corrige antes de publicar: ${issuesRef.current.join(" · ")}`
          : "Paso 3 - Revisa las características del inmueble.",
      ]);
      setStep(3);
      return;
    }
    if (!validateStepFour()) {
      setStep(4);
      return;
    }

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
        specificDetails: Object.fromEntries(
          config.specificFields
            .map((field) => [field.key, specificValue(form, field.key, field.type)] as const)
            .filter(([, value]) => value !== undefined && value !== false && value !== ""),
        ),
      },
      amenityCodes: selectedAmenities,
      media,
      contactName: text(form, "contactName") || undefined,
      contactEmail: text(form, "contactEmail") || undefined,
      contactPhone: text(form, "contactPhone") || undefined,
      contactWhatsapp: text(form, "contactWhatsapp") || undefined,
    };

    const missingStepOne = [
      !input.title && "titulo",
      !input.description && "descripcion",
      input.description && input.description.length < 100 && "descripcion minima de 100 caracteres",
      (!input.price || input.price <= 0) && "precio",
    ].filter(Boolean) as string[];

    const missingStepTwo = [
      !input.location.department && "departamento",
      !input.location.province && "provincia",
      !input.location.district && "distrito",
      !input.location.address && "direccion",
    ].filter(Boolean) as string[];

    const missingStepThree = config.fields
      .map((field) => (field.required && input.details[field.key] === undefined ? field.label : false))
      .filter(Boolean) as string[];

    if (
      input.details.totalArea !== undefined &&
      input.details.constructedArea !== undefined &&
      input.details.constructedArea > input.details.totalArea
    ) {
      missingStepThree.push("el área construida no puede superar el área total");
    }

    const missingStepFour = [
      input.media.length === 0 && "al menos una imagen",
      form.get("acceptTerms") !== "on" && "aceptar los terminos y condiciones",
    ].filter(Boolean) as string[];

    if (missingStepOne.length > 0) {
      setErrors([`Paso 1 - Falta completar: ${missingStepOne.join(", ")}`]);
      setStep(1);
      return;
    }

    if (missingStepTwo.length > 0) {
      setErrors([`Paso 2 - Falta completar: ${missingStepTwo.join(", ")}`]);
      setStep(2);
      return;
    }

    if (missingStepThree.length > 0) {
      setErrors([`Paso 3 - Falta completar: ${missingStepThree.join(", ")}`]);
      setStep(3);
      return;
    }

    if (missingStepFour.length > 0) {
      setErrors([`Paso 4 - Falta completar: ${missingStepFour.join(", ")}`]);
      setStep(4);
      return;
    }

    setErrors([]);
    setLoading(true);
    try {
      const created = await createProperty(input);
      const published = await publishProperty(created.id);
      localStorage.removeItem("ariz.propertyDraft");
      // Confirmamos dentro del panel y llevamos al owner a "Mis propiedades"
      // sin sacarlo de su perfil (antes iba a la ficha publica).
      setPublishedSlug(published.slug);
      setLoading(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo publicar la propiedad.";

      // El backend valida áreas, pisos y años: si rechaza, devolvemos al usuario al paso 3.
      const stepThreeFields = /área|area construida|piso|año|anio|construid/i.test(message);
      setErrors([message]);
      setLoading(false);
      if (stepThreeFields) setStep(3);
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
          throw new Error("Solo se permiten imagenes JPG, PNG o WEBP.");
        }
        if (file.size > 8 * 1024 * 1024) {
          throw new Error("Cada imagen debe pesar como maximo 8 MB.");
        }
        results.push(await uploadPropertyImage(file));
      }
      setUploadedImages((current) => [...current, ...results]);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "No se pudieron subir las imagenes."]);
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
    const parts = [
      text(data, "address"),
      text(data, "number"),
      text(data, "district"),
      text(data, "province"),
      text(data, "department"),
    ];

    if (!buildAddressQuery(parts)) {
      setErrors(["Completa la direccion antes de ubicarla en el mapa."]);
      return;
    }

    setLocating(true);
    setErrors([]);
    try {
      const place = await searchMapPlace(parts);

      if (!place) {
        setErrors(["No encontramos esa direccion. Ajusta distrito, provincia o referencia."]);
        return;
      }
      setLocation({ latitude: place.latitude, longitude: place.longitude });
      setLocationLabel(place.label);
    } catch {
      setErrors(["No pudimos consultar el mapa. Intentalo nuevamente."]);
    } finally {
      setLocating(false);
    }
  }

  return (
    <form
      ref={formRef}
      onInput={saveDraft}
      onChange={saveDraft}
      onSubmit={submit}
      className="grid min-w-0 gap-6"
    >
      <div
        hidden={publishedSlug !== null}
        className="overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]"
      >
        <div className="h-1.5 bg-brand" aria-hidden />
        <div className="p-4 sm:p-5">
          <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((item) => {
              const reached = item.step <= maxStepReached;
              return (
                <li key={item.step}>
                  <button
                    type="button"
                    onClick={() => goToStep(item.step)}
                    aria-current={step === item.step ? "step" : undefined}
                    className={`flex h-full w-full items-start gap-3 rounded-card px-3 py-3 text-left transition-colors ${
                      step === item.step
                        ? "bg-brand text-on-brand shadow-[var(--shadow-card)]"
                        : reached
                          ? "bg-surface-muted text-ink hover:bg-brand-soft"
                          : "bg-surface-muted text-ink hover:bg-brand-soft"
                    }`}
                  >
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                      step === item.step
                        ? "bg-white/15 text-white"
                        : reached
                          ? "border border-edge bg-surface text-brand"
                          : "border border-edge bg-surface text-muted"
                    }`}>
                      {item.step}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">{item.title}</span>
                      <span className={`block text-xs ${step === item.step ? "text-white/75" : "text-muted"}`}>{item.detail}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <main className="min-w-0 overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
        <div className="h-1.5 bg-brand" aria-hidden />
        <div className="p-5 sm:p-6 lg:p-8">
          {publishedSlug ? (
            <div className="grid justify-items-center gap-4 py-8 text-center sm:py-14">
              <span className="flex size-16 items-center justify-center rounded-full bg-success/12 text-success">
                <CheckIcon className="size-8" />
              </span>
              <p className="text-[11px] font-black tracking-[0.2em] text-accent uppercase">
                Publicacion exitosa
              </p>
              <h2 className="font-display text-3xl font-black tracking-tight text-brand">
                Tu propiedad ya esta publicada
              </h2>
              <p className="max-w-md text-sm text-muted">
                Ya es visible para los compradores. Te estamos llevando a{" "}
                <span className="font-semibold text-ink">Mis propiedades</span> para que la
                administres desde tu panel.
              </p>

              <div className="mt-2 flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
                <Link
                  href={ROUTES.property(publishedSlug)}
                  className="flex h-11 items-center justify-center gap-2 rounded-card border border-edge px-5 text-sm font-bold text-brand transition-colors hover:border-brand"
                >
                  Ver la publicacion
                </Link>
                <Link
                  href={listingsPath}
                  className="flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
                >
                  Ir a mis propiedades
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
          {errors.length > 0 ? (
            <div
              ref={errorsRef}
              role="alert"
              className="mb-5 rounded-card bg-error/10 px-4 py-3 text-sm font-semibold text-error"
            >
              {errors.map((error) => <p key={error}>{error}</p>)}
            </div>
          ) : null}

          <section hidden={step !== 1} className="grid gap-6">
              <StepHeader current={1} title="Informacion basica" detail="Tipo, operacion y precio." />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <input type="hidden" name="operationType" value={operationType} />
                  <p className="text-[13px] font-semibold text-brand">Que deseas hacer?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {OPERATION_OPTIONS.map((option) => {
                      const active = operationType === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setOperationType(option.value)}
                          className={`rounded-card border px-3 py-3 text-left transition-colors ${
                            active
                              ? "border-brand bg-brand text-on-brand shadow-[var(--shadow-card)]"
                              : "border-edge bg-surface hover:border-brand hover:bg-brand-soft"
                          }`}
                        >
                          <span className="block text-sm font-black leading-tight">{option.label}</span>
                          <span className={`text-xs ${active ? "text-white/75" : "text-muted"}`}>{option.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <p className="text-[13px] font-semibold text-brand">Tipo de propiedad</p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-8">
                    {PROPERTY_TYPE_OPTIONS.map((option) => {
                      const Icon = TYPE_ICONS[option.value];
                      const active = propertyType === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPropertyType(option.value)}
                          className={`flex min-h-20 min-w-0 flex-col items-center justify-center gap-2 rounded-card border px-2 py-3 text-center transition-colors sm:px-2.5 ${
                            active
                              ? "border-brand bg-brand text-on-brand shadow-[var(--shadow-card)]"
                              : "border-edge bg-surface hover:border-brand hover:bg-brand-soft"
                          }`}
                        >
                          <Icon className={`size-6 ${active ? "text-white" : "text-brand"}`} />
                          <span className="w-full min-w-0">
                            <span className="mx-auto block max-w-full break-words text-[11px] font-black leading-tight sm:text-[12px] lg:text-[10px] xl:text-[11px]">
                              {option.label}
                            </span>
                            <span className={`mt-0.5 hidden text-[10px] leading-tight md:block lg:hidden ${active ? "text-white/75" : "text-muted"}`}>{option.hint}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <p className="text-[13px] font-semibold text-brand">Moneda</p>
                  <Listbox
                    name="currency"
                    value={currency}
                    options={CURRENCY_OPTIONS}
                    onValueChange={(value) => setCurrency(value as "PEN" | "USD")}
                    triggerClassName="h-11 rounded-card border border-edge bg-surface px-3"
                  />
                </div>
                <Input name="price" label="Precio" type="number" min={1} error={fieldErrors.price} onInput={() => clearFieldError("price")} />
                <Input name="maintenanceFee" label="Mantenimiento mensual" type="number" min={0} />
                <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold text-brand">
                  <input name="negotiable" type="checkbox" />
                  Precio negociable
                </label>
              </div>
              <Input name="title" label="Titulo" maxLength={100} error={fieldErrors.title} onInput={() => clearFieldError("title")} />
              <div className="grid gap-1.5">
                <label className="text-[13px] font-semibold text-brand">Descripcion</label>
                <textarea
                  name="description"
                  minLength={100}
                  maxLength={5000}
                  aria-invalid={fieldErrors.description ? true : undefined}
                  onInput={() => clearFieldError("description")}
                  className={`min-h-36 rounded-card border bg-surface p-3 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25 ${
                    fieldErrors.description ? "border-error focus:outline-error" : "border-edge"
                  }`}
                />
                {fieldErrors.description ? <p className="text-xs text-error">{fieldErrors.description}</p> : null}
                {!fieldErrors.description ? <p className="text-xs text-muted">Minimo 100 caracteres.</p> : null}
              </div>
            </section>

          <section hidden={step !== 2} className="grid gap-6">
              <StepHeader current={2} title="Ubicacion" detail="Indica donde se encuentra el inmueble." />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input name="department" label="Departamento/Region" error={fieldErrors.department} onInput={() => clearFieldError("department")} />
                <Input name="province" label="Provincia" error={fieldErrors.province} onInput={() => clearFieldError("province")} />
                <Input name="district" label="Distrito" error={fieldErrors.district} onInput={() => clearFieldError("district")} />
                <Input name="address" label="Direccion" error={fieldErrors.address} onInput={() => clearFieldError("address")} />
                <Input name="number" label="Numero" />
                <Input name="sector" label="Urbanizacion/Sector" />
                <Input name="reference" label="Referencia" className="sm:col-span-3" />
                <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold text-brand">
                  <input name="approximateLocation" type="checkbox" defaultChecked />
                  Mostrar ubicacion aproximada publicamente
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
                    {locating ? "Ubicando..." : "Ubicar direccion"}
                  </button>
                </div>
                {step === 2 ? (
                  <LocationPicker latitude={location.latitude} longitude={location.longitude} onChange={setLocation} />
                ) : (
                  <div className="h-80 w-full rounded-card border border-edge bg-surface-muted" />
                )}
              </div>
            </section>

          <section hidden={step !== 3} className="grid gap-6">
              <StepHeader current={3} title="Caracteristicas" detail={`Campos relevantes para ${config.label.toLowerCase()}.`} />
              <div className="grid gap-4 sm:grid-cols-3">
                {config.fields.map((field) => (
                  <Input
                    key={field.key}
                    name={field.key}
                    label={field.label}
                    type="number"
                    min={0}
                    error={fieldErrors[field.key]}
                    onInput={() => clearFieldError(field.key)}
                  />
                ))}
                <div className="grid gap-1.5">
                  <p className="text-[13px] font-semibold text-brand">Estado de conservacion</p>
                  <Listbox
                    name="conservationStatus"
                    value={conservationStatus}
                    options={CONSERVATION_STATUS_OPTIONS}
                    onValueChange={setConservationStatus}
                    triggerClassName="h-11 rounded-card border border-edge bg-surface px-3"
                  />
                </div>
              </div>
              {config.specificFields.length > 0 ? (
                <div className="rounded-card border border-edge bg-canvas/60 p-4">
                  <div>
                    <h3 className="text-base font-bold text-brand">Datos especificos de {config.label.toLowerCase()}</h3>
                    <p className="mt-1 text-xs font-medium text-muted">{config.hint}</p>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {config.specificFields.map((field) => {
                      if (field.type === "boolean") {
                        return (
                          <label key={field.key} className="flex min-h-11 items-center gap-2 rounded-card border border-edge bg-surface px-3 text-sm font-semibold text-ink">
                            <input name={`specific_${field.key}`} type="checkbox" />
                            {field.label}
                          </label>
                        );
                      }

                      if (field.type === "select") {
                        return (
                          <div key={field.key} className="grid gap-1.5">
                            <p className="text-[13px] font-semibold text-brand">{field.label}</p>
                            <Listbox
                              name={`specific_${field.key}`}
                              value={specificSelections[field.key] ?? ""}
                              options={[
                                { value: "", label: "Seleccionar" },
                                ...(field.options?.map((option) => ({ value: option, label: option })) ?? []),
                              ]}
                              onValueChange={(value) => setSpecificSelections((current) => ({ ...current, [field.key]: value }))}
                              triggerClassName="h-11 rounded-card border border-edge bg-surface px-3"
                            />
                          </div>
                        );
                      }

                      return (
                        <Input
                          key={field.key}
                          name={`specific_${field.key}`}
                          label={field.label}
                          type={field.type === "number" ? "number" : "text"}
                          min={field.type === "number" ? 0 : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <div>
                <h3 className="text-base font-bold text-brand">Comodidades</h3>
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

          <section hidden={step !== 4} className="grid gap-6">
              <StepHeader current={4} title="Fotos y publicacion" detail="La primera imagen sera la portada de la publicacion." />
              <div className="grid gap-1.5">
                <label className="text-[13px] font-semibold text-brand">Sube fotos del inmueble</label>
                <div className="rounded-card border border-dashed border-brand/40 bg-brand-soft/60 p-8 text-center">
                  <input
                    id="property-images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    onChange={(event) => handleFiles(event.target.files)}
                  />
                  <label htmlFor="property-images" className="inline-flex h-11 cursor-pointer items-center justify-center rounded-card bg-brand px-5 text-sm font-bold text-on-brand shadow-[var(--shadow-card)]">
                    {uploading ? "Subiendo..." : "Seleccionar archivos"}
                  </label>
                  <p className="mt-2 text-xs text-muted">JPG, PNG o WEBP. Maximo 8 MB por imagen.</p>
                </div>
                {uploadedImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {uploadedImages.map((image, index) => (
                      <div key={image.publicId} className="relative aspect-[4/3] overflow-hidden rounded-card border border-edge bg-cover bg-center shadow-[var(--shadow-card)]" style={{ backgroundImage: `url(${image.url})` }}>
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
                <p className="text-xs text-muted">Las imagenes se cargan desde tu equipo y quedan almacenadas en Cloudinary.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="contactName" label="Nombre de contacto" />
                <Input
                  name="contactEmail"
                  label="Email de contacto"
                  type="email"
                  error={fieldErrors.contactEmail}
                  onInput={() => clearFieldError("contactEmail")}
                />
                <Input
                  name="contactPhone"
                  label="Telefono"
                  inputMode="numeric"
                  maxLength={9}
                  pattern="[0-9]{9}"
                  error={fieldErrors.contactPhone}
                  onInput={() => clearFieldError("contactPhone")}
                />
                <Input
                  name="contactWhatsapp"
                  label="WhatsApp"
                  inputMode="numeric"
                  maxLength={9}
                  pattern="[0-9]{9}"
                  error={fieldErrors.contactWhatsapp}
                  onInput={() => clearFieldError("contactWhatsapp")}
                />
              </div>
              <label className="flex items-start gap-2 text-sm text-muted">
                <input name="acceptTerms" type="checkbox" className="mt-1" />
                Acepto los terminos y condiciones de publicacion de ARIZ.
              </label>
            </section>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-edge pt-5 sm:flex-row sm:justify-between">
            <Button variant="secondary" onClick={previous} disabled={step === 1 || loading}>Anterior</Button>
            {step < 4 ? (
              <Button onClick={next}>Continuar</Button>
            ) : (
              <Button type="submit" disabled={loading}>{loading ? "Publicando..." : "Publicar propiedad"}</Button>
            )}
          </div>
            </>
          )}
        </div>
      </main>
    </form>
  );
}
