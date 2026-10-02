"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Listbox,
  PinIcon,
  SearchIcon,
  type ListboxOption,
} from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import type { SearchOperation, SearchPropertyType } from "@/features/search/types/search";
import { SEARCH_PROPERTY_TYPES } from "@/features/search/types/search";

interface SearchTab {
  key: string;
  label: string;
  operation: SearchOperation;
  fixedType?: SearchPropertyType;
  /** Sin esto, el tipo todavía no tiene soporte real en el backend. */
}

const TABS: readonly SearchTab[] = [
  { key: "buy", label: "Comprar", operation: "buy" },
  { key: "rent", label: "Alquilar", operation: "rent" },
  { key: "projects", label: "Proyectos", operation: "buy", fixedType: "projects" },
  { key: "land", label: "Terrenos", operation: "buy", fixedType: "land" },
];

const UNSUPPORTED_TYPES = new Set<SearchPropertyType>(["country-lots"]);
const SELECTABLE_TYPES = SEARCH_PROPERTY_TYPES.filter((option) => !UNSUPPORTED_TYPES.has(option.value));
const CURRENCY_OPTIONS: readonly ListboxOption[] = [
  { value: "PEN", label: "PEN · S/" },
  { value: "USD", label: "USD · $" },
];

const FIELD_LABEL = "text-[10px] font-bold tracking-[0.12em] text-brand";
const FIELD_CONTROL =
  "w-full bg-transparent text-sm text-ink placeholder:text-muted/70 focus:outline-none";
const PRICE_CONTROL =
  "h-9 w-full min-w-0 rounded bg-surface-muted/60 px-3 text-sm font-medium text-ink placeholder:text-muted/70 transition-colors focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/30";

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

export function SearchForm() {
  const router = useRouter();
  const typeLabelId = useId();
  const [tabKey, setTabKey] = useState<string>(TABS[0].key);
  const [type, setType] = useState<SearchPropertyType>("all");
  const [currency, setCurrency] = useState("PEN");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const tab = TABS.find((item) => item.key === tabKey) ?? TABS[0];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedType = tab.fixedType ?? (String(form.get("type") ?? "all") as SearchPropertyType);
    const district = String(form.get("location") ?? "").trim();
    const params = new URLSearchParams();

    params.set("operation", tab.operation === "rent" ? "rent" : "buy");
    if (selectedType !== "all" && !UNSUPPORTED_TYPES.has(selectedType)) {
      params.set("type", selectedType);
    }
    if (district) params.set("district", district);

    const min = String(form.get("priceMin") ?? "").trim();
    const max = String(form.get("priceMax") ?? "").trim();
    if (min) params.set("priceMin", min);
    if (max) params.set("priceMax", max);

    router.push(`/propiedades?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-md bg-surface text-left shadow-[0_10px_24px_rgb(11_27_92_/_0.16)]"
    >
      <div
        role="tablist"
        aria-label="Tipo de búsqueda"
        className="grid grid-cols-4 rounded-t-md border-b border-edge bg-white"
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
              "-mb-px border-b-2 px-3 py-2.5 text-[12px] font-bold transition-colors",
              item.key === tab.key
                ? "border-accent text-brand"
                : "border-transparent text-muted hover:text-brand",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-[1.1fr_0.95fr_1.65fr_auto] lg:items-center lg:gap-0 lg:p-0">
        <label className="flex flex-col gap-1.5 lg:px-5 lg:py-3.5">
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

        <div className="flex flex-col gap-1.5 lg:border-l lg:border-edge lg:px-5 lg:py-3.5">
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
            listClassName="min-w-0"
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-1 lg:px-5 lg:py-3">
          <div className="flex items-center justify-between gap-3">
            <span className={FIELD_LABEL}>RANGO DE PRECIO</span>
            <Listbox
              name="currency"
              value={currency}
              options={CURRENCY_OPTIONS}
              onValueChange={setCurrency}
              label="Moneda"
              className="w-28 shrink-0"
              triggerClassName="h-7 rounded bg-surface-muted/60 px-2.5 text-xs font-bold focus-visible:ring-2 focus-visible:ring-brand/30"
              listClassName="min-w-0"
            />
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
            <input
              name="priceMin"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="Mínimo"
              aria-label="Precio mínimo"
              className={PRICE_CONTROL}
              value={priceMin}
              onChange={(event) => setPriceMin(event.target.value.replace(/\D/g, ""))}
            />
            <span aria-hidden className="text-muted">
              —
            </span>
            <input
              name="priceMax"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="Máximo"
              aria-label="Precio máximo"
              className={PRICE_CONTROL}
              value={priceMax}
              onChange={(event) => setPriceMax(event.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-1 lg:px-4">
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-bold whitespace-nowrap text-on-accent transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:w-auto"
          >
            <SearchIcon className="size-4" />
            Buscar propiedades
          </button>
        </div>
      </div>

    </form>
  );
}
