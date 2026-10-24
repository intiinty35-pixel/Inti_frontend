"use client";

import { useFieldArray, useWatch } from "react-hook-form";
import { FieldSet, useFieldError } from "@/shared/ui/field-shell";
import { NumericField, SelectField, TextField } from "@/shared/ui/rhf-fields";
import { RadioGroup } from "@/shared/ui/radio-group";
import { Button } from "@/shared/ui/button";
import { AreaIcon, PlusIcon, RulerIcon, TrashIcon } from "@/shared/ui/icons";
import {
  LOT_MODES,
  LOT_STATUSES,
  LOT_STATUS_LABELS,
  LOT_STATUS_TONES,
} from "@/features/projects/data/project-catalogs";
import { createEmptyLot } from "@/features/projects/lib/project-draft";
import { summarizeLots } from "@/features/projects/lib/project-summary";
import {
  type LotDraft,
  type LotMode,
  type LotStatus,
  type ProjectCurrency,
  type ProjectDraft,
} from "@/features/projects/types/draft";
import { formatArea, formatNumber, formatPrice } from "@/shared/lib/format";

const BATCH_SIZE = 5;

interface LotRowProps {
  index: number;
  mode: LotMode;
  currency: ProjectDraft["currency"];
  canRemove: boolean;
  onRemove: (index: number) => void;
}

const CURRENCY_PREFIX = {
  PEN: "S/",
  USD: "$",
} as const;

