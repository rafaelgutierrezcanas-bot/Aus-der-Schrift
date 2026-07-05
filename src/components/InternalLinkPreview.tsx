"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { getLocalizedTitle, getLocalizedExcerpt } from "@/lib/utils";

interface InternalLinkPreviewProps {
  slug: string;
  children: React.ReactNode;
}

interface PreviewData {
  titleDe?: string;
  titleEn?: string;
  excerptDe?: string;
  excerptEn?: string;
}

export function InternalLinkPreview({ slug, children }: InternalLinkPreviewProps) {
  const locale = useLocale();
  const [data, setData] = useState<PreviewData | null>(null);
  const [open, setOpen] = useState(false);
  const fetchedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      try {
        const res = await fetch(`/api/preview/${slug}`);
        if (res.ok) setData(await res.json());
      } catch {
        // silent fail
      }
    }
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  }

  const title = data ? getLocalizedTitle(data as Record<string, unknown>, locale) : null;
  const excerpt = data ? getLocalizedExcerpt(data as Record<string, unknown>, locale) : null;

  return (
    <span className="relative inline" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link
        href={`/${locale}/blog/${slug}`}
        className="text-accent underline underline-offset-2 hover:opacity-75 transition-opacity"
      >
        {children}
      </Link>
      {open && (
        <span
          className="absolute z-50 bottom-full left-0 mb-2 w-72 max-w-xs rounded-sm border border-border bg-surface shadow-lg px-4 py-3"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          {title ? (
            <>
              <span className="block font-semibold text-sm leading-snug mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                {title}
              </span>
              {excerpt && (
                <span className="block text-xs text-muted leading-relaxed line-clamp-3" style={{ fontFamily: "var(--font-body-serif)" }}>
                  {excerpt}
                </span>
              )}
            </>
          ) : (
            <span className="block text-xs text-muted" style={{ fontFamily: "var(--font-sans)" }}>…</span>
          )}
        </span>
      )}
    </span>
  );
}
