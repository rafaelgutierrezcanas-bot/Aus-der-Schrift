"use client";
import { useState, useRef, useEffect } from "react";

export function InfoCardPopover({
  children,
  explanation,
}: {
  children: React.ReactNode;
  explanation: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <span ref={ref} className="relative inline">
      <span
        onClick={() => setOpen((v) => !v)}
        style={{
          textDecoration: "underline dotted var(--color-accent)",
          textUnderlineOffset: "3px",
          cursor: "help",
        }}
      >
        {children}
      </span>
      {open && (
        <span
          className="absolute bottom-full left-0 mb-2 z-50 block w-64 rounded-lg border border-border bg-[var(--color-surface)] px-3 py-2.5 text-sm shadow-lg leading-relaxed"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-accent mb-1.5" style={{ fontFamily: "var(--font-sans)" }}>
            Erklärung
          </span>
          {explanation}
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            className="absolute top-1.5 right-2 text-xs text-muted hover:text-foreground transition-colors leading-none"
          >
            ×
          </button>
        </span>
      )}
    </span>
  );
}
