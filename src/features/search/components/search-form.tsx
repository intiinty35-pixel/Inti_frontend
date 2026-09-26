"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDownIcon,
  CrosshairIcon,
  MapIcon,
  PinIcon,
  SearchIcon,
  SlidersIcon,
} from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import type { SearchOperation, SearchPropertyType } from "@/features/search/types/search";
import { SEARCH_PROPERTY_TYPES } from "@/features/search/types/search";

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
  const [tabKey, setTabKey] = useState<string>(TABS[0].key);
  const tab = TABS.find((item) => item.key === tabKey) ?? TABS[0];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const type = tab.fixedType ?? (String(form.get("type") ?? "all") as SearchPropertyType);
    const location = toSlugs(String(form.get("location") ?? ""));
    const params = new URLSearchParams();

    const min = String(form.get("priceMin") ?? "").trim();
    const max = String(form.get("priceMax") ?? "").trim();
    if (min) params.set("price_min", min);
    if (max) params.set("price_max", max);
    if (min || max) params.set("currency", String(form.get("currency") ?? "PEN"));

    const path = `/${tab.operation}/${type}${location.map((slug) => `/${slug}`).join("")}`;
    const query = params.toString();
    router.push(query ? `${path}?${query}` : path);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full overflow-hidden rounded-2xl bg-surface text-left shadow-[var(--shadow-pop)]"
    >
      <div role="tablist" aria-label="Tipo de búsqueda" className="flex justify-center border-b border-edge">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={item.key === tab.key}
            onClick={() => setTabKey(item.key)}
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

      <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 lg:grid-cols-[1.35fr_1.1fr_1.4fr_auto] lg:items-center lg:gap-0 lg:p-0">
        <label className="flex flex-col gap-1.5 lg:px-6 lg:py-5">
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

        <label className="flex flex-col gap-1.5 lg:border-l lg:border-edge lg:px-6 lg:py-5">
          <span className={FIELD_LABEL}>TIPO DE PROPIEDAD</span>
          <span className="relative flex items-center">
            <select
              name="type"
              defaultValue="all"
              disabled={Boolean(tab.fixedType)}
              key={tab.fixedType ?? "free"}
              className={cn(FIELD_CONTROL, "cursor-pointer appearance-none pr-6 disabled:cursor-default")}
            >
              {tab.fixedType ? (
                <option value={tab.fixedType}>
                  {SEARCH_PROPERTY_TYPES.find((option) => option.value === tab.fixedType)?.label}
                </option>
              ) : (
                SELECTABLE_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-0 size-4 text-muted" />
          </span>
        </label>

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
            <input
              name="priceMin"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Mín."
              aria-label="Precio mínimo"
              className={cn(FIELD_CONTROL, "min-w-0 flex-1")}
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
              className={cn(FIELD_CONTROL, "min-w-0 flex-1")}
            />
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-1 lg:px-5">
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold whitespace-nowrap text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:w-auto"
          >
            <SearchIcon className="size-4" />
            Buscar propiedades
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
