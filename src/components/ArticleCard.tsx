"use client";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { urlFor } from "@/sanity/image";
import { formatDate, getLocalizedTitle, getLocalizedExcerpt, getLocalizedCategoryTitle } from "@/lib/utils";

interface ArticleCardProps {
  article: Record<string, unknown>;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const locale = useLocale();
  const title = getLocalizedTitle(article, locale);
  const excerpt = getLocalizedExcerpt(article, locale);
  const category = article.category as Record<string, unknown> | null;
  const categoryTitle = getLocalizedCategoryTitle(category, locale);
  const slug = (article.slug as { current: string })?.current;
  const publishedAt = article.publishedAt as string | undefined;

  return (
    <article className={`group ${featured ? "" : "border-b border-border pb-10"}`}>
      <Link href={`/${locale}/blog/${slug}`}>
        {article.featuredImage ? (
          <div className={`mb-4 overflow-hidden rounded-sm ${featured ? "aspect-[21/9]" : "aspect-[16/9]"}`}>
            <Image
              src={urlFor(article.featuredImage as Parameters<typeof urlFor>[0]).width(featured ? 1400 : 800).url()}
              alt={title}
              width={featured ? 1400 : 800}
              height={featured ? 600 : 450}
              className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        ) : null}
        <div className="flex items-center gap-3 mb-3">
          {categoryTitle && (
            <span
              className="text-xs font-medium text-accent uppercase tracking-wider"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {categoryTitle}
            </span>
          )}
          {publishedAt && (
            <span
              className="text-xs text-muted"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {formatDate(publishedAt, locale)}
            </span>
          )}
        </div>
        <h2
          className={`font-semibold leading-snug mb-2 group-hover:text-accent transition-colors ${featured ? "text-3xl" : "text-xl"}`}
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {title}
        </h2>
        {excerpt && (
          <p
            className="text-muted text-sm leading-relaxed line-clamp-3"
            style={{ fontFamily: "var(--font-body-serif)" }}
          >
            {excerpt}
          </p>
        )}
      </Link>
    </article>
  );
}
