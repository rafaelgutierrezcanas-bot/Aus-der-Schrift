"use client";

import { useState } from "react";
import { TOPIC_OPTIONS } from "@/lib/ressourcen";

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

  const quoteAuthors = Array.from(new Set(quotes.map((q) => q.author))).sort();

  const filteredQuotes = quotes.filter((q) => {
    if (topicFilter && !q.topics?.includes(topicFilter)) return false;
    if (authorFilter && q.author !== authorFilter) return false;
    return true;
  });

  return (
    <div>
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
            </blockquote>
          ))}
        </div>
      )}
    </div>
  );
}
