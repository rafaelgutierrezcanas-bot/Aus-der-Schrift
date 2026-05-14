import { client } from "@/sanity/client";
import { articlesByCategoryQuery, allCategoriesQuery } from "@/sanity/queries";
import { ArticleCard } from "@/components/ArticleCard";
import { getLocalizedCategoryTitle } from "@/lib/utils";
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
      client.fetch(articlesByCategoryQuery, { categorySlug: slug }),
      client.fetch(allCategoriesQuery),
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
    <div className="max-w-5xl mx-auto px-6 py-16">
      <Script
        id={`schema-category-${locale}-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p
        className="text-xs uppercase tracking-widest text-accent mb-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {locale === "de" ? "Kategorie" : "Category"}
      </p>
      <h1
        className="text-3xl font-bold mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {categoryTitle}
      </h1>
      {!!categoryDescription && (
        <p
          className="text-muted text-[1.0625rem] leading-relaxed mb-12 max-w-prose"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {categoryDescription}
        </p>
      )}
      {!categoryDescription && <div className="mb-12" />}
      {articles.length === 0 && (
        <p className="text-muted" style={{ fontFamily: "var(--font-sans)" }}>
          {locale === "de" ? "Noch keine Artikel in dieser Kategorie." : "No articles in this category yet."}
        </p>
      )}
      <div className="space-y-10">
        {articles.map((article) => (
          <ArticleCard key={article._id as string} article={article} />
        ))}
      </div>
    </div>
  );
}
