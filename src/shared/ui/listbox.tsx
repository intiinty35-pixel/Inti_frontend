"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { CheckIcon, ChevronDownIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";

export interface ListboxOption {
  value: string;
  label: string;
}

export type ListboxVariant = "field" | "chip";

export interface ListboxProps {
  /** Campo del form: se envía un input hidden para que el valor viaje en el FormData. */
  name: string;
  value: string;
  options: readonly ListboxOption[];
  onValueChange: (value: string) => void;
  /** `field` ocupa la celda del formulario; `chip` es un disparador compacto tipo pastilla. */
  variant?: ListboxVariant;
  disabled?: boolean;
  label?: string;
  labelledBy?: string;
  triggerClassName?: string;
  className?: string;
  id?: string;
}

/**
 * Combobox de opciones en lugar de `<select>` nativo, para que el popup herede
 * la paleta y el radio de la marca. El foco permanece en el botón y la opción
 * activa se marca con `aria-activedescendant` (patrón combobox de la WAI-ARIA).
 */
export function Listbox({
  name,
  value,
  options,
  onValueChange,
  variant = "field",
  disabled = false,
  label,
  labelledBy,
  triggerClassName,
  className,
  id,
}: ListboxProps) {
  const baseId = useId();
  const triggerId = id ?? `${baseId}-trigger`;
  const listId = `${baseId}-list`;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

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

    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function openList(index: number) {
    setActiveIndex(index);
    setOpen(true);
  }

  function commit(index: number) {
    const option = options[index];

    if (option) {
      onValueChange(option.value);
    }

    setOpen(false);
  }

  function move(delta: number) {
    setActiveIndex((current) => Math.min(options.length - 1, Math.max(0, current + delta)));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = options.length - 1;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (open) {
          move(1);
        } else {
          openList(Math.min(last, (selectedIndex >= 0 ? selectedIndex : 0) + 1));
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (open) {
          move(-1);
        } else {
          openList(Math.max(0, (selectedIndex >= 0 ? selectedIndex : 0) - 1));
        }
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
          setActiveIndex(last);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) {
          commit(activeIndex);
        } else {
          openList(selectedIndex >= 0 ? selectedIndex : 0);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
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
    <div ref={rootRef} className={cn("relative", className)}>
      <input type="hidden" name={name} value={value} />

      <button
        id={triggerId}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-label={label}
        aria-labelledby={labelledBy}
        aria-activedescendant={open ? `${baseId}-option-${activeIndex}` : undefined}
        onClick={() => (open ? setOpen(false) : openList(selectedIndex >= 0 ? selectedIndex : 0))}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex items-center text-left transition-colors",
          variant === "chip"
            ? "h-9 w-full justify-between gap-1.5 rounded-card bg-brand-soft px-2.5 text-xs font-bold whitespace-nowrap text-brand hover:bg-brand-soft/70"
            : "w-full justify-between gap-2 text-sm text-ink",
          disabled ? "cursor-default" : "cursor-pointer",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          triggerClassName,
        )}
      >
        <span className={cn("truncate", !selected && "text-muted/70")}>
          {selected?.label ?? "Selecciona"}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-3.5 shrink-0 text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          aria-labelledby={labelledBy ?? triggerId}
          className={cn(
            "absolute top-full left-0 z-40 mt-1.5 max-h-64 overflow-y-auto rounded-card border border-edge bg-surface p-1 shadow-[var(--shadow-pop)]",
            variant === "chip" ? "w-max min-w-full" : "w-full min-w-44",
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
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
                  "flex cursor-pointer items-center justify-between gap-2 rounded-[6px] px-2.5 py-1.5 text-xs whitespace-nowrap text-ink",
                  isActive && "bg-surface-muted",
                  isSelected && "font-bold text-brand",
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected ? <CheckIcon className="size-3 shrink-0 text-brand" /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
