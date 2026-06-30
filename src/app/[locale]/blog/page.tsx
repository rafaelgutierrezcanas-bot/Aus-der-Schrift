import { client } from "@/sanity/client";
import { allArticlesQuery, allCategoriesQuery } from "@/sanity/queries";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getLocalizedCategoryTitle, getLocalizedTitle, getLocalizedExcerpt, formatDate } from "@/lib/utils";
import Script from "next/script";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { buildLocalizedMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildLocalizedMetadata({
    locale,
    pathname: "/blog",
    deTitle: "Blog zu Theologie, Bibelauslegung und Kirchengeschichte",
    enTitle: "Blog on Theology, Biblical Interpretation, and Church History",
    deDescription:
      "Alle Artikel auf Theologik: fundierte Beiträge zu Theologie, Bibelauslegung, Kirchengeschichte, Apologetik und geistlichem Leben.",
    enDescription:
      "All articles on Theologik: well-researched posts on theology, biblical interpretation, church history, apologetics, and spiritual life.",
    keywords: [
      "Theologik Blog",
      "Theologie Blog",
      "Bibelauslegung Blog",
      "Kirchengeschichte Blog",
    ],
  });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("blog");

  let articles: Record<string, unknown>[] = [];
  let categories: Record<string, unknown>[] = [];
  try {
    [articles, categories] = await Promise.all([
      client.fetch(allArticlesQuery, {}, { next: { tags: ["articles"], revalidate: 60 } }),
      client.fetch(allCategoriesQuery, {}, { next: { tags: ["categories"], revalidate: 3600 } }),
    ]);
  } catch {
    // empty state
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Theologik",
    url: absoluteUrl(`/${locale}/blog`),
    inLanguage: locale === "de" ? "de-DE" : "en-US",
    blogPost: articles.slice(0, 20).map((article) => ({
      "@type": "BlogPosting",
      headline:
        ((locale === "en" && article.titleEn ? article.titleEn : article.titleDe) ||
          article.titleEn ||
          article.titleDe) as string,
      url: absoluteUrl(`/${locale}/blog/${(article.slug as { current: string }).current}`),
      datePublished: article.publishedAt,
    })),
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Script
        id={`schema-blog-index-${locale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="mb-10">
        <div className="w-8 h-0.5 bg-accent mb-4" />
        <h1
          className="text-4xl md:text-5xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t("allPosts")}
        </h1>
      </div>

      {/* Category Filter — dot separated */}
      <nav className="flex flex-wrap items-center gap-x-0 gap-y-2 mb-12 pb-5 border-b border-border" style={{ fontFamily: "var(--font-sans)" }}>
        <Link
          href={`/${locale}/blog`}
          className="text-xs font-semibold uppercase tracking-[0.12em] text-accent border-b border-accent pb-px"
        >
          {locale === "de" ? "Alle" : "All"}
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat._id as string}
            href={`/${locale}/kategorien/${(cat.slug as { current: string }).current}`}
            className="text-xs uppercase tracking-[0.12em] text-muted hover:text-accent transition-colors whitespace-nowrap"
          >
            <span className="text-border select-none mx-3" aria-hidden>·</span>
            {getLocalizedCategoryTitle(cat, locale)}
          </Link>
        ))}
      </nav>

      {articles.length === 0 && (
        <p className="text-muted text-center py-16" style={{ fontFamily: "var(--font-sans)" }}>
          {locale === "de" ? "Noch keine Artikel." : "No articles yet."}
        </p>
      )}

      {/* Article list — broadsheet rows */}
      <div>
        {articles.map((article, i) => {
          const title = getLocalizedTitle(article, locale);
          const excerpt = getLocalizedExcerpt(article, locale);
          const category = article.category as Record<string, unknown> | null;
          const categoryTitle = getLocalizedCategoryTitle(category, locale);
          const categorySlug = (category?.slug as { current: string })?.current;
          const slug = (article.slug as { current: string })?.current;
          const publishedAt = article.publishedAt as string | undefined;
          const articleHref = `/${locale}/blog/${slug}`;
          const isFirst = i === 0;

          return (
            <article
              key={article._id as string}
              className="group py-6 border-b border-border md:grid md:grid-cols-[180px_1fr] md:gap-8 md:py-7"
            >
              {/* Metadata: inline row on mobile, column on desktop */}
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

              {/* Content */}
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
