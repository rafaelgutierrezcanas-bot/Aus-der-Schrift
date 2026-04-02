import { client } from "@/sanity/client";
import { articlesByCategoryQuery, allCategoriesQuery } from "@/sanity/queries";
import { ArticleCard } from "@/components/ArticleCard";
import { getLocalizedCategoryTitle } from "@/lib/utils";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const cats = await client.fetch(allCategoriesQuery);
    return (cats as Array<{ slug: { current: string } }>).map((c) => ({
      slug: c.slug.current,
    }));
  } catch {
    return [];
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

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <p
        className="text-xs uppercase tracking-widest text-accent mb-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {locale === "de" ? "Kategorie" : "Category"}
      </p>
      <h1
        className="text-3xl font-bold mb-12"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {getLocalizedCategoryTitle(category, locale)}
      </h1>
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
