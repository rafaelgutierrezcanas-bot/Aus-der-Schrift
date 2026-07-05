"use client";
import { useState, useRef, useEffect } from "react";

interface FootnoteTooltipProps {
  index: number;
  text: string;
  children: React.ReactNode;
}

export function FootnoteTooltip({ index, text, children }: FootnoteTooltipProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }
  function hide() {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {open && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 max-w-xs rounded-sm border border-border bg-surface shadow-lg px-3 py-2 text-xs leading-relaxed text-foreground"
          onMouseEnter={show}
          onMouseLeave={hide}
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          <span className="font-semibold text-accent mr-1" style={{ fontFamily: "var(--font-sans)" }}>[{index}]</span>
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
        </span>
      )}
    </span>
  );
}
