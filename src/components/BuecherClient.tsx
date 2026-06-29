"use client";

import { useState } from "react";
import { TOPIC_OPTIONS, DIFFICULTY_OPTIONS, BOOK_TYPE_OPTIONS } from "@/lib/ressourcen";

export interface BookRecommendation {
  _id: string;
  title: string;
  author: string;
  year?: number;
  description: string;
  difficulty: string;
  bookType?: string;
  topics: string[];
  buyLink?: string;
}

interface Props {
  books: BookRecommendation[];
  locale: string;
}

const difficultyColor: Record<string, string> = {
  einsteiger: "var(--color-success, #22c55e)",
  mittel: "var(--color-warning, #f59e0b)",
  fortgeschritten: "var(--color-accent)",
};

const difficultyTextColor: Record<string, string> = {
  einsteiger: "text-emerald-600 bg-emerald-50 border-emerald-200",
  mittel: "text-amber-700 bg-amber-50 border-amber-200",
  fortgeschritten: "text-rose-700 bg-rose-50 border-rose-200",
};

const difficultyLabel: Record<string, { de: string; en: string }> = {
  einsteiger: { de: "Einsteiger", en: "Beginner" },
  mittel: { de: "Mittel", en: "Intermediate" },
  fortgeschritten: { de: "Fortgeschritten", en: "Advanced" },
};

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

export function BuecherClient({ books, locale }: Props) {
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const filteredBooks = books.filter((b) => {
    if (topicFilter && !b.topics?.includes(topicFilter)) return false;
    if (difficultyFilter && b.difficulty !== difficultyFilter) return false;
    if (typeFilter && b.bookType !== typeFilter) return false;
    return true;
  });

  return (
    <div>
      {/* Book type filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterChip
          label={locale === "de" ? "Alle Typen" : "All Types"}
          active={typeFilter === null}
          onClick={() => setTypeFilter(null)}
        />
        {BOOK_TYPE_OPTIONS.map((t) => (
          <FilterChip
            key={t.value}
            label={t.title}
            active={typeFilter === t.value}
            onClick={() => setTypeFilter(typeFilter === t.value ? null : t.value)}
          />
        ))}
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
            <div
              key={book._id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p
                    className="font-semibold text-[var(--color-foreground)] leading-snug"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {book.title}
                  </p>
                  <p
                    className="text-sm text-[var(--color-muted)] mt-0.5"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {book.author}
                    {book.year ? ` · ${book.year}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {book.bookType && (
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-muted)]"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {BOOK_TYPE_OPTIONS.find((t) => t.value === book.bookType)?.title ?? book.bookType}
                    </span>
                  )}
                  {book.difficulty && difficultyTextColor[book.difficulty] && (
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${difficultyTextColor[book.difficulty]}`}
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {locale === "de"
                        ? difficultyLabel[book.difficulty].de
                        : difficultyLabel[book.difficulty].en}
                    </span>
                  )}
                </div>
              </div>
              <p
                className="text-sm text-[var(--color-muted)] leading-relaxed mb-4"
                style={{ fontFamily: "var(--font-body-serif)" }}
              >
                {book.description}
              </p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {(book.topics ?? []).map((topic) => (
                    <span
                      key={topic}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-muted)]"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
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
    </div>
  );
}

// Re-export difficultyColor in case it's needed elsewhere
export { difficultyColor };
