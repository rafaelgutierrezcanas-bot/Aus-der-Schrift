import { client } from "@/sanity/client";
import { allArticlesQuery, allCategoriesQuery } from "@/sanity/queries";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getLocalizedCategoryTitle } from "@/lib/utils";
import { BlogSearchList } from "@/components/BlogSearchList";
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

      <BlogSearchList
        articles={articles}
        locale={locale}
        labels={{
          searchPlaceholder: locale === "de" ? "Artikel suchen…" : "Search articles…",
          noResults: locale === "de" ? "Keine Artikel gefunden für" : "No articles found for",
          noArticles: locale === "de" ? "Noch keine Artikel." : "No articles yet.",
        }}
      />
    </div>
  );
}
