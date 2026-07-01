"use client";

import { useState } from "react";
import { TOPIC_OPTIONS } from "@/lib/ressourcen";

function CopyButton({ quote, locale }: { quote: Quote; locale: string }) {
  const [state, setState] = useState<"idle" | "copied">("idle");

  const handleCopy = async () => {
    const source = quote.source
      ? `, ${quote.source.title}${quote.source.year ? ` (${quote.source.year})` : ""}`
      : quote.customSource
      ? `, ${quote.customSource}`
      : "";
    const text = `„${quote.text}" — ${quote.author}${source}`;
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      // silently ignore
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={locale === "de" ? "Zitat kopieren" : "Copy quote"}
      className="text-[10px] uppercase tracking-widest transition-colors"
      style={{
        color: state === "copied" ? "var(--color-accent)" : "var(--color-muted)",
        fontFamily: "var(--font-sans)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {state === "copied"
        ? (locale === "de" ? "Kopiert ✓" : "Copied ✓")
        : (locale === "de" ? "Kopieren" : "Copy")}
    </button>
  );
}

export interface Quote {
  _id: string;
  text: string;
  author: string;
  topics: string[];
  customSource?: string;
  source?: { title: string; author: string; year?: number };
}

interface Props {
  quotes: Quote[];
  locale: string;
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
          : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)]"
      }`}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {label}
    </button>
  );
}

export function ZitateClient({ quotes, locale }: Props) {
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const quoteAuthors = Array.from(new Set(quotes.map((q) => q.author))).sort();

  const filteredQuotes = quotes.filter((q) => {
    if (topicFilter && !q.topics?.includes(topicFilter)) return false;
    if (authorFilter && q.author !== authorFilter) return false;
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      if (!q.text.toLowerCase().includes(s) && !q.author.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={locale === "de" ? "Zitate durchsuchen…" : "Search quotes…"}
          className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
          style={{ fontFamily: "var(--font-sans)" }}
        />
      </div>

      {/* Topic filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterChip
          label={locale === "de" ? "Alle Themen" : "All Topics"}
          active={topicFilter === null}
          onClick={() => setTopicFilter(null)}
        />
        {TOPIC_OPTIONS.map((t) => (
          <FilterChip
            key={t.value}
            label={t.title}
            active={topicFilter === t.value}
            onClick={() => setTopicFilter(topicFilter === t.value ? null : t.value)}
          />
        ))}
      </div>

      {/* Author filter */}
      {quoteAuthors.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <FilterChip
            label={locale === "de" ? "Alle Autoren" : "All Authors"}
            active={authorFilter === null}
            onClick={() => setAuthorFilter(null)}
          />
          {quoteAuthors.map((a) => (
            <FilterChip
              key={a}
              label={a}
              active={authorFilter === a}
              onClick={() => setAuthorFilter(authorFilter === a ? null : a)}
            />
          ))}
        </div>
      )}

      {filteredQuotes.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
          {locale === "de" ? "Keine Zitate gefunden." : "No quotes found."}
        </p>
      ) : (
        <div className="space-y-6">
          {filteredQuotes.map((quote) => (
            <blockquote
              key={quote._id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5"
            >
              <p
                className="text-base leading-relaxed text-[var(--color-foreground)] italic mb-3"
                style={{ fontFamily: "var(--font-body-serif)" }}
              >
                &ldquo;{quote.text}&rdquo;
              </p>
              <div className="flex items-end justify-between gap-4">
                <footer
                  className="text-sm text-[var(--color-muted)]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  — {quote.author}
                  {quote.source ? (
                    <span className="text-[var(--color-muted)]/70">
                      , <em>{quote.source.title}</em>
                      {quote.source.year ? ` (${quote.source.year})` : ""}
                    </span>
                  ) : quote.customSource ? (
                    <span className="text-[var(--color-muted)]/70">
                      , <em>{quote.customSource}</em>
                    </span>
                  ) : null}
                </footer>
                <CopyButton quote={quote} locale={locale} />
              </div>
            </blockquote>
          ))}
        </div>
      )}
    </div>
  );
}
