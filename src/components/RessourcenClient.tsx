"use client";

import { useState } from "react";
import { TOPIC_OPTIONS, DIFFICULTY_OPTIONS } from "@/lib/ressourcen";

interface Book {
  _id: string;
  title: string;
  author: string;
  year?: number;
  description: string;
  difficulty: string;
  topics: string[];
  buyLink?: string;
}

interface Quote {
  _id: string;
  text: string;
  author: string;
  topics: string[];
  source?: { title: string; author: string; year?: number };
}

interface Props {
  books: Book[];
  quotes: Quote[];
  locale: string;
}

const difficultyColor: Record<string, string> = {
  einsteiger: "text-emerald-600 bg-emerald-50 border-emerald-200",
  mittel: "text-amber-700 bg-amber-50 border-amber-200",
  fortgeschritten: "text-rose-700 bg-rose-50 border-rose-200",
};

const difficultyLabel: Record<string, { de: string; en: string }> = {
  einsteiger: { de: "Einsteiger", en: "Beginner" },
  mittel: { de: "Mittel", en: "Intermediate" },
  fortgeschritten: { de: "Fortgeschritten", en: "Advanced" },
};

export function RessourcenClient({ books, quotes, locale }: Props) {
  const [tab, setTab] = useState<"buecher" | "zitate">("buecher");
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);

  const filteredBooks = books.filter((b) => {
    if (topicFilter && !b.topics?.includes(topicFilter)) return false;
    if (difficultyFilter && b.difficulty !== difficultyFilter) return false;
    return true;
  });

  const filteredQuotes = quotes.filter((q) => {
    if (topicFilter && !q.topics?.includes(topicFilter)) return false;
    if (authorFilter && q.author !== authorFilter) return false;
    return true;
  });

  const quoteAuthors = Array.from(new Set(quotes.map((q) => q.author))).sort();

  function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-[var(--color-border)]">
        {(["buecher", "zitate"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setTopicFilter(null); setDifficultyFilter(null); setAuthorFilter(null); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            }`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t === "buecher"
              ? (locale === "de" ? "Bücher" : "Books")
              : (locale === "de" ? "Zitate" : "Quotes")}
          </button>
        ))}
      </div>

      {/* Topic filters (shared between tabs) */}
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

      {tab === "buecher" && (
        <>
          {/* Difficulty filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <FilterChip
              label={locale === "de" ? "Alle Level" : "All Levels"}
              active={difficultyFilter === null}
              onClick={() => setDifficultyFilter(null)}
            />
            {DIFFICULTY_OPTIONS.map((d) => (
              <FilterChip
                key={d.value}
                label={locale === "de" ? difficultyLabel[d.value].de : difficultyLabel[d.value].en}
                active={difficultyFilter === d.value}
                onClick={() => setDifficultyFilter(difficultyFilter === d.value ? null : d.value)}
              />
            ))}
          </div>

          {filteredBooks.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
              {locale === "de" ? "Keine Bücher gefunden." : "No books found."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredBooks.map((book) => (
                <div key={book._id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-[var(--color-foreground)] leading-snug" style={{ fontFamily: "var(--font-serif)" }}>
                        {book.title}
                      </p>
                      <p className="text-sm text-[var(--color-muted)] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                        {book.author}{book.year ? ` · ${book.year}` : ""}
                      </p>
                    </div>
                    {book.difficulty && difficultyColor[book.difficulty] && (
                      <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${difficultyColor[book.difficulty]}`} style={{ fontFamily: "var(--font-sans)" }}>
                        {locale === "de" ? difficultyLabel[book.difficulty].de : difficultyLabel[book.difficulty].en}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4" style={{ fontFamily: "var(--font-body-serif)" }}>
                    {book.description}
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(book.topics ?? []).map((topic) => (
                        <span key={topic} className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
                          {TOPIC_OPTIONS.find((t) => t.value === topic)?.title ?? topic}
                        </span>
                      ))}
                    </div>
                    {book.buyLink && (
                      <a
                        href={book.buyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {locale === "de" ? "Kaufen →" : "Buy →"}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "zitate" && (
        <>
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
                <blockquote key={quote._id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5">
                  <p className="text-base leading-relaxed text-[var(--color-foreground)] italic mb-3" style={{ fontFamily: "var(--font-body-serif)" }}>
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <footer className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
                    — {quote.author}
                    {quote.source && (
                      <span className="text-[var(--color-muted)]/70">
                        , <em>{quote.source.title}</em>
                        {quote.source.year ? ` (${quote.source.year})` : ""}
                      </span>
                    )}
                  </footer>
                </blockquote>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
