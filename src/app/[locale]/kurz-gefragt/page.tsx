import { client } from "@/sanity/client";
import { allKurzGefragtQuery, allCategoriesQuery } from "@/sanity/queries";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getLocalizedCategoryTitle, getLocalizedQuestion, getLocalizedShortAnswer, formatDate } from "@/lib/utils";
import Script from "next/script";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { buildLocalizedMetadata } from "@/lib/seo";

export const revalidate = 600;

const verdictLabels: Record<string, { de: string; en: string }> = {
  ja: { de: "Ja", en: "Yes" },
  nein: { de: "Nein", en: "No" },
  teilweise: { de: "Teilweise", en: "Partially" },
  umstritten: { de: "Umstritten", en: "Debated" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildLocalizedMetadata({
    locale,
    pathname: "/kurz-gefragt",
    deTitle: "Kurz gefragt – Häufige Fragen zu Bibel und Theologie",
    enTitle: "Quick Answers – Common Questions about Bible and Theology",
    deDescription:
      "Kurze, fundierte Antworten auf häufige Fragen zur Bibel und Theologie – mit Belegen.",
    enDescription:
      "Short, well-researched answers to common questions about the Bible and theology — with sources.",
  });
}

export default async function KurzGefragtIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ kategorie?: string }>;
}) {
  const { locale } = await params;
  const { kategorie } = await searchParams;
  const t = await getTranslations("kurzGefragt");

  let allQuestions: Record<string, unknown>[] = [];
  let categories: Record<string, unknown>[] = [];
  try {
    [allQuestions, categories] = await Promise.all([
      client.fetch(allKurzGefragtQuery, {}, { next: { tags: ["kurzGefragt"], revalidate: 60 } }),
      client.fetch(allCategoriesQuery, {}, { next: { tags: ["categories"], revalidate: 3600 } }),
    ]);
  } catch {
    // empty state
  }

  const questions = kategorie
    ? allQuestions.filter((q) => {
        const cat = q.category as Record<string, unknown> | null;
        return (cat?.slug as { current: string })?.current === kategorie;
      })
    : allQuestions;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: locale === "de" ? "Kurz gefragt" : "Quick Answers",
    url: absoluteUrl(`/${locale}/kurz-gefragt`),
    inLanguage: locale === "de" ? "de-DE" : "en-US",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Script
        id={`schema-kurz-gefragt-index-${locale}`}
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
          {t("title")}
        </h1>
        <p
          className="mt-3 text-muted leading-relaxed max-w-2xl"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {t("subtitle")}
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="overflow-x-auto mb-12 pb-5 border-b border-border">
        <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-sans)" }}>
          <Link
            href={`/${locale}/kurz-gefragt`}
            className={`text-xs font-semibold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              !kategorie
                ? "bg-accent text-white"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            {t("alleKategorien")}
          </Link>
          {categories.map((cat) => {
            const catSlug = (cat.slug as { current: string })?.current;
            const isActive = kategorie === catSlug;
            return (
              <Link
                key={cat._id as string}
                href={`/${locale}/kurz-gefragt?kategorie=${catSlug}`}
                className={`text-xs font-semibold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-accent text-white"
                    : "border border-border text-muted hover:text-foreground"
                }`}
              >
                {getLocalizedCategoryTitle(cat, locale)}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Questions Grid */}
      {questions.length === 0 ? (
        <p className="text-muted text-center py-12" style={{ fontFamily: "var(--font-body-serif)" }}>
          {kategorie ? t("keineFragenKategorie") : t("keineFragenNoch")}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {questions.map((q) => {
            const question = getLocalizedQuestion(q, locale);
            const qSlug = locale === "en" && (q.slugEn as { current: string })?.current
              ? (q.slugEn as { current: string }).current
              : (q.slug as { current: string })?.current;
            const verdict = q.verdict as string | undefined;
            const cat = q.category as Record<string, unknown> | null;
            const catTitle = getLocalizedCategoryTitle(cat, locale);
            const publishedAt = q.publishedAt as string | undefined;

            return (
              <Link
                key={q._id as string}
                href={`/${locale}/kurz-gefragt/${qSlug}`}
                className="group block border border-border rounded-sm p-5 hover:border-accent/40 transition-colors bg-surface/40"
              >
                <h2
                  className="font-semibold leading-snug mb-3 group-hover:text-accent transition-colors"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {question}
                </h2>
                <div className="flex items-center flex-wrap gap-2">
                  {verdict && verdictLabels[verdict] && (
                    <span
                      className="bg-navy text-background text-[10px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-sm"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {locale === "en" ? verdictLabels[verdict].en : verdictLabels[verdict].de}
                    </span>
                  )}
                  {catTitle && (
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {catTitle}
                    </span>
                  )}
                  {publishedAt && (
                    <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
                      {formatDate(publishedAt, locale)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
