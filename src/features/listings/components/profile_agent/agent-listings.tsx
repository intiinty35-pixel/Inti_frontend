"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { Listing } from "@/features/listings/types/listing";
import { AgentListingRow, getListingMeta } from "@/features/listings/components/profile_agent/agent-listing-row";

const OPERATION_LABEL: Record<string, string> = {
  buy: "En venta",
  rent: "En alquiler",
  invest: "Inversión",
};

const TYPE_LABEL: Record<string, string> = {
  houses: "Casa",
  apartments: "Departamento",
  land: "Terreno",
  commercial: "Local comercial",
  projects: "Proyecto",
  "country-lots": "Lote de campo",
};

/* Rangos sobre el monto numerico (sin convertir moneda). */
const PRICE_RANGES = [
  { value: "", label: "Cualquier precio", min: 0, max: Infinity },
  { value: "0-100000", label: "Hasta 100 mil", min: 0, max: 100_000 },
  { value: "100000-250000", label: "100 mil – 250 mil", min: 100_000, max: 250_000 },
  { value: "250000-500000", label: "250 mil – 500 mil", min: 250_000, max: 500_000 },
  { value: "500000-", label: "Más de 500 mil", min: 500_000, max: Infinity },
];

const SORT_OPTIONS = [
  { value: "default", label: "Más relevantes" },
  { value: "price-asc", label: "Menor precio" },
  { value: "price-desc", label: "Mayor precio" },
];

const ROOM_OPTIONS = [
  { value: "", label: "Cualquiera" },
  { value: "1", label: "1+ dormitorios" },
  { value: "2", label: "2+ dormitorios" },
  { value: "3", label: "3+ dormitorios" },
  { value: "4", label: "4+ dormitorios" },
];

const fieldClass =
  "h-12 w-full rounded-card border border-edge bg-surface px-4 text-sm font-bold text-ink shadow-sm outline-none transition hover:border-brand/40 focus:border-brand focus:ring-2 focus:ring-brand/15";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  ariaLabel: string;
  compact?: boolean;
  alignRight?: boolean;
  className?: string;
}

