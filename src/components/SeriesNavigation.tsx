import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SeriesArticle {
  _id: string;
  titleDe?: string;
  titleEn?: string;
  slug: { current: string };
  slugEn?: { current: string };
  seriesOrder?: number;
}

interface SeriesNavigationProps {
  seriesTitle: string;
  articles: SeriesArticle[];
  currentSlug: string;
  locale: string;
}

export function SeriesNavigation({
  seriesTitle,
  articles,
  currentSlug,
  locale,
}: SeriesNavigationProps) {
  if (articles.length < 2) return null;

  const currentIndex = articles.findIndex(
    (a) => a.slug.current === currentSlug || a.slugEn?.current === currentSlug
  );
  if (currentIndex === -1) return null;

  const prev = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const next =
    currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;
  const partNumber = currentIndex + 1;
  const totalParts = articles.length;

  const getTitle = (a: SeriesArticle) =>
    locale === "en" && a.titleEn ? a.titleEn : a.titleDe || "";

  const getSlug = (a: SeriesArticle) =>
    locale === "en" && a.slugEn?.current ? a.slugEn.current : a.slug.current;

  return (
    <nav
      className="max-w-prose mx-auto my-10 border border-border rounded-sm bg-surface"
      aria-label={locale === "de" ? "Reihen-Navigation" : "Series navigation"}
    >
      {/* Series header with progress */}
      <div className="px-5 py-3 border-b border-border">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {locale === "de" ? "Artikelreihe" : "Article Series"}
        </p>
        <p
          className="text-sm font-medium mt-0.5"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {seriesTitle}
        </p>
        <p
          className="text-xs text-muted mt-1"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {locale === "de"
            ? `Teil ${partNumber} von ${totalParts}`
            : `Part ${partNumber} of ${totalParts}`}
        </p>

        {/* Progress dots */}
        <div className="flex gap-1.5 mt-2.5" aria-hidden="true">
          {articles.map((a, i) => (
            <div
              key={a._id}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i === currentIndex
                  ? "bg-accent"
                  : i < currentIndex
                    ? "bg-accent/40"
                    : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Previous / Next links */}
      <div className="flex">
        {prev ? (
          <Link
            href={`/${locale}/blog/${getSlug(prev)}`}
            className="flex-1 flex items-center gap-2 px-5 py-3 text-sm hover:bg-muted/5 transition-colors group"
          >
            <ChevronLeft
              size={14}
              className="shrink-0 text-muted group-hover:text-accent transition-colors"
            />
            <div className="min-w-0">
              <span
                className="text-[10px] uppercase tracking-wider text-muted block"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {locale === "de" ? "Vorheriger Teil" : "Previous"}
              </span>
              <span
                className="text-sm text-foreground group-hover:text-accent transition-colors line-clamp-1"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {getTitle(prev)}
              </span>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {prev && next && (
          <div className="w-px bg-border" />
        )}

        {next ? (
          <Link
            href={`/${locale}/blog/${getSlug(next)}`}
            className="flex-1 flex items-center justify-end gap-2 px-5 py-3 text-sm hover:bg-muted/5 transition-colors group text-right"
          >
            <div className="min-w-0">
              <span
                className="text-[10px] uppercase tracking-wider text-muted block"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {locale === "de" ? "Nächster Teil" : "Next"}
              </span>
              <span
                className="text-sm text-foreground group-hover:text-accent transition-colors line-clamp-1"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {getTitle(next)}
              </span>
            </div>
            <ChevronRight
              size={14}
              className="shrink-0 text-muted group-hover:text-accent transition-colors"
            />
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </nav>
  );
}
