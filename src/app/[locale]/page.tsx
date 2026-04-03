import { client } from "@/sanity/client";
import { allArticlesQuery } from "@/sanity/queries";
import { ArticleCard } from "@/components/ArticleCard";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

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
    // empty state
  }

  const [featured, ...rest] = articles;
  const latest = rest.slice(0, 5);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">

        {/* Left: text */}
        <div>
          <p
            className="text-xs uppercase tracking-[0.2em] text-accent mb-4"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("tagline")}
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold leading-tight mb-6"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Theologie<br />aus der Schrift.
          </h1>
          <p
            className="text-muted text-lg leading-relaxed mb-10 max-w-md"
            style={{ fontFamily: "var(--font-body-serif)" }}
          >
            {t("subtitle")}
          </p>
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-accent/90 transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Alle Artikel lesen
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Right: manuscript image */}
        <div className="relative hidden md:block">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80"
              alt="Altes Manuskript"
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full opacity-20 -z-10"
            style={{ background: "var(--color-accent)" }}
          />
        </div>

      </section>

      {/* ── Articles ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">

        <div className="flex items-center gap-4 mb-12">
          <span
            className="text-sm uppercase tracking-widest text-muted"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Neueste Artikel
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {articles.length === 0 && (
          <p className="text-center text-muted py-12" style={{ fontFamily: "var(--font-sans)" }}>
            {locale === "de" ? "Noch keine Artikel veröffentlicht." : "No articles published yet."}
          </p>
        )}

        {featured && (
          <div className="mb-12">
            <ArticleCard article={featured} featured />
          </div>
        )}

        {latest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latest.map((article) => (
              <ArticleCard key={article._id as string} article={article} />
            ))}
          </div>
        )}

        {articles.length > 6 && (
          <div className="mt-12 text-center">
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Alle {articles.length} Artikel ansehen →
            </Link>
          </div>
        )}

      </section>
    </div>
  );
}
