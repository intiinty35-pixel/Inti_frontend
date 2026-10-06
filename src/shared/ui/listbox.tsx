"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { CheckIcon, ChevronDownIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";

export interface ListboxOption {
  value: string;
  label: string;
}

export interface ListboxProps {
  /** Campo del form: se envía un input hidden para que el valor viaje en el FormData. */
  name: string;
  value: string;
  options: readonly ListboxOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  labelledBy?: string;
  triggerClassName?: string;
  listClassName?: string;
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
  disabled = false,
  label,
  labelledBy,
  triggerClassName,
  listClassName,
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
    <div
      ref={rootRef}
      className={cn(
        // Al abrir, la raíz sube a z-[120] para que su listado quede por encima de
        // los listbox hermanos (cada raíz es z-[100]); sin esto, el popup de un
        // campo queda tapado por el resto de los selects del formulario.
        "relative overflow-visible",
        open ? "z-[120]" : "z-[100]",
        className,
      )}
    >
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
          "flex w-full items-center justify-between gap-2 text-left text-sm text-ink",
          disabled ? "cursor-default" : "cursor-pointer",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          triggerClassName,
        )}
      >
        <span className={cn("truncate", !selected && "text-muted/70")}>
          {selected?.label ?? "Selecciona"}
        </span>
        <ChevronDownIcon
          className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          aria-labelledby={labelledBy ?? triggerId}
          className={cn(
            // z-[70]: el panel del mapa vive dentro de un modal (z-60) y la lista de
            // opciones tiene que quedar por encima del mapa y de su propia cabecera.
            "absolute top-full left-0 z-[70] mt-2 max-h-64 w-full overflow-y-auto rounded-card border border-edge bg-surface p-1 shadow-[var(--shadow-pop)]",
            listClassName ?? "min-w-56",
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
                  "flex cursor-pointer items-center justify-between gap-2 rounded-[6px] px-3 py-2 text-sm text-ink",
                  isActive && "bg-surface-muted",
                  isSelected && "font-semibold text-brand",
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected ? <CheckIcon className="size-3.5 shrink-0 text-brand" /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
