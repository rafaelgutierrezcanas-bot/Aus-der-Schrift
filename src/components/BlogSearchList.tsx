"use client";
import { useState } from "react";
import Link from "next/link";
import { getLocalizedTitle, getLocalizedExcerpt, getLocalizedCategoryTitle, formatDate } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface BlogSearchListProps {
  articles: Record<string, unknown>[];
  locale: string;
  labels: {
    searchPlaceholder: string;
    noResults: string;
    noArticles: string;
  };
}

export function BlogSearchList({ articles, locale, labels }: BlogSearchListProps) {
  const [query, setQuery] = useState("");
  const [refFilter, setRefFilter] = useState<string | null>(null);

  const allBibleRefs = Array.from(
    new Set(
      articles.flatMap((a) => (a.bibleReferences as string[] | undefined) ?? [])
    )
  ).sort();

  const filtered = articles.filter((article) => {
    if (refFilter) {
      const refs = (article.bibleReferences as string[] | undefined) ?? [];
      if (!refs.includes(refFilter)) return false;
    }

    if (query.trim().length >= 2) {
      const q = query.toLowerCase();
      const title = getLocalizedTitle(article, locale).toLowerCase();
      const excerpt = getLocalizedExcerpt(article, locale).toLowerCase();
      const category = getLocalizedCategoryTitle(
        article.category as Record<string, unknown> | null,
        locale
      ).toLowerCase();
      const refs = ((article.bibleReferences as string[] | undefined) ?? [])
        .join(" ")
        .toLowerCase();
      if (
        !title.includes(q) &&
        !excerpt.includes(q) &&
        !category.includes(q) &&
        !refs.includes(q)
      ) {
        return false;
      }
    }

    return true;
  });

  if (articles.length === 0) {
    return (
      <p className="text-muted text-center py-16" style={{ fontFamily: "var(--font-sans)" }}>
        {labels.noArticles}
      </p>
    );
  }

  return (
    <div>
      {/* Bible reference filter chips */}
      {allBibleRefs.length > 0 && (
        <div className="mb-6">
          <p
            className="text-[10px] uppercase tracking-widest text-muted mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Bibelstelle" : "Scripture"}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRefFilter(null)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                refFilter === null
                  ? "border-accent bg-accent text-white"
                  : "border-border text-muted hover:border-accent hover:text-foreground"
              }`}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {locale === "de" ? "Alle" : "All"}
            </button>
            {allBibleRefs.map((ref) => (
              <button
                key={ref}
                onClick={() => setRefFilter(refFilter === ref ? null : ref)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  refFilter === ref
                    ? "border-accent bg-accent text-white"
                    : "border-border text-muted hover:border-accent hover:text-foreground"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {ref}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search input */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="w-full pl-10 pr-9 py-2.5 bg-transparent border border-border rounded-sm text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="text-muted text-center py-10 text-sm" style={{ fontFamily: "var(--font-sans)" }}>
          {labels.noResults} „{query || refFilter}"
        </p>
      )}

      {/* Article list — broadsheet rows */}
      <div>
        {filtered.map((article, i) => {
          const title = getLocalizedTitle(article, locale);
          const excerpt = getLocalizedExcerpt(article, locale);
          const category = article.category as Record<string, unknown> | null;
          const categoryTitle = getLocalizedCategoryTitle(category, locale);
          const categorySlug = (category?.slug as { current: string })?.current;
          const slug = (article.slug as { current: string })?.current;
          const publishedAt = article.publishedAt as string | undefined;
          const articleHref = `/${locale}/blog/${slug}`;
          const isFirst = i === 0 && !query && !refFilter;

          return (
            <article
              key={article._id as string}
              className="group py-6 border-b border-border md:grid md:grid-cols-[180px_1fr] md:gap-8 md:py-7"
            >
              <div className="flex items-center gap-2 mb-2 md:flex-col md:items-start md:gap-1 md:pt-0.5 md:mb-0">
                {categoryTitle && (
                  categorySlug ? (
                    <Link
                      href={`/${locale}/kategorien/${categorySlug}`}
                      className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent hover:underline"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {categoryTitle}
                    </Link>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent" style={{ fontFamily: "var(--font-sans)" }}>
                      {categoryTitle}
                    </span>
                  )
                )}
                {publishedAt && (
                  <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
                    <span className="md:hidden">· </span>{formatDate(publishedAt, locale)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <Link href={articleHref}>
                  <h2
                    className={`font-bold leading-snug mb-2 group-hover:text-accent transition-colors ${isFirst ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}`}
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {title}
                  </h2>
                  {excerpt && (
                    <p
                      className={`text-muted leading-relaxed line-clamp-2 ${isFirst ? "text-base" : "text-sm"}`}
                      style={{ fontFamily: "var(--font-body-serif)" }}
                    >
                      {excerpt}
                    </p>
                  )}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
