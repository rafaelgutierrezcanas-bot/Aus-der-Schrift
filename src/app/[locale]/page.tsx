import { client } from "@/sanity/client";
import { recommendedArticlesQuery, latestArticlesQuery } from "@/sanity/queries";
import { ArticleCard } from "@/components/ArticleCard";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
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
    deTitle: "Theologie aus der Schrift",
    enTitle: "Theology from Scripture",
    deDescription:
      "Theologik veröffentlicht fundierte Artikel zu Theologie, Bibelauslegung, Kirchengeschichte, Apologetik und geistlichem Leben.",
    enDescription:
      "Theologik publishes well-researched articles on theology, biblical interpretation, church history, apologetics, and spiritual life.",
    keywords: [
      "Theologik",
      "Theologie",
      "Bibelauslegung",
      "Kirchengeschichte",
      "Apologetik",
      "theologischer Blog",
    ],
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("homepage");

  let recommended: Record<string, unknown>[] = [];
  let latest: Record<string, unknown>[] = [];
  try {
    [recommended, latest] = await Promise.all([
      client.fetch(recommendedArticlesQuery, {}, { next: { tags: ["articles"], revalidate: 60 } }),
      client.fetch(latestArticlesQuery, {}, { next: { tags: ["articles"], revalidate: 60 } }),
    ]);
  } catch {
    // empty state
  }

  // Newest article always first in recommended section
  const newestArticle = latest[0];
  if (newestArticle) {
    const withoutNewest = recommended.filter((a) => a._id !== newestArticle._id);
    recommended = [newestArticle, ...withoutNewest];
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: SITE_NAME,
        url: absoluteUrl(`/${locale}`),
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: SITE_NAME,
        url: absoluteUrl(`/${locale}`),
        inLanguage: locale === "de" ? "de-DE" : "en-US",
        publisher: {
          "@id": absoluteUrl("/#organization"),
        },
      },
      {
        "@type": "Blog",
        "@id": absoluteUrl(`/${locale}/blog#blog`),
        name: "Theologik Blog",
        url: absoluteUrl(`/${locale}/blog`),
        inLanguage: locale === "de" ? "de-DE" : "en-US",
      },
    ],
  };

  return (
    <div>
      <Script
        id={`schema-home-${locale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="relative h-screen -mt-16 flex items-center overflow-hidden">
        {/* Background: Codex Sinaiticus */}
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/b/be/Codex_Sinaiticus_Matthew_6%2C4-32.JPG"
          alt={locale === "de" ? "Codex Sinaiticus – griechisches Pergamentmanuskript, 4. Jahrhundert" : "Codex Sinaiticus – Greek parchment manuscript, 4th century"}
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />

        {/* Gradient overlay: dark left → transparent right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to right, rgba(28,24,18,0.93) 0%, rgba(28,24,18,0.80) 40%, rgba(28,24,18,0.30) 70%, rgba(28,24,18,0.10) 100%)" }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 md:py-36 w-full">
          <div className="max-w-2xl">

            {/* Greek epigraph */}
            <div className="mb-8">
              <span className="text-accent text-base tracking-wide block" style={{ fontFamily: "var(--font-serif)" }}>
                Κατὰ τὰς Γραφάς
              </span>
              <span className="text-[10px] tracking-[0.15em] uppercase block mt-1" style={{ fontFamily: "var(--font-sans)", color: "rgba(237,229,216,0.5)" }}>
                {locale === "de" ? "nach den Schriften · 1 Kor 15,3" : "according to the Scriptures · 1 Cor 15:3"}
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6"
              style={{ fontFamily: "var(--font-serif)", color: "#EDE5D8" }}
            >
              {locale === "de" ? "Theologie" : "Theology"}<br />
              <em className="not-italic text-accent">
                {locale === "de" ? "aus der Schrift." : "from Scripture."}
              </em>
            </h1>

            <p
              className="text-lg leading-relaxed mb-10 max-w-lg"
              style={{ fontFamily: "var(--font-body-serif)", color: "rgba(237,229,216,0.65)" }}
            >
              {t("subtitle")}
            </p>

            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-2 border border-accent text-accent px-6 py-2.5 text-sm font-medium hover:bg-accent hover:text-white transition-colors"
              style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.05em" }}
            >
              {locale === "de" ? "Alle Artikel lesen" : "Read all articles"}
              <span aria-hidden>→</span>
            </Link>

          </div>
        </div>
      </section>

      {/* ── Recommended Articles ── */}
      {recommended.length > 0 && (
        <section className="border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-16">

            <div className="flex items-center gap-4 mb-10">
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {locale === "de" ? "Empfohlen" : "Featured"}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="mb-12">
              <ArticleCard article={recommended[0]} featured />
            </div>

            {recommended.slice(1, 4).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommended.slice(1, 4).map((article) => (
                  <ArticleCard key={article._id as string} article={article} />
                ))}
              </div>
            )}

          </div>
        </section>
      )}

      {/* ── Latest Articles ── */}
      {latest.length > 0 && (
        <section className="border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-16">

            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {locale === "de" ? "Neueste Artikel" : "Latest Articles"}
                </span>
                <div className="w-16 h-px bg-border" />
              </div>
              <Link
                href={`/${locale}/blog`}
                className="text-xs text-muted hover:text-accent transition-colors flex items-center gap-1"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {locale === "de" ? "Alle ansehen" : "View all"} →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latest.map((article) => (
                <ArticleCard key={article._id as string} article={article} />
              ))}
            </div>

          </div>
        </section>
      )}

      {recommended.length === 0 && latest.length === 0 && (
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <p className="text-muted" style={{ fontFamily: "var(--font-sans)" }}>
            {locale === "de" ? "Noch keine Artikel veröffentlicht." : "No articles published yet."}
          </p>
        </section>
      )}

    </div>
  );
}
