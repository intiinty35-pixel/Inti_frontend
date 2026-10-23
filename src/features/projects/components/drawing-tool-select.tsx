"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import type { PlanTool } from "@/shared/ui/site-plan-map";
import s from "./site-plan.module.css";

type Option = { value: PlanTool; label: string; icon: LucideIcon };

export function DrawingToolSelect({ value, options, disabled, onChange }: {
  value: PlanTool;
  options: Option[];
  disabled: boolean;
  onChange: (value: PlanTool) => void;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const selected = options.findIndex(option => option.value === value);
  const current = options[Math.max(0, selected)];
  const Icon = current.icon;
  const expanded = open && !disabled;
  useEffect(() => {
    if (!expanded) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [expanded]);

  function select(index: number) {
    setOpen(false);
    onChange(options[index].value);
    trigger.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Tab" || event.key === "Escape") {
      setOpen(false);
      if (event.key === "Escape" && expanded) { event.preventDefault(); event.stopPropagation(); }
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (event.key === "Enter" || event.key === " ") {
        if (expanded) select(active);
        else { setActive(Math.max(0, selected)); setOpen(true); }
        return;
      }
      const index = expanded ? active : Math.max(0, selected);
      setActive(event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowUp" ? -1 : 1) + options.length) % options.length);
      setOpen(true);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const index = options.findIndex(option => option.label.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()));
      if (index >= 0) { event.preventDefault(); setActive(index); setOpen(true); }
    }
  }

  return (
    <div ref={root} className={s.drawingSelect} data-disabled={disabled || undefined}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <span id={`${id}-label`}>Qué quieres diseñar</span>
      <div className={s.drawingSelectControl}>
        <button ref={trigger} type="button" className={s.drawingSelectTrigger}
          role="combobox" aria-expanded={expanded} aria-haspopup="listbox"
          aria-controls={`${id}-list`} aria-labelledby={`${id}-label ${id}-value`}
          aria-activedescendant={expanded ? `${id}-option-${active}` : undefined}
          disabled={disabled} onKeyDown={onKeyDown}
          onClick={() => { setActive(Math.max(0, selected)); setOpen(!expanded); }}>
          <span className={s.drawingSelectIcon}><Icon size={16} aria-hidden="true" /></span>
          <span id={`${id}-value`}>{current.label}</span>
          <ChevronDown className={s.drawingSelectChevron} size={14} aria-hidden="true" />
        </button>
        {expanded && <ul id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`} className={s.drawingSelectMenu}>
          {options.map((option, index) => {
            const OptionIcon = option.icon;
            return <li key={option.value} id={`${id}-option-${index}`} role="option"
              aria-selected={value === option.value} data-active={active === index || undefined}
              onPointerMove={() => setActive(index)} onPointerDown={event => event.preventDefault()}
              onClick={() => select(index)}>
              <OptionIcon size={16} aria-hidden="true" />
              <span>{option.label}</span>
              {value === option.value && <Check size={15} aria-hidden="true" />}
            </li>;
          })}
        </ul>}
      </div>
    </div>
  );
}
