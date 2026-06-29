import { client } from "@/sanity/client";
import { recommendedArticlesQuery, latestArticlesQuery } from "@/sanity/queries";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { buildLocalizedMetadata } from "@/lib/seo";
import { getLocalizedTitle, getLocalizedExcerpt, getLocalizedCategoryTitle, formatDate } from "@/lib/utils";

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
      {recommended.length > 0 && (() => {
        const featured = recommended[0];
        const secondary = recommended.slice(1, 4);
        const featuredTitle = getLocalizedTitle(featured, locale);
        const featuredExcerpt = getLocalizedExcerpt(featured, locale);
        const featuredCat = featured.category as Record<string, unknown> | null;
        const featuredCatTitle = getLocalizedCategoryTitle(featuredCat, locale);
        const featuredCatSlug = (featuredCat?.slug as { current: string })?.current;
        const featuredSlug = (featured.slug as { current: string })?.current;

        return (
          <section className="border-b border-border">
            <div className="max-w-6xl mx-auto px-6 py-16">

              {/* Section label */}
              <div className="flex items-center gap-4 mb-10">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent" style={{ fontFamily: "var(--font-sans)" }}>
                  {locale === "de" ? "Empfohlen" : "Featured"}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Featured article — large, no image */}
              <article className="group mb-10 pb-10 border-b border-border">
                <div className="max-w-3xl">
                  {featuredCatTitle && (
                    featuredCatSlug ? (
                      <Link href={`/${locale}/kategorien/${featuredCatSlug}`}
                        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent hover:underline mb-3 block"
                        style={{ fontFamily: "var(--font-sans)" }}>
                        {featuredCatTitle}
                      </Link>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent mb-3 block" style={{ fontFamily: "var(--font-sans)" }}>
                        {featuredCatTitle}
                      </span>
                    )
                  )}
                  <Link href={`/${locale}/blog/${featuredSlug}`} className="group/link">
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4 group-hover/link:text-accent transition-colors"
                      style={{ fontFamily: "var(--font-serif)" }}>
                      {featuredTitle}
                    </h2>
                    {featuredExcerpt && (
                      <p className="text-muted text-lg leading-relaxed mb-5 line-clamp-2"
                        style={{ fontFamily: "var(--font-body-serif)" }}>
                        {featuredExcerpt}
                      </p>
                    )}
                  </Link>
                  <Link href={`/${locale}/blog/${featuredSlug}`}
                    className="inline-flex items-center gap-2 text-xs text-accent hover:gap-3 transition-all"
                    style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.08em" }}>
                    {locale === "de" ? "Artikel lesen" : "Read article"} →
                  </Link>
                </div>
              </article>

              {/* Secondary articles — 3 columns, no images */}
              {secondary.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                  {secondary.map((article) => {
                    const title = getLocalizedTitle(article, locale);
                    const excerpt = getLocalizedExcerpt(article, locale);
                    const cat = article.category as Record<string, unknown> | null;
                    const catTitle = getLocalizedCategoryTitle(cat, locale);
                    const catSlug = (cat?.slug as { current: string })?.current;
                    const slug = (article.slug as { current: string })?.current;
                    const publishedAt = article.publishedAt as string | undefined;
                    return (
                      <article key={article._id as string} className="group py-6 md:py-0 md:px-6 first:md:pl-0 last:md:pr-0">
                        {catTitle && (
                          catSlug ? (
                            <Link href={`/${locale}/kategorien/${catSlug}`}
                              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent hover:underline mb-2 block"
                              style={{ fontFamily: "var(--font-sans)" }}>
                              {catTitle}
                            </Link>
                          ) : (
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent mb-2 block" style={{ fontFamily: "var(--font-sans)" }}>
                              {catTitle}
                            </span>
                          )
                        )}
                        <Link href={`/${locale}/blog/${slug}`}>
                          <h3 className="font-bold leading-snug mb-2 group-hover:text-accent transition-colors text-lg"
                            style={{ fontFamily: "var(--font-serif)" }}>
                            {title}
                          </h3>
                          {excerpt && (
                            <p className="text-muted text-sm leading-relaxed line-clamp-2 mb-2"
                              style={{ fontFamily: "var(--font-body-serif)" }}>
                              {excerpt}
                            </p>
                          )}
                        </Link>
                        {publishedAt && (
                          <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
                            {formatDate(publishedAt, locale)}
                          </span>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}

            </div>
          </section>
        );
      })()}

      {/* ── Latest Articles ── */}
      {latest.length > 0 && (
        <section className="border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-16">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent" style={{ fontFamily: "var(--font-sans)" }}>
                {locale === "de" ? "Neueste Artikel" : "Latest Articles"}
              </span>
              <Link href={`/${locale}/blog`}
                className="text-xs text-muted hover:text-accent transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}>
                {locale === "de" ? "Alle ansehen →" : "View all →"}
              </Link>
            </div>

            {/* List rows */}
            <div>
              {latest.map((article) => {
                const title = getLocalizedTitle(article, locale);
                const cat = article.category as Record<string, unknown> | null;
                const catTitle = getLocalizedCategoryTitle(cat, locale);
                const catSlug = (cat?.slug as { current: string })?.current;
                const slug = (article.slug as { current: string })?.current;
                const publishedAt = article.publishedAt as string | undefined;
                return (
                  <article key={article._id as string}
                    className="group grid grid-cols-[auto_1fr] md:grid-cols-[160px_1fr_auto] items-baseline gap-3 md:gap-4 py-4 border-b border-border last:border-0">
                    {/* Category */}
                    <div className="shrink-0">
                      {catTitle && (
                        catSlug ? (
                          <Link href={`/${locale}/kategorien/${catSlug}`}
                            className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent hover:underline"
                            style={{ fontFamily: "var(--font-sans)" }}>
                            {catTitle}
                          </Link>
                        ) : (
                          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent" style={{ fontFamily: "var(--font-sans)" }}>
                            {catTitle}
                          </span>
                        )
                      )}
                    </div>
                    {/* Title */}
                    <Link href={`/${locale}/blog/${slug}`}
                      className="min-w-0 font-semibold leading-snug group-hover:text-accent transition-colors"
                      style={{ fontFamily: "var(--font-serif)" }}>
                      {title}
                    </Link>
                    {/* Date — hidden on mobile */}
                    {publishedAt && (
                      <span className="hidden md:block text-[11px] text-muted whitespace-nowrap" style={{ fontFamily: "var(--font-sans)" }}>
                        {formatDate(publishedAt, locale)}
                      </span>
                    )}
                  </article>
                );
              })}
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
