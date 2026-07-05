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

  const filtered = query.trim().length < 2
    ? articles
    : articles.filter((article) => {
        const q = query.toLowerCase();
        const title = getLocalizedTitle(article, locale).toLowerCase();
        const excerpt = getLocalizedExcerpt(article, locale).toLowerCase();
        const category = getLocalizedCategoryTitle(
          article.category as Record<string, unknown> | null,
          locale
        ).toLowerCase();
        return title.includes(q) || excerpt.includes(q) || category.includes(q);
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
      {/* Search input */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="w-full pl-10 pr-9 py-2.5 bg-transparent border border-border rounded-sm text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        />
        {query && (
          <button
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
          {labels.noResults} „{query}"
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
          const isFirst = i === 0 && !query;

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
