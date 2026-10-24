"use client";

import { useState } from "react";
import { useFormContext, useWatch, type FieldPath } from "react-hook-form";
import { FieldSet, useFieldError } from "@/shared/ui/field-shell";
import { Checkbox } from "@/shared/ui/checkbox";
import { ChipGroup, RadioGroup } from "@/shared/ui/radio-group";
import { NumericField, SelectField, TextAreaField, TextField } from "@/shared/ui/rhf-fields";
import {
  FINANCING_CONDITIONS,
  PROJECT_AMENITIES,
  PROJECT_CATEGORY_LABELS,
  PROJECT_SERVICES,
  PROJECT_STAGES,
} from "@/features/projects/data/project-catalogs";
import { MIN_DESCRIPTION_LENGTH, type ProjectCurrency, type ProjectDraft } from "@/features/projects/types/draft";

const SOCIAL_FIELDS: readonly {
  name: FieldPath<ProjectDraft>;
  label: string;
  placeholder: string;
}[] = [
  { name: "social.instagram", label: "Instagram", placeholder: "instagram.com/miproyecto" },
  { name: "social.tiktok", label: "TikTok", placeholder: "tiktok.com/@miproyecto" },
  { name: "social.facebook", label: "Facebook", placeholder: "facebook.com/miproyecto" },
  { name: "social.website", label: "Sitio web", placeholder: "miproyecto.com" },
];

const CURRENCY_OPTIONS = [
  { value: "PEN", label: "Soles (S/)" },
  { value: "USD", label: "Dolares ($)" },
] as const;

const CURRENCY_PREFIX = {
  PEN: "S/",
  USD: "$",
} as const;

