"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
<<<<<<< HEAD
=======
  ChevronDownIcon,
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
  CrosshairIcon,
  Listbox,
  MapIcon,
  PinIcon,
  SearchIcon,
  SlidersIcon,
  type ListboxOption,
} from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
<<<<<<< HEAD
import type { SearchCurrency, SearchOperation, SearchPropertyType } from "@/features/search/types/search";
import {
  SEARCH_CURRENCIES,
  SEARCH_PROPERTY_TYPES,
} from "@/features/search/types/search";
=======
import type { SearchOperation, SearchPropertyType } from "@/features/search/types/search";
import { SEARCH_PROPERTY_TYPES } from "@/features/search/types/search";
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a

interface SearchTab {
  key: string;
  label: string;
  operation: SearchOperation;
  fixedType?: SearchPropertyType;
}

const TABS: readonly SearchTab[] = [
  { key: "buy", label: "Comprar", operation: "buy" },
  { key: "rent", label: "Alquilar", operation: "rent" },
  { key: "projects", label: "Proyectos", operation: "buy", fixedType: "projects" },
  { key: "land", label: "Terrenos", operation: "buy", fixedType: "land" },
];

const SELECTABLE_TYPES = SEARCH_PROPERTY_TYPES.filter((option) => option.value !== "projects");

const FIELD_LABEL = "text-[10px] font-bold tracking-[0.12em] text-brand";
const FIELD_CONTROL =
  "w-full bg-transparent text-sm text-ink placeholder:text-muted/70 focus:outline-none";

<<<<<<< HEAD
const NUMBER_CONTROL = cn(
  "h-9 min-w-0 flex-1 rounded-card border border-edge bg-surface px-2.5 text-sm text-ink tabular-nums",
  "placeholder:text-muted/70 focus:border-brand focus:outline-2 focus:outline-brand/25",
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
);

=======
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
const TRIGGER_CONTROL = "w-full text-sm text-ink";

function typeOptions(fixedType: SearchPropertyType | undefined): readonly ListboxOption[] {
  if (!fixedType) {
    return SELECTABLE_TYPES;
  }

  return [
    {
      value: fixedType,
      label: SEARCH_PROPERTY_TYPES.find((option) => option.value === fixedType)?.label ?? "",
    },
  ];
}

function toSlugs(location: string): string[] {
  return location
    .split(",")
    .map((part) =>
      part
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean);
}

