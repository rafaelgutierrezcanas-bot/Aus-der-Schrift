import { client } from "@/sanity/client";
import { allArticlesQuery, allCategoriesQuery } from "@/sanity/queries";
import { ArticleCard } from "@/components/ArticleCard";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getLocalizedCategoryTitle } from "@/lib/utils";

export const revalidate = 60;

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
      client.fetch(allArticlesQuery),
      client.fetch(allCategoriesQuery),
    ]);
  } catch {
    // empty state
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {t("allPosts")}
      </h1>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-12">
        <Link
          href={`/${locale}/blog`}
          className="text-sm px-4 py-1.5 border border-accent text-accent rounded-full hover:bg-accent hover:text-white transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {t("allPosts")}
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat._id as string}
            href={`/${locale}/kategorien/${(cat.slug as { current: string }).current}`}
            className="text-sm px-4 py-1.5 border border-border text-muted rounded-full hover:border-accent hover:text-accent transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {getLocalizedCategoryTitle(cat, locale)}
          </Link>
        ))}
      </div>

      {articles.length === 0 && (
        <p className="text-muted text-center" style={{ fontFamily: "var(--font-sans)" }}>
          {locale === "de" ? "Noch keine Artikel." : "No articles yet."}
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
