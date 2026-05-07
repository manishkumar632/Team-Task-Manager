"use client";

import { useEffect, useRef, useState, useId, useCallback } from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
  hint?: string;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Visual size */
  size?: "sm" | "md";
  /** Visual variant */
  variant?: "default" | "pill" | "ghost";
  ariaLabel?: string;
};

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  className = "",
  size = "md",
  variant = "default",
  ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const selected = options.find((o) => o.value === value);
  const selectedIndex = options.findIndex((o) => o.value === value);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close]);

  // Close on Escape; init active index when opening
  useEffect(() => {
    if (!open) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, selectedIndex, close]);

  // Scroll active into view
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${activeIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < options.length) {
        onChange(options[activeIndex].value);
        close();
        btnRef.current?.focus();
      }
    } else if (e.key === "Tab") {
      close();
    }
  };

  const sizeCls =
    size === "sm" ? "h-8 px-3 text-xs" : "h-11 px-4 text-sm";
  const variantCls =
    variant === "pill"
      ? "rounded-full"
      : variant === "ghost"
      ? "rounded-lg border-transparent hover:border-border/60"
      : "rounded-xl";

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className={`w-full inline-flex items-center justify-between gap-2 bg-background border border-border/60 outline-none focus:border-ring transition disabled:opacity-50 disabled:cursor-not-allowed hover:border-border ${sizeCls} ${variantCls}`}
      >
        <span className={`truncate text-left ${selected ? "" : "text-muted-foreground"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-labelledby={id}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className="absolute z-50 mt-2 w-full max-h-64 overflow-auto rounded-xl border border-border/60 bg-card shadow-[var(--shadow-soft)] py-1.5 animate-in fade-in-0 zoom-in-95"
        >
          {options.length === 0 && (
            <li className="px-3 py-2 text-xs text-muted-foreground">No options</li>
          )}
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isActive = idx === activeIndex;
            return (
              <li
                key={opt.value || `__empty_${idx}`}
                data-idx={idx}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt.value);
                  close();
                  btnRef.current?.focus();
                }}
                className={`flex items-start gap-2 px-3 py-2 text-sm cursor-pointer transition ${
                  isActive ? "bg-muted" : ""
                } ${isSelected ? "text-foreground" : "text-foreground/90"}`}
              >
                <Check
                  className={`size-4 mt-0.5 shrink-0 ${
                    isSelected ? "text-primary opacity-100" : "opacity-0"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{opt.label}</div>
                  {opt.hint && (
                    <div className="text-[11px] text-muted-foreground truncate">{opt.hint}</div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