function LotRow({ index, mode, currency, canRemove, onRemove }: LotRowProps) {
  const lot = useWatch({ name: `lots.${index}` }) as LotDraft | undefined;
  const status: LotStatus = lot?.status ?? "disponible";
  const isGroup = mode === "grupo";
  const lotCountError = useFieldError<ProjectDraft>(`lots.${index}.lotCount`);
  const rowLabel = isGroup ? `Grupo ${index + 1}` : `Ficha ${index + 1}`;

  return (
    <li className="flex flex-col gap-3 rounded-card border border-edge bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-brand">
          {rowLabel}
          {lot?.lotNumber.trim() ? ` · ${lot.lotNumber.trim()}` : ""}
          {isGroup && lot?.lotCount ? ` · ${formatNumber(lot.lotCount)} lotes` : ""}
        </h4>

        <div className="flex items-center gap-1">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${LOT_STATUS_TONES[status]}`}
          >
            {LOT_STATUS_LABELS[status]}
          </span>

          {canRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onRemove(index)}
              aria-label={`Quitar ${rowLabel.toLowerCase()}`}
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <TextField<ProjectDraft>
          name={`lots.${index}.lotNumber`}
          label={isGroup ? "Nombre del grupo" : "Número de lote"}
          placeholder={isGroup ? "Grupo A" : "L-014"}
          required
        />
        <TextField<ProjectDraft>
          name={`lots.${index}.block`}
          label="Manzana / bloque"
          placeholder="A"
        />
        {isGroup ? (
          <NumericField<ProjectDraft>
            name={`lots.${index}.lotCount`}
            label="Cantidad de lotes"
            placeholder="12"
            inputMode="numeric"
            step={1}
            error={lotCountError}
            required
          />
        ) : null}
        <NumericField<ProjectDraft>
          name={`lots.${index}.areaM2`}
          label={isGroup ? "Área por lote" : "Área"}
          placeholder="120"
          inputMode="decimal"
          required
        />
        <NumericField<ProjectDraft>
          name={`lots.${index}.frontM`}
          label="Frente (m)"
          placeholder="8.5"
          inputMode="decimal"
          step="any"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <NumericField<ProjectDraft>
          name={`lots.${index}.price`}
          label={isGroup ? "Precio por lote" : "Precio"}
          prefix={CURRENCY_PREFIX[currency]}
          placeholder="95000"
          inputMode="decimal"
          required
        />

        <SelectField<ProjectDraft>
          name={`lots.${index}.status`}
          label="Estado"
          options={LOT_STATUSES}
          required
        />

        <TextField<ProjectDraft>
          name={`lots.${index}.planLocation`}
          label="Ubicación en el plano"
          placeholder="Manzana A, lote 14"
          className="lg:col-span-2"
        />
      </div>
    </li>
  );
}

export function StepLots() {
  const { append, remove, fields } = useFieldArray({ name: "lots" });
  const lots = useWatch({ name: "lots" });
  const apartments = useWatch({ name: "category" }) === "departamentos";
  const lotMode = useWatch({ name: "lotMode" }) ?? "individual";
  const currency = (useWatch({ name: "currency" }) ?? "PEN") as ProjectCurrency;
  const lotModeError = useFieldError<ProjectDraft>("lotMode");
  const lotsError = useFieldError<ProjectDraft>("lots");
  const totals = summarizeLots(lots ?? [], lotMode);
  const isGroup = lotMode === "grupo";

  if (apartments) return <FieldSet legend="Edificios, pisos y departamentos" description="La distribución de departamentos se administra por edificio y piso en el editor del plano.">
    <p className="text-sm leading-7 text-muted">Guarda el proyecto y abre su editor del plano. Allí podrás dibujar los edificios sobre Google Maps, crear los pisos, cargar sus planos y registrar cada departamento con su metraje, precio de venta o alquiler y mantenimiento mensual.</p>
  </FieldSet>;

  return (
    <div className="flex flex-col gap-6">
      <FieldSet
        legend="Modo de inventario"
        description="Individual para una ficha por lote; grupo para una ficha por grupo de lotes."
        required
        className="gap-5 p-5 sm:p-6 [&>p]:text-sm [&>p]:leading-relaxed"
      >
        <RadioGroup<ProjectDraft>
          name="lotMode"
          ariaLabel="Modo de inventario"
          options={LOT_MODES}
          columns={2}
          className="grid-cols-1 gap-4 sm:grid-cols-2 [&>label]:flex [&>label]:min-h-28 [&>label]:gap-2 [&>label]:p-5 [&>label]:focus-within:ring-2 [&>label]:focus-within:ring-brand/30 [&>label>span:first-of-type]:text-sm [&>label>span:last-of-type]:text-xs [&>label>span:last-of-type]:leading-relaxed"
        />
        {lotModeError ? (
          <p className="text-sm text-error" role="alert">
            {lotModeError}
          </p>
        ) : null}
      </FieldSet>

      <FieldSet
        legend={`Lotes · ${isGroup ? `${formatNumber(totals.totalUnits)} en ${totals.filledLots} grupos` : `${totals.filledLots} completos de ${fields.length}`}`}
        description={
          isGroup
            ? "Cada grupo guarda la cantidad de lotes, el área y el precio de cada uno. Solo se guardan los grupos con nombre, cantidad, área y precio completos."
            : "Solo se guardan las fichas con número, área y precio completos."
        }
        required
        error={lotsError}
      >
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <LotRow
                key={field.id}
                index={index}
                mode={lotMode}
                currency={currency}
                canRemove={fields.length > 1}
                onRemove={remove}
              />
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => append(createEmptyLot())}>
              <PlusIcon className="h-4 w-4" />
              {isGroup ? "Agregar grupo" : "Agregar ficha"}
            </Button>

            {fields.length <= 10 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => append(Array.from({ length: BATCH_SIZE }, createEmptyLot))}
              >
                Agregar {BATCH_SIZE} {isGroup ? "grupos" : "fichas"}
              </Button>
            ) : null}
          </div>
        </div>
      </FieldSet>

      <FieldSet legend="Resumen del inventario" description="Calculado sobre las fichas completas.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-card border border-edge p-3">
            <p className="text-xs font-semibold text-muted">Área total</p>
            <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-ink">
              <AreaIcon className="h-4 w-4 text-brand" />
              {formatArea(totals.totalAreaM2) || "—"}
            </p>
            {isGroup ? (
              <p className="text-[11px] text-muted">Suma de los {formatNumber(totals.totalUnits)} lotes</p>
            ) : null}
          </div>

          <div className="rounded-card border border-edge p-3">
            <p className="text-xs font-semibold text-muted">Valor del inventario</p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {totals.filledLots > 0 ? formatPrice(totals.totalPrice, currency) : "—"}
            </p>
          </div>

          <div className="rounded-card border border-edge p-3">
            <p className="text-xs font-semibold text-muted">Rango por lote</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <RulerIcon className="h-4 w-4 text-brand" />
              {totals.cheapestPrice === undefined
                ? "—"
                : `${formatPrice(totals.cheapestPrice, currency)} – ${formatPrice(totals.dearestPrice ?? 0, currency)}`}
            </p>
          </div>

          <div className="rounded-card border border-edge p-3">
            <p className="text-xs font-semibold text-muted">Manzanas</p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {totals.blocks.length > 0 ? totals.blocks.join(", ") : "—"}
            </p>
            <p className="text-[11px] text-muted">
              {isGroup
                ? `${formatNumber(totals.totalUnits)} lotes · ${totals.blankLots} grupos sin completar`
                : `${formatNumber(totals.filledLots)} fichas · ${totals.blankLots} sin completar`}
            </p>
          </div>
        </div>

        <ul className="flex flex-wrap gap-2">
          {LOT_STATUSES.map((option) => {
            const key = option.value as LotStatus;

            return (
              <li
                key={option.value}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${LOT_STATUS_TONES[key]}`}
              >
                {option.label} · {totals.byStatus[key]}
              </li>
            );
          })}
        </ul>
      </FieldSet>
    </div>
  );
}
