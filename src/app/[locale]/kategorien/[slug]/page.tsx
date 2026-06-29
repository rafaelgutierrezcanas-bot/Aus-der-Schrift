import { client } from "@/sanity/client";
import { articlesByCategoryQuery, allCategoriesQuery } from "@/sanity/queries";
import { getLocalizedCategoryTitle, getLocalizedTitle, getLocalizedExcerpt, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { absoluteUrl, getLocaleAlternates, localePath } from "@/lib/site";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const cats = await client.fetch(allCategoriesQuery);
    const locales = ["de", "en"];
    return locales.flatMap((locale) =>
      (cats as Array<{ slug: { current: string } }>).map((c) => ({
        locale,
        slug: c.slug.current,
      }))
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const categories = await client.fetch(allCategoriesQuery);
    const category = (categories as Array<Record<string, unknown>>).find(
      (item) => ((item.slug as { current: string })?.current === slug)
    );

    if (!category) {
      return {
        title: locale === "de" ? "Kategorie nicht gefunden" : "Category not found",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = getLocalizedCategoryTitle(category, locale);
    const description =
      locale === "en" && category.descriptionEn
        ? (category.descriptionEn as string)
        : ((category.descriptionDe || category.descriptionEn) as string | undefined) ||
          (locale === "de"
            ? `Artikel in der Kategorie ${title} auf Theologik.`
            : `Articles in the ${title} category on Theologik.`);
    const path = localePath(locale, `/kategorien/${slug}`);

    return {
      title,
      description,
      alternates: {
        canonical: path,
        ...getLocaleAlternates(`/kategorien/${slug}`),
      },
      openGraph: {
        type: "website",
        title,
        description,
        url: absoluteUrl(path),
        locale: locale === "de" ? "de_DE" : "en_US",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  } catch {
    return {};
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  let articles: Record<string, unknown>[] = [];
  let categories: Record<string, unknown>[] = [];
  try {
    [articles, categories] = await Promise.all([
      client.fetch(articlesByCategoryQuery, { categorySlug: slug }, { next: { tags: ["articles"], revalidate: 60 } }),
      client.fetch(allCategoriesQuery, {}, { next: { tags: ["categories"], revalidate: 3600 } }),
    ]);
  } catch {
    notFound();
  }

  const category = categories.find(
    (c) => (c.slug as { current: string }).current === slug
  );
  if (!category) notFound();
  const categoryTitle = getLocalizedCategoryTitle(category, locale);
  const categoryDescription = (locale === "en" && category.descriptionEn
    ? category.descriptionEn
    : category.descriptionDe) as string | undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryTitle,
    url: absoluteUrl(`/${locale}/kategorien/${slug}`),
    inLanguage: locale === "de" ? "de-DE" : "en-US",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Script
        id={`schema-category-${locale}-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="mb-10">
        <div className="w-8 h-0.5 bg-accent mb-4" />
        <p className="text-xs uppercase tracking-[0.15em] text-accent mb-2" style={{ fontFamily: "var(--font-sans)" }}>
          {locale === "de" ? "Kategorie" : "Category"}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
          {categoryTitle}
        </h1>
        {!!categoryDescription && (
          <p className="text-muted text-lg leading-relaxed mt-4 max-w-prose" style={{ fontFamily: "var(--font-body-serif)" }}>
            {categoryDescription}
          </p>
        )}
      </div>

      <div className="h-px bg-border mb-0" />

      {articles.length === 0 && (
        <p className="text-muted py-16 text-center" style={{ fontFamily: "var(--font-sans)" }}>
          {locale === "de" ? "Noch keine Artikel in dieser Kategorie." : "No articles in this category yet."}
        </p>
      )}

      {/* Broadsheet article list */}
      <div>
        {articles.map((article, i) => {
          const title = getLocalizedTitle(article, locale);
          const excerpt = getLocalizedExcerpt(article, locale);
          const slug2 = (article.slug as { current: string })?.current;
          const publishedAt = article.publishedAt as string | undefined;
          const isFirst = i === 0;

          return (
            <article
              key={article._id as string}
              className="group grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-4 md:gap-8 py-7 border-b border-border"
            >
              {/* Metadata column */}
              <div className="flex flex-col gap-1 pt-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent" style={{ fontFamily: "var(--font-sans)" }}>
                  {categoryTitle}
                </span>
                {publishedAt && (
                  <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
                    {formatDate(publishedAt, locale)}
                  </span>
                )}
              </div>

              {/* Content column */}
              <div>
                <Link href={`/${locale}/blog/${slug2}`}>
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