export function StepProjectInfo() {
  const amenitiesError = useFieldError<ProjectDraft>("amenities");
  const descriptionError = useFieldError<ProjectDraft>("description");
  const { getValues, setValue } = useFormContext<ProjectDraft>();
  const currency = (useWatch({ name: "currency" }) ?? "PEN") as ProjectCurrency;
  const apartments = useWatch({ name: "category" }) === "departamentos";
  const currencyPrefix = CURRENCY_PREFIX[currency];
  const [withSocial, setWithSocial] = useState(false);
  const [withMoreFinancing, setWithMoreFinancing] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <FieldSet legend="Tipo de propiedad y fase" required>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <p className="text-[13px] font-semibold text-brand">Tipo de propiedad</p>
            <SelectField<ProjectDraft> name="category" label="Tipo de proyecto" options={Object.entries(PROJECT_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))} />
          </div>
          <div className="grid gap-2">
            <p className="text-[13px] font-semibold text-brand">Fase actual</p>
            <RadioGroup<ProjectDraft>
              name="stage"
              ariaLabel="Fase actual del proyecto"
              options={PROJECT_STAGES}
              size="sm"
            />
          </div>
        </div>
      </FieldSet>

      <FieldSet legend="Datos del proyecto" required>
        <div className="flex flex-col gap-4">
          <TextField<ProjectDraft>
            name="name"
            label="Nombre del proyecto"
            placeholder="Residencial Los Álamos"
            maxLength={80}
            required
          />
          <TextAreaField<ProjectDraft>
            name="description"
            label="Descripción"
            placeholder="Cuéntale al comprador qué encuentra en el proyecto: ubicación, amenities, forma de pago, fecha de entrega…"
            rows={5}
            maxLength={1200}
            required
            hint={
              descriptionError
                ? undefined
                : `Mínimo ${MIN_DESCRIPTION_LENGTH} caracteres. Este texto es el que más pesa en el posicionamiento.`
            }
          />
        </div>
      </FieldSet>

      <FieldSet
        legend="Precios de referencia"
        description="Se muestran como rango en la ficha pública."
        required
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField<ProjectDraft>
            name="currency"
            label="Moneda"
            options={CURRENCY_OPTIONS}
            required
          />
          <NumericField<ProjectDraft>
            name="priceFrom"
            label="Precio desde"
            prefix={currencyPrefix}
            placeholder="85000"
            required
          />
          <NumericField<ProjectDraft>
            name="priceTo"
            label="Precio hasta"
            prefix={currencyPrefix}
            placeholder="145000"
            required
          />
        </div>
      </FieldSet>

      <FieldSet
        legend="Titular y financiamiento"
        description="Si completas el RUC, la razón social pasa a ser obligatoria."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField<ProjectDraft>
            name="ruc"
            label="RUC"
            inputMode="numeric"
            maxLength={11}
            placeholder="20601234567"
            hint="11 dígitos, sin letras ni guiones."
          />
          <TextField<ProjectDraft>
            name="businessName"
            label="Razón social"
            placeholder="Inmobiliaria Los Andes S.A.C."
          />
          <NumericField<ProjectDraft>
            name="downPayment"
            label="Cuota inicial"
            prefix={currencyPrefix}
            placeholder="8500"
          />
          <NumericField<ProjectDraft>
            name="monthlyPayment"
            label="Cuota mensual"
            prefix={currencyPrefix}
            placeholder="1250"
          />
          <NumericField<ProjectDraft>
            name="totalBlocks"
            label={apartments ? "Total de edificios" : "Total de manzanas"}
            step={1}
            placeholder="6"
            hint={apartments ? "Torres o edificios proyectados." : "Manzanas o bloques proyectados."}
          />
          <NumericField<ProjectDraft>
            name="totalLots"
            label={apartments ? "Total de departamentos" : "Total de lotes"}
            step={1}
            placeholder="48"
            hint="Si aún no lo defines, se completa con el inventario."
          />
        </div>
      </FieldSet>

      <FieldSet
        legend="Condiciones de financiamiento"
        description="Contado está seleccionado por defecto. Las modalidades elegidas se muestran en la ficha pública."
      >
        <div className="flex flex-col gap-4">
          <ChipGroup<ProjectDraft>
            name="financing"
            options={FINANCING_CONDITIONS.slice(0, 1)}
          />
          <Checkbox
            checked={withMoreFinancing}
            onChange={(event) => {
              const enabled = event.target.checked;
              setWithMoreFinancing(enabled);

              if (!enabled) {
                const financing = getValues("financing") ?? [];
                setValue(
                  "financing",
                  financing.filter((value) => value === "cash"),
                  { shouldDirty: true, shouldValidate: true },
                );
              }
            }}
            label="Agregar otras opciones de financiamiento"
            labelClassName="text-[13px] font-semibold text-brand"
          />
          {withMoreFinancing ? (
            <div className="grid gap-2 border-l-2 border-brand/15 pl-4">
              <p className="text-xs font-medium text-muted">Selecciona las modalidades adicionales:</p>
              <ChipGroup<ProjectDraft>
                name="financing"
                options={FINANCING_CONDITIONS.slice(1)}
              />
            </div>
          ) : null}
        </div>
      </FieldSet>

      <FieldSet
        legend="Redes sociales del proyecto"
        description="Opcional. Actívalo solo si vas a mostrarlas en la ficha pública."
      >
        <div className="flex flex-col gap-4">
          <Checkbox
            checked={withSocial}
            onChange={(event) => setWithSocial(event.target.checked)}
            label="Agregar redes sociales del proyecto"
            labelClassName="text-[13px] font-semibold text-brand"
          />
          {withSocial ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {SOCIAL_FIELDS.map((field) => (
                <TextField<ProjectDraft>
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  type="url"
                  inputMode="url"
                  placeholder={field.placeholder}
                />
              ))}
            </div>
          ) : null}
        </div>
      </FieldSet>

      <FieldSet
        legend="Servicios y amenities"
        description="Servicios con los que cuenta el proyecto y amenidades destacadas en la ficha."
        required
      >
        <div className="flex flex-col gap-4">
          <ChipGroup<ProjectDraft> name="services" options={PROJECT_SERVICES} />
          <ChipGroup<ProjectDraft>
            name="amenities"
            options={PROJECT_AMENITIES}
            className={amenitiesError ? "rounded-card bg-error/5 p-2" : undefined}
          />
          {amenitiesError ? (
            <p className="text-sm text-error" role="alert">
              {amenitiesError}
            </p>
          ) : null}
        </div>
      </FieldSet>

      <FieldSet legend="Datos registrales">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField<ProjectDraft>
            name="urbanizationName"
            label="Nombre de la urbanización"
            placeholder="URP. Los Álamos"
          />
          <TextField<ProjectDraft>
            name="registryEntry"
            label="Partida registral"
            placeholder="15123456"
            hint="Se muestra como referencia de respaldo."
          />
        </div>
      </FieldSet>
    </div>
  );
}
