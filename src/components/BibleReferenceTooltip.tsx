"use client";
import { useState, useRef, useEffect, useCallback } from "react";

interface BibleReferenceTooltipProps {
  rawText: string;
  verseText: string | null;
  translation: string;
  fallbackUrl: string;
  /** Query params for on-demand fetch when verseText is null */
  fetchParams?: { book: string; chapter: number; verseStart?: number; verseEnd?: number };
}

export function BibleReferenceTooltip({
  rawText,
  verseText: initialVerseText,
  translation: initialTranslation,
  fallbackUrl,
  fetchParams,
}: BibleReferenceTooltipProps) {
  const [open, setOpen] = useState(false);
  const [verseText, setVerseText] = useState(initialVerseText);
  const [translation, setTranslation] = useState(initialTranslation);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(!!initialVerseText);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  // On-demand fetch when tooltip opens and we don't have text yet
  const fetchVerse = useCallback(async () => {
    if (fetched || !fetchParams) return;
    setLoading(true);
    setFetched(true);
    try {
      const params = new URLSearchParams({
        book: fetchParams.book,
        chapter: String(fetchParams.chapter),
      });
      if (fetchParams.verseStart) params.set("verseStart", String(fetchParams.verseStart));
      if (fetchParams.verseEnd) params.set("verseEnd", String(fetchParams.verseEnd));
      const res = await fetch(`/api/bible?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setVerseText(data.text);
          if (data.translation) setTranslation(data.translation);
        }
      }
    } catch {
      // silently fail, fallback link will show
    }
    setLoading(false);
  }, [fetched, fetchParams]);

  function show() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
    if (!fetched && !verseText) fetchVerse();
  }
  function hide() {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }
  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      if (next && !fetched && !verseText) fetchVerse();
      return next;
    });
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Viewport-aware positioning
  useEffect(() => {
    if (!open || !tooltipRef.current || !wrapperRef.current) return;

    const tooltip = tooltipRef.current;
    const wrapper = wrapperRef.current;
    const wrapperRect = wrapper.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    // Reset transforms
    tooltip.style.left = "50%";
    tooltip.style.transform = "translateX(-50%)";
    tooltip.style.bottom = "";
    tooltip.style.top = "";

    // Check if tooltip overflows left
    const tooltipLeft = wrapperRect.left + wrapperRect.width / 2 - tooltipRect.width / 2;
    const tooltipRight = tooltipLeft + tooltipRect.width;

    if (tooltipLeft < 8) {
      // Shift right so tooltip starts at 8px from left edge
      const shift = 8 - tooltipLeft;
      tooltip.style.transform = `translateX(calc(-50% + ${shift}px))`;
    } else if (tooltipRight > window.innerWidth - 8) {
      // Shift left so tooltip ends 8px from right edge
      const shift = tooltipRight - (window.innerWidth - 8);
      tooltip.style.transform = `translateX(calc(-50% - ${shift}px))`;
    }

    // Check if tooltip overflows top — if so, show below instead
    if (wrapperRect.top - tooltipRect.height - 8 < 0) {
      tooltip.style.bottom = "auto";
      tooltip.style.top = "100%";
      tooltip.style.marginTop = "8px";
      tooltip.style.marginBottom = "0";
    }
  }, [open, loading, verseText]);

  // Close on outside tap (mobile)
  useEffect(() => {
    if (!open) return;
    function handleTouchOutside(e: TouchEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("touchstart", handleTouchOutside);
    return () => document.removeEventListener("touchstart", handleTouchOutside);
  }, [open]);

  return (
    <span
      ref={wrapperRef}
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
          ref={tooltipRef}
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 max-w-[calc(100vw-16px)] rounded-sm border border-border bg-surface shadow-lg px-3 py-2.5 text-xs leading-relaxed text-foreground"
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
          {loading ? (
            <span
              className="block text-muted text-[11px]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Wird geladen...
            </span>
          ) : verseText ? (
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
