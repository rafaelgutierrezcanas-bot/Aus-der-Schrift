"use client";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { urlFor } from "@/sanity/image";
import { formatDate, getLocalizedTitle, getLocalizedExcerpt, getLocalizedCategoryTitle, estimateReadingTime } from "@/lib/utils";

interface ArticleCardProps {
  article: Record<string, unknown>;
  featured?: boolean;
  horizontal?: boolean;
}

export function ArticleCard({ article, featured = false, horizontal = false }: ArticleCardProps) {
  const locale = useLocale();
  const title = getLocalizedTitle(article, locale);
  const excerpt = getLocalizedExcerpt(article, locale);
  const category = article.category as Record<string, unknown> | null;
  const categoryTitle = getLocalizedCategoryTitle(category, locale);
  const categorySlug = (category?.slug as { current: string })?.current;
  const difficulty = article.difficulty as string | undefined;
  const slug = (article.slug as { current: string })?.current;
  const publishedAt = article.publishedAt as string | undefined;
  const body = (locale === "en" && (article.bodyEn as unknown[])?.length
    ? article.bodyEn
    : article.bodyDe) as unknown[] | undefined;
  const readingTime = body ? estimateReadingTime(body) : null;
  const hasImage = !!article.featuredImage;
  const articleHref = `/${locale}/blog/${slug}`;
  const categoryHref = categorySlug ? `/${locale}/kategorien/${categorySlug}` : null;

  const difficultyConfig: Record<string, { label: string; labelEn: string; color: string }> = {
    einfach: { label: "Einfach", labelEn: "Beginner", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    mittel: { label: "Mittel", labelEn: "Intermediate", color: "text-amber-700 bg-amber-50 border-amber-200" },
    anspruchsvoll: { label: "Anspruchsvoll", labelEn: "Advanced", color: "text-rose-700 bg-rose-50 border-rose-200" },
  };

  const DifficultyBadge = () => {
    if (!difficulty || !difficultyConfig[difficulty]) return null;
    const cfg = difficultyConfig[difficulty];
    const label = locale === "en" ? cfg.labelEn : cfg.label;
    return (
      <span
        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {label}
      </span>
    );
  };

  const CategoryLabel = () =>
    categoryTitle ? (
      categoryHref ? (
        <Link
          href={categoryHref}
          className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent hover:underline"
          style={{ fontFamily: "var(--font-sans)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {categoryTitle}
        </Link>
      ) : (
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent" style={{ fontFamily: "var(--font-sans)" }}>
          {categoryTitle}
        </span>
      )
    ) : null;

  if (horizontal) {
    return (
      <article className="group flex gap-6 py-6 border-b border-border">
        {hasImage && (
          <Link href={articleHref} className="shrink-0">
            <div className="w-32 h-24 overflow-hidden rounded-sm">
              <Image
                src={urlFor(article.featuredImage as Parameters<typeof urlFor>[0]).width(300).url()}
                alt={title}
                width={300}
                height={200}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <CategoryLabel />
            <DifficultyBadge />
            {publishedAt && (
              <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
                {formatDate(publishedAt, locale)}
              </span>
            )}
            {readingTime && (
              <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
                {readingTime} min
              </span>
            )}
          </div>
          <Link href={articleHref}>
            <h3 className="font-semibold leading-snug mb-1 group-hover:text-accent transition-colors text-base" style={{ fontFamily: "var(--font-serif)" }}>
              {title}
            </h3>
          </Link>
        </div>
      </article>
    );
  }

  if (featured) {
    return (
      <article className="group">
        {hasImage && (
          <Link href={articleHref}>
            <div className="aspect-[16/7] overflow-hidden rounded-sm mb-5">
              <Image
                src={urlFor(article.featuredImage as Parameters<typeof urlFor>[0]).width(1400).url()}
                alt={title}
                width={1400}
                height={612}
                className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
          </Link>
        )}
        <div className="flex items-center gap-3 mb-3">
          <CategoryLabel />
          <DifficultyBadge />
          {publishedAt && (
            <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
              {formatDate(publishedAt, locale)}
            </span>
          )}
          {readingTime && (
            <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
              {readingTime} min
            </span>
          )}
        </div>
        <Link href={articleHref}>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-3 group-hover:text-accent transition-colors" style={{ fontFamily: "var(--font-serif)" }}>
            {title}
          </h2>
          {excerpt && (
            <p className="text-muted leading-relaxed line-clamp-2" style={{ fontFamily: "var(--font-body-serif)" }}>
              {excerpt}
            </p>
          )}
        </Link>
      </article>
    );
  }

  // Default card
  return (
    <article className="group border border-border rounded-sm bg-surface/40 hover:border-accent/40 transition-colors">
      {hasImage && (
        <Link href={articleHref}>
          <div className="aspect-[16/9] overflow-hidden rounded-t-sm">
            <Image
              src={urlFor(article.featuredImage as Parameters<typeof urlFor>[0]).width(800).url()}
              alt={title}
              width={800}
              height={450}
              className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-500"
            />
          </div>
        </Link>
      )}
      <div className="p-5">
        <div className="flex items-center flex-wrap gap-3 mb-3">
          <CategoryLabel />
          <DifficultyBadge />
          {publishedAt && (
            <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
              {formatDate(publishedAt, locale)}
            </span>
          )}
          {readingTime && (
            <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
              {readingTime} min
            </span>
          )}
        </div>
        <Link href={articleHref}>
          <h3 className="font-semibold leading-snug mb-2 group-hover:text-accent transition-colors" style={{ fontFamily: "var(--font-serif)" }}>
            {title}
          </h3>
          {excerpt && (
            <p className="text-muted text-sm leading-relaxed line-clamp-2" style={{ fontFamily: "var(--font-body-serif)" }}>
              {excerpt}
            </p>
          )}
        </Link>
      </div>
    </article>
  );
}
