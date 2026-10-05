"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { cn } from "@/shared/lib/cn";
import { Listbox, type ListboxOption } from "@/shared/ui";
import type { ListingOperation, PropertyType, SortOption } from "@/features/listings/types/listing";

const OPERATIONS: readonly ListboxOption[] = [
  { value: "buy", label: "Comprar" },
  { value: "rent", label: "Alquilar" },
];

const TYPES: readonly ListboxOption[] = [
  { value: "", label: "Tipo de propiedad" },
  { value: "houses", label: "Casas" },
  { value: "apartments", label: "Departamentos" },
  { value: "land", label: "Terrenos" },
  { value: "projects", label: "Proyectos" },
  { value: "commercial", label: "Locales comerciales" },
];

const ROOM_OPTIONS: readonly ListboxOption[] = [
  { value: "", label: "Dormitorios" },
  { value: "1", label: "1 o más" },
  { value: "2", label: "2 o más" },
  { value: "3", label: "3 o más" },
  { value: "4", label: "4 o más" },
];

export interface PropertyFiltersValue {
  operation: ListingOperation;
  type?: PropertyType;
  district?: string;
  roomsMin?: number;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
}

const SELECT_CLASS =
  "h-12 rounded-card border border-edge bg-surface px-3 text-sm text-ink outline-none focus:border-brand focus:ring-4 focus:ring-[var(--focus-ring)]";

/** El `Listbox` de marca ya trae borde y foco; solo se ajusta la altura al formulario. */
const LISTBOX_TRIGGER =
  "h-12 rounded-card border border-edge bg-surface px-3 text-sm font-medium text-ink focus-visible:border-brand focus-visible:outline-4 focus-visible:outline-[var(--focus-ring)]";

export function PropertyFiltersBar({ value, basePath }: { value: PropertyFiltersValue; basePath: string }) {
  const router = useRouter();
  const [showMore, setShowMore] = useState(
    Boolean(value.priceMin || value.priceMax || value.areaMin),
  );
  const [draft, setDraft] = useState(value);

  function applyDraft(next: PropertyFiltersValue) {
    setDraft(next);
    const params = new URLSearchParams();
    params.set("operation", next.operation);
    if (next.type) params.set("type", next.type);
    if (next.district) params.set("district", next.district);
    if (next.roomsMin) params.set("roomsMin", String(next.roomsMin));
    if (next.priceMin) params.set("priceMin", String(next.priceMin));
    if (next.priceMax) params.set("priceMax", String(next.priceMax));
    if (next.areaMin) params.set("areaMin", String(next.areaMin));
    router.push(`${basePath}?${params.toString()}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyDraft(draft);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative z-10 isolate rounded-card border border-edge bg-surface p-4 shadow-[var(--shadow-card)]"
    >
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <input
          className={cn(SELECT_CLASS, "px-4")}
          placeholder="Buscar por distrito"
          defaultValue={draft.district}
          onBlur={(event) => applyDraft({ ...draft, district: event.target.value || undefined })}
        />
        <Listbox
          name="operation"
          value={draft.operation}
          options={OPERATIONS}
          onValueChange={(value) => applyDraft({ ...draft, operation: value as ListingOperation })}
          label="Operación"
          triggerClassName={LISTBOX_TRIGGER}
          listClassName="min-w-full"
        />
        <Listbox
          name="type"
          value={draft.type ?? ""}
          options={TYPES}
          onValueChange={(value) =>
            applyDraft({ ...draft, type: (value || undefined) as PropertyType | undefined })
          }
          label="Tipo de propiedad"
          triggerClassName={LISTBOX_TRIGGER}
          listClassName="min-w-full"
        />
        <Listbox
          name="roomsMin"
          value={draft.roomsMin ? String(draft.roomsMin) : ""}
          options={ROOM_OPTIONS}
          onValueChange={(value) =>
            applyDraft({ ...draft, roomsMin: value ? Number(value) : undefined })
          }
          label="Dormitorios"
          triggerClassName={LISTBOX_TRIGGER}
          listClassName="min-w-full"
        />
        <button
          type="button"
          onClick={() => setShowMore((prev) => !prev)}
          className="h-12 rounded-card border border-brand px-4 text-sm font-bold text-brand transition-colors hover:bg-brand-soft"
        >
          Más filtros
        </button>
      </div>

      {showMore ? (
        <div className="mt-3 grid gap-3 border-t border-edge pt-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <input
            type="number"
            min={0}
            className={SELECT_CLASS}
            placeholder="Precio mínimo (S/)"
            defaultValue={draft.priceMin}
            onBlur={(event) =>
              setDraft((prev) => ({
                ...prev,
                priceMin: event.target.value ? Number(event.target.value) : undefined,
              }))
            }
          />
          <input
            type="number"
            min={0}
            className={SELECT_CLASS}
            placeholder="Precio máximo (S/)"
            defaultValue={draft.priceMax}
            onBlur={(event) =>
              setDraft((prev) => ({
                ...prev,
                priceMax: event.target.value ? Number(event.target.value) : undefined,
              }))
            }
          />
          <input
            type="number"
            min={0}
            className={SELECT_CLASS}
            placeholder="Área mínima (m²)"
            defaultValue={draft.areaMin}
            onBlur={(event) =>
              setDraft((prev) => ({
                ...prev,
                areaMin: event.target.value ? Number(event.target.value) : undefined,
              }))
            }
          />
          <button
            type="submit"
            className="h-12 rounded-card bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            Aplicar
          </button>
        </div>
      ) : null}
    </form>
  );
}

const SORT_OPTIONS: readonly ListboxOption[] = [
  { value: "recent", label: "Más recientes" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
];

export function SortSelect({
  value,
  basePath,
  currentParams,
}: {
  value?: SortOption;
  basePath: string;
  currentParams: Record<string, string | undefined>;
}) {
  const router = useRouter();

  function handleChange(nextSort: string) {
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    if (nextSort) params.set("sort", nextSort);
    else params.delete("sort");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="relative z-10 isolate w-48">
      <Listbox
        name="sort"
        value={value ?? "recent"}
        options={SORT_OPTIONS}
        onValueChange={handleChange}
        label="Ordenar resultados"
        className="w-full"
        triggerClassName="h-10 rounded-card border border-edge bg-surface px-3 text-sm font-bold text-brand focus-visible:border-brand"
        listClassName="min-w-full"
      />
    </div>
  );
}
