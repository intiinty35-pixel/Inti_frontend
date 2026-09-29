"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
}

export interface SearchComboboxProps {
  value?: string;
  options: readonly ComboboxOption[];
  onValueChange: (option: ComboboxOption) => void;
  placeholder?: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  emptyLabel?: string;
  id?: string;
  className?: string;
}

const MAX_RESULTS = 8;

/**
 * Combobox con búsqueda por texto, a diferencia de `Listbox`, que solo navega
 * un conjunto cerrado de opciones. Mismo patrón ARIA: el foco se queda en el
 * input y la opción activa se marca con `aria-activedescendant`.
 */
export function SearchCombobox({
  value,
  options,
  onValueChange,
  placeholder = "Escribe para buscar",
  label,
  hint,
  error,
  required = false,
  emptyLabel = "Sin coincidencias",
  id,
  className,
}: SearchComboboxProps) {
  const currentValue = value ?? "";
  const baseId = useId();
  const inputId = id ?? `${baseId}-input`;
  const listId = `${baseId}-list`;
  const messageId = `${baseId}-message`;
  const errorId = `${baseId}-error`;
  const [query, setQuery] = useState(currentValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [syncedValue, setSyncedValue] = useState(currentValue);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Ajuste durante el render: cuando la selección cambia desde fuera (cascada de
  // provincia/distrito), el texto del input sigue a `value`.
  if (syncedValue !== currentValue) {
    setSyncedValue(currentValue);
    setQuery(currentValue);
    setActiveIndex(0);
  }

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (term === "" || term === currentValue.toLowerCase()) {
      return options.slice(0, MAX_RESULTS);
    }

    return options
      .filter((option) => `${option.label} ${option.description ?? ""}`.toLowerCase().includes(term))
      .slice(0, MAX_RESULTS);
  }, [options, query, currentValue]);

  function typeQuery(next: string) {
    setQuery(next);
    setActiveIndex(0);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleOutside(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({
      block: "nearest",
    });
  }, [open, activeIndex]);

  function commit(index: number) {
    const option = results[index];

    if (option) {
      onValueChange(option);
      setSyncedValue(option.label);
      setQuery(option.label);
      setActiveIndex(0);
    }

    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const last = results.length - 1;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setOpen(true);
        setActiveIndex((current) => Math.min(last, current + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setOpen(true);
        setActiveIndex((current) => Math.max(0, current - 1));
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(Math.max(0, last));
        }
        break;
      case "Enter":
        if (open) {
          event.preventDefault();
          commit(activeIndex);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        } else {
          setSyncedValue(currentValue);
          setQuery(currentValue);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  }

  return (
    <div ref={rootRef} className={cn("relative flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-[13px] font-semibold text-brand">
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </label>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
        <input
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(hint && messageId, error && errorId) || undefined}
          aria-activedescendant={open && results.length > 0 ? `${baseId}-option-${activeIndex}` : undefined}
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            typeQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-11 w-full rounded-card border border-edge bg-surface pr-9 pl-9 text-sm text-ink placeholder:text-muted/70",
            "focus:border-brand focus:outline-2 focus:outline-brand/25",
            error && "border-error",
          )}
        />
        <ChevronDownIcon
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </div>

      {hint ? (
        <p id={messageId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-xs text-error">
          {error}
        </p>
      ) : null}

      {open ? (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          aria-label={label}
          className="absolute top-full left-0 z-40 mt-2 max-h-72 w-full overflow-y-auto rounded-card border border-edge bg-surface p-1 shadow-[var(--shadow-pop)]"
        >
          {results.length === 0 ? (
            <li className="px-3 py-2.5 text-xs text-muted">{emptyLabel}</li>
          ) : (
            results.map((option, index) => {
              const isSelected = option.value === currentValue;
              const isActive = index === activeIndex;

              return (
                <li
                  key={option.value}
                  id={`${baseId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  data-active={isActive}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(index)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 rounded-[6px] px-3 py-2 text-sm text-ink",
                    isActive && "bg-surface-muted",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.description ? (
                      <span className="block truncate text-[11px] text-muted">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                  {isSelected ? <CheckIcon className="size-3.5 shrink-0 text-brand" /> : null}
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
