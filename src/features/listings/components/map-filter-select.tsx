"use client";

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import styles from './map-filter-select.module.css';

type Option = { value: string; label: string };

export function MapFilterSelect({ label, value, options, onChange, compact = false }: {
  label: string; value: string; options: Option[]; onChange: (value: string) => void; compact?: boolean;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number; width: number }>();
  const selected = options.find(option => option.value === value);
  function close() { setPosition(undefined); trigger.current?.focus(); }
  function open(last = false) {
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(Math.max(rect.width, 250), window.innerWidth - 24);
    setPosition({ left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), top: rect.bottom + 10, width });
    requestAnimationFrame(() => {
      const items = menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]');
      items?.[last ? items.length - 1 : Math.max(0, options.findIndex(option => option.value === value))]?.focus();
    });
  }
  useEffect(() => {
    if (!position) return;
    function dismiss(event: PointerEvent) {
      if (!menu.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setPosition(undefined);
    }
    function hide(event: Event) {
      if (event.target instanceof Node && menu.current?.contains(event.target)) return;
      setPosition(undefined);
    }
    document.addEventListener('pointerdown', dismiss);
    window.addEventListener('resize', hide);
    window.addEventListener('scroll', hide, true);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      window.removeEventListener('resize', hide);
      window.removeEventListener('scroll', hide, true);
    };
  }, [position]);
  return <div className={`${styles.field} ${compact ? styles.compact : ''}`}>
    {!compact && <span id={`${id}-label`} className={styles.label}>{label}</span>}
    <button ref={trigger} type="button" className={styles.trigger} aria-label={`${label}: ${selected?.label ?? ''}`} aria-haspopup="menu" aria-expanded={!!position} aria-controls={position ? id : undefined}
      onClick={() => position ? close() : open()} onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(event.key === 'ArrowUp'); }
      }}><span>{selected?.label ?? 'Seleccionar'}</span><ChevronDown size={15} className={position ? styles.rotated : ''} /></button>
    {position && createPortal(<div ref={menu} id={id} role="menu" aria-label={label} className={styles.menu} style={{ left: position.left, top: position.top, width: position.width, maxHeight: `min(340px, calc(100dvh - ${position.top + 12}px))` }} onKeyDown={event => {
      const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []);
      const current = items.indexOf(document.activeElement as HTMLButtonElement);
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      else if (event.key === 'Tab') setPosition(undefined);
      else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items[next]?.focus();
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
        const match = items.find((item, index) => index > current && item.textContent?.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase())) ?? items.find(item => item.textContent?.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()));
        match?.focus();
      }
    }}><p className={styles.menuTitle}>{label}</p>{options.map(option => <button key={option.value} type="button" role="menuitemradio" aria-checked={value === option.value} tabIndex={-1} className={styles.option} onClick={() => { onChange(option.value); close(); }}><span>{option.label}</span>{value === option.value && <Check size={16} />}</button>)}</div>, document.body)}
  </div>;
}
