import { client } from "@/sanity/client";
import { allArticlesQuery } from "@/sanity/queries";
import { ArticleCard } from "@/components/ArticleCard";
import { getTranslations } from "next-intl/server";

export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("homepage");

  let articles: Record<string, unknown>[] = [];
  try {
    articles = await client.fetch(allArticlesQuery);
  } catch {
    // Sanity not configured or no articles yet — show empty state
  }

  const [featured, ...rest] = articles;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="mb-16 text-center border-b border-border pb-16">
        <p
          className="text-xs uppercase tracking-widest text-accent mb-3"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {t("tagline")}
        </p>
        <h1
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Aus der Schrift
        </h1>
        <p
          className="text-muted max-w-prose mx-auto"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {t("subtitle")}
        </p>
      </div>

      {articles.length === 0 && (
        <p className="text-center text-muted" style={{ fontFamily: "var(--font-sans)" }}>
          {locale === "de" ? "Noch keine Artikel veröffentlicht." : "No articles published yet."}
        </p>
      )}

      {/* Featured Post */}
      {featured && (
        <div className="mb-16 pb-16 border-b border-border">
          <ArticleCard article={featured} featured />
        </div>
      )}

      {/* Post Grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {rest.map((article) => (
            <ArticleCard key={article._id as string} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