/* Dropdown propio: reemplaza el select nativo para poder darle diseño a la lista. */
function Dropdown({ value, onChange, options, placeholder, ariaLabel, compact, alignRight, className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selected = options.find((option) => option.value === value);
  const isActive = Boolean(value) && Boolean(placeholder);
  const triggerLabel = placeholder && !value ? placeholder : (selected?.label ?? placeholder ?? "");

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-card border bg-surface text-left text-sm shadow-sm outline-none transition hover:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/15 ${
          compact ? "h-10 px-3 font-semibold" : "h-12 px-4 font-bold"
        } ${isActive || open ? "border-brand text-brand" : "border-edge text-ink"}`}
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-brand transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute top-full z-30 mt-2 max-h-72 min-w-full overflow-auto rounded-card border border-edge bg-surface p-1.5 shadow-[var(--shadow-pop)] ${
            alignRight ? "right-0" : "left-0"
          }`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left text-sm whitespace-nowrap transition-colors ${
                    isSelected ? "bg-brand/10 font-bold text-brand" : "font-semibold text-ink hover:bg-surface-muted"
                  }`}
                >
                  {option.label}
                  {isSelected ? (
                    <Check aria-hidden="true" className="size-4 shrink-0" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

interface AgentListingsProps {
  listings: Listing[];
  agentName: string;
  whatsappDigits?: string;
}

export function AgentListings({ listings, agentName, whatsappDigits }: AgentListingsProps) {
  const [query, setQuery] = useState("");
  const [operation, setOperation] = useState("");
  const [type, setType] = useState("");
  const [rooms, setRooms] = useState("");
  const [price, setPrice] = useState("");
  const [sort, setSort] = useState("default");

  const operations = useMemo(
    () => Array.from(new Set(listings.map((l) => getListingMeta(l).operation).filter(Boolean))) as string[],
    [listings],
  );
  const types = useMemo(
    () => Array.from(new Set(listings.map((l) => getListingMeta(l).type).filter(Boolean))) as string[],
    [listings],
  );

  const operationOptions = useMemo<DropdownOption[]>(
    () => [
      { value: "", label: "Todas las operaciones" },
      ...operations.map((value) => ({ value, label: OPERATION_LABEL[value] ?? value })),
    ],
    [operations],
  );
  const typeOptions = useMemo<DropdownOption[]>(
    () => [
      { value: "", label: "Todos los inmuebles" },
      ...types.map((value) => ({ value, label: TYPE_LABEL[value] ?? value })),
    ],
    [types],
  );
  const priceOptions = useMemo<DropdownOption[]>(
    () => PRICE_RANGES.map((range) => ({ value: range.value, label: range.label })),
    [],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const range = PRICE_RANGES.find((r) => r.value === price) ?? PRICE_RANGES[0];
    const minRooms = Number(rooms) || 0;

    const result = listings.filter((listing) => {
      const meta = getListingMeta(listing);
      if (term) {
        const haystack = [listing.location.district, listing.location.department, listing.title]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (operation && meta.operation !== operation) return false;
      if (type && meta.type !== type) return false;
      if (minRooms && (meta.rooms ?? 0) < minRooms) return false;
      const amount = listing.price.amount;
      if (amount < range.min || amount > range.max) return false;
      return true;
    });

    if (sort === "price-asc") result.sort((a, b) => a.price.amount - b.price.amount);
    if (sort === "price-desc") result.sort((a, b) => b.price.amount - a.price.amount);
    return result;
  }, [listings, query, operation, type, rooms, price, sort]);

  const hasFilters = Boolean(query || operation || type || rooms || price);

  function clearFilters() {
    setQuery("");
    setOperation("");
    setType("");
    setRooms("");
    setPrice("");
  }

  return (
    <div>
      {/* Filtros */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ingresa departamentos o distritos"
          aria-label="Buscar por distrito"
          className={`${fieldClass} font-medium placeholder:text-muted sm:col-span-2 lg:col-span-1`}
        />
        <Dropdown
          value={operation}
          onChange={setOperation}
          options={operationOptions}
          placeholder="Operación"
          ariaLabel="Operación"
        />
        <Dropdown value={type} onChange={setType} options={typeOptions} placeholder="Inmueble" ariaLabel="Inmueble" />
        <Dropdown
          value={rooms}
          onChange={setRooms}
          options={ROOM_OPTIONS}
          placeholder="Dormitorios"
          ariaLabel="Dormitorios"
        />
        <Dropdown
          value={price}
          onChange={setPrice}
          options={priceOptions}
          placeholder="Precio"
          ariaLabel="Precio"
          alignRight
        />
      </div>

      {/* Contador + orden */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-ink">
          {filtered.length} {filtered.length === 1 ? "propiedad" : "propiedades"} de {agentName}
          {hasFilters ? (
            <button type="button" onClick={clearFilters} className="ml-3 text-xs font-bold text-brand underline">
              Limpiar filtros
            </button>
          ) : null}
        </p>
        <div className="flex items-center gap-2 text-sm font-bold text-ink">
          <span>Ordenar</span>
          <Dropdown
            value={sort}
            onChange={setSort}
            options={SORT_OPTIONS}
            ariaLabel="Ordenar"
            compact
            alignRight
            className="min-w-48"
          />
        </div>
      </div>

      {/* Lista */}
      {filtered.length > 0 ? (
        <div className="mt-4 flex flex-col gap-4">
          {filtered.map((listing) => (
            <AgentListingRow key={listing.id} listing={listing} whatsappDigits={whatsappDigits} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-card border border-dashed border-edge bg-surface-muted p-10 text-center text-sm text-muted">
          {listings.length === 0
            ? "Este agente aún no tiene propiedades publicadas."
            : "No hay propiedades que coincidan con tus filtros."}
        </div>
      )}
    </div>
  );
}