export function SearchForm() {
  const router = useRouter();
  const typeLabelId = useId();
  const [tabKey, setTabKey] = useState<string>(TABS[0].key);
  const [type, setType] = useState<SearchPropertyType>("all");
<<<<<<< HEAD
  const [currency, setCurrency] = useState<SearchCurrency>("PEN");
=======
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
  const tab = TABS.find((item) => item.key === tabKey) ?? TABS[0];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedType = tab.fixedType ?? (String(form.get("type") ?? "all") as SearchPropertyType);
    const location = toSlugs(String(form.get("location") ?? ""));
    const params = new URLSearchParams();

    const min = String(form.get("priceMin") ?? "").trim();
    const max = String(form.get("priceMax") ?? "").trim();
    if (min) params.set("price_min", min);
    if (max) params.set("price_max", max);
    if (min || max) params.set("currency", String(form.get("currency") ?? "PEN"));

    const path = `/${tab.operation}/${selectedType}${location.map((slug) => `/${slug}`).join("")}`;
    const query = params.toString();
    router.push(query ? `${path}?${query}` : path);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-surface text-left shadow-[var(--shadow-pop)]"
    >
      <div
        role="tablist"
        aria-label="Tipo de búsqueda"
        className="flex justify-center rounded-t-2xl border-b border-edge"
      >
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={item.key === tab.key}
            onClick={() => {
              setTabKey(item.key);
              setType("all");
            }}
            className={cn(
              "-mb-px border-b-2 px-5 py-3.5 text-[13px] font-bold transition-colors sm:px-7",
              item.key === tab.key
                ? "border-accent text-brand"
                : "border-transparent text-muted hover:text-brand",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

<<<<<<< HEAD
      <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.05fr)_minmax(0,1.5fr)_auto] lg:items-center lg:gap-0 lg:p-0">
        <label className="flex min-w-0 flex-col gap-1.5 lg:px-6 lg:py-5">
=======
      <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 lg:grid-cols-[1.35fr_1.1fr_1.4fr_auto] lg:items-center lg:gap-0 lg:p-0">
        <label className="flex flex-col gap-1.5 lg:px-6 lg:py-5">
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
          <span className={FIELD_LABEL}>UBICACIÓN</span>
          <span className="flex items-center gap-2 text-muted">
            <PinIcon className="size-4 shrink-0" />
            <input
              name="location"
              type="text"
              placeholder="¿Dónde quieres buscar?"
              autoComplete="off"
              className={FIELD_CONTROL}
            />
          </span>
        </label>

<<<<<<< HEAD
        <div className="flex min-w-0 flex-col gap-1.5 lg:border-l lg:border-edge lg:px-6 lg:py-5">
=======
        <div className="flex flex-col gap-1.5 lg:border-l lg:border-edge lg:px-6 lg:py-5">
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
          <span className={FIELD_LABEL} id={typeLabelId}>
            TIPO DE PROPIEDAD
          </span>
          <Listbox
            name="type"
            value={tab.fixedType ?? type}
            options={typeOptions(tab.fixedType)}
            onValueChange={(value) => setType(value as SearchPropertyType)}
            disabled={Boolean(tab.fixedType)}
            labelledBy={typeLabelId}
            triggerClassName={TRIGGER_CONTROL}
          />
        </div>

<<<<<<< HEAD
        <div className="flex min-w-0 flex-col gap-1.5 md:col-span-2 lg:col-span-1 lg:border-l lg:border-edge lg:px-6 lg:py-5">
          <span className={FIELD_LABEL}>RANGO DE PRECIO</span>
          <div className="flex items-center gap-2">
            <Listbox
              name="currency"
              value={currency}
              options={SEARCH_CURRENCIES}
              onValueChange={(value) => setCurrency(value as SearchCurrency)}
              variant="chip"
              label="Moneda"
              className="w-auto shrink-0"
            />
=======
        <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-1 lg:border-l lg:border-edge lg:px-6 lg:py-5">
          <span className={FIELD_LABEL}>RANGO DE PRECIO</span>
          <div className="flex items-center gap-2">
            <span className="relative flex items-center">
              <select
                name="currency"
                aria-label="Moneda"
                className="cursor-pointer appearance-none bg-transparent pr-4 text-xs font-bold text-ink focus:outline-none"
              >
                <option value="PEN">PEN / S/</option>
                <option value="USD">USD / $</option>
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-0 size-3.5 text-muted" />
            </span>
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
            <input
              name="priceMin"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Mín."
              aria-label="Precio mínimo"
<<<<<<< HEAD
              className={NUMBER_CONTROL}
=======
              className={cn(FIELD_CONTROL, "min-w-0 flex-1")}
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
            />
            <span aria-hidden className="text-muted">
              —
            </span>
            <input
              name="priceMax"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Máx."
              aria-label="Precio máximo"
<<<<<<< HEAD
              className={NUMBER_CONTROL}
=======
              className={cn(FIELD_CONTROL, "min-w-0 flex-1")}
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
            />
          </div>
        </div>

<<<<<<< HEAD
        <div className="min-w-0 self-end md:col-span-2 lg:col-span-1 lg:py-5 lg:pr-5 lg:pl-3">
          <button
            type="submit"
            className="flex h-9 w-full max-w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-brand px-5 text-sm font-bold whitespace-nowrap text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:w-auto"
          >
            <SearchIcon className="size-4" />
            Buscar
=======
        <div className="md:col-span-2 lg:col-span-1 lg:px-5">
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold whitespace-nowrap text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:w-auto"
          >
            <SearchIcon className="size-4" />
            Buscar propiedades
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-edge px-5 py-3 text-[11px] font-semibold text-ink lg:px-6">
        {[
          { icon: <SlidersIcon className="size-4 text-muted" />, label: "Más filtros" },
          { icon: <CrosshairIcon className="size-4 text-muted" />, label: "Propiedades cerca de mí" },
          { icon: <MapIcon className="size-4 text-muted" />, label: "Buscar en mapa" },
        ].map((item) => (
          <span
            key={item.label}
            title="Disponible próximamente"
            className="flex cursor-default items-center gap-2"
          >
            {item.icon}
            {item.label}
          </span>
        ))}
      </div>
    </form>
  );
}
