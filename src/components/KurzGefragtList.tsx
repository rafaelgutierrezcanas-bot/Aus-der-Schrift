"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { getLocalizedCategoryTitle, getLocalizedQuestion, formatDate } from "@/lib/utils";

interface KurzGefragtListProps {
  questions: Record<string, unknown>[];
  locale: string;
  verdictLabels: Record<string, { de: string; en: string }>;
  noQuestionsLabel: string;
}

const verdictColor: Record<string, string> = {
  ja: "bg-navy text-background",
  nein: "bg-navy text-background",
  teilweise: "bg-accent text-white",
  umstritten: "bg-accent text-white",
};

export function KurzGefragtList({ questions, locale, verdictLabels, noQuestionsLabel }: KurzGefragtListProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const q of questions) {
      const cat = q.category as Record<string, unknown> | null;
      if (!cat) continue;
      const slug = (cat.slug as { current: string })?.current;
      if (!slug || seen.has(slug)) continue;
      seen.set(slug, getLocalizedCategoryTitle(cat, locale));
    }
    return Array.from(seen.entries()).map(([slug, title]) => ({ slug, title }));
  }, [questions, locale]);

  const filtered = useMemo(() => {
    if (!activeCategory) return questions;
    return questions.filter((q) => {
      const cat = q.category as Record<string, unknown> | null;
      return (cat?.slug as { current: string })?.current === activeCategory;
    });
  }, [questions, activeCategory]);

  return (
    <div>
      {/* Filter chips */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => startTransition(() => setActiveCategory(null))}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors ${
              activeCategory === null
                ? "border-accent bg-accent text-white"
                : "border-border text-muted hover:border-accent hover:text-foreground"
            }`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Alle" : "All"}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => startTransition(() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug))}
              className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors ${
                activeCategory === cat.slug
                  ? "border-accent bg-accent text-white"
                  : "border-border text-muted hover:border-accent hover:text-foreground"
              }`}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {cat.title}
            </button>
          ))}
        </div>
      )}

      {/* Questions */}
      {filtered.length === 0 ? (
        <p className="text-muted text-center py-12" style={{ fontFamily: "var(--font-body-serif)" }}>
          {noQuestionsLabel}
        </p>
      ) : (
        <div className="space-y-0 border-t border-border">
          {filtered.map((q) => {
            const question = getLocalizedQuestion(q, locale);
            const qSlug = locale === "en" && (q.slugEn as { current: string })?.current
              ? (q.slugEn as { current: string }).current
              : (q.slug as { current: string })?.current;
            const verdict = q.verdict as string | undefined;
            const cat = q.category as Record<string, unknown> | null;
            const catTitle = getLocalizedCategoryTitle(cat, locale);
            const publishedAt = q.publishedAt as string | undefined;
            const shortAnswer = locale === "en"
              ? (q.shortAnswerEn as string | undefined) || (q.shortAnswerDe as string | undefined)
              : (q.shortAnswerDe as string | undefined);

            const badgeClass = verdict && verdictColor[verdict]
              ? verdictColor[verdict]
              : "bg-navy text-background";

            return (
              <Link
                key={q._id as string}
                href={`/${locale}/kurz-gefragt/${qSlug}`}
                className="group block border-b border-border py-6 hover:bg-surface/40 transition-colors -mx-4 px-4 rounded-sm"
              >
                <div className="flex items-start gap-3 mb-2">
                  {verdict && verdictLabels[verdict] && (
                    <span
                      className={`${badgeClass} text-[10px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-sm mt-1 shrink-0`}
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {locale === "en" ? verdictLabels[verdict].en : verdictLabels[verdict].de}
                    </span>
                  )}
                  <h2
                    className="text-lg font-semibold leading-snug group-hover:text-accent transition-colors"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {question}
                  </h2>
                </div>
                {shortAnswer && (
                  <p
                    className="text-sm text-muted leading-relaxed mb-3"
                    style={{ fontFamily: "var(--font-body-serif)" }}
                  >
                    {shortAnswer}
                  </p>
                )}
                <div className="flex items-center gap-3">
                  {catTitle && (
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {catTitle}
                    </span>
                  )}
                  {publishedAt && (
                    <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
                      {formatDate(publishedAt, locale)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
