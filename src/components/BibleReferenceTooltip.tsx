"use client";
import { useState, useRef, useEffect } from "react";

interface BibleReferenceTooltipProps {
  rawText: string;
  verseText: string | null;
  translation: string;
  fallbackUrl: string;
}

export function BibleReferenceTooltip({
  rawText,
  verseText,
  translation,
  fallbackUrl,
}: BibleReferenceTooltipProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }
  function hide() {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }
  function toggle() {
    setOpen((prev) => !prev);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span
      className="relative inline"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <span
        className="border-b border-dotted border-accent/50 cursor-help text-inherit"
        onClick={toggle}
        role="button"
        tabIndex={0}
        aria-label={rawText}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggle();
        }}
      >
        {rawText}
      </span>
      {open && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 max-w-xs rounded-sm border border-border bg-surface shadow-lg px-3 py-2.5 text-xs leading-relaxed text-foreground"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {/* Verse header */}
          <span
            className="block font-semibold text-accent mb-1"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {rawText}
          </span>
          {verseText ? (
            <>
              <span
                className="block italic text-[0.8125rem] leading-relaxed"
                style={{ fontFamily: "var(--font-body-serif)" }}
              >
                {verseText}
              </span>
              <span
                className="block mt-1.5 text-[10px] text-muted"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                — {translation}
              </span>
            </>
          ) : (
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-accent hover:underline mt-1"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Auf BibleServer lesen →
            </a>
          )}
          {/* Arrow pointing down */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
        </span>
      )}
    </span>
  );
}
