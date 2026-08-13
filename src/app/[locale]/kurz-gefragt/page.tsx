import { client } from "@/sanity/client";
import { allKurzGefragtQuery, pageBySlugQuery } from "@/sanity/queries";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getLocalizedCategoryTitle, getLocalizedQuestion, formatDate } from "@/lib/utils";
import Script from "next/script";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { buildLocalizedMetadata } from "@/lib/seo";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";

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
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("kurzGefragt");

  let questions: Record<string, unknown>[] = [];
  try {
    questions = await client.fetch(allKurzGefragtQuery, {}, { next: { tags: ["kurzGefragt"], revalidate: 60 } });
  } catch {
    // empty state
  }

  let pageDoc: Record<string, unknown> | null = null;
  try {
    pageDoc = await client.fetch(pageBySlugQuery, { slug: "kurz-gefragt" }, { next: { tags: ["pages"], revalidate: 60 } });
  } catch {
    // fallback to translation string
  }

  const pageBody = pageDoc
    ? (locale === "en" && Array.isArray(pageDoc.bodyEn) && pageDoc.bodyEn.length > 0
        ? pageDoc.bodyEn
        : Array.isArray(pageDoc.bodyDe) && pageDoc.bodyDe.length > 0
          ? pageDoc.bodyDe
          : null)
    : null;

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
      <div className="mb-12">
        <div className="w-8 h-0.5 bg-accent mb-4" />
        <h1
          className="text-4xl md:text-5xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t("title")}
        </h1>
        {pageBody ? (
          <div className="mt-3 text-muted leading-relaxed max-w-2xl" style={{ fontFamily: "var(--font-body-serif)" }}>
            <PortableTextRenderer value={pageBody as unknown[]} locale={locale} />
          </div>
        ) : (
          <p
            className="mt-3 text-muted leading-relaxed max-w-2xl"
            style={{ fontFamily: "var(--font-body-serif)" }}
          >
            {t("subtitle")}
          </p>
        )}
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <p className="text-muted text-center py-12" style={{ fontFamily: "var(--font-body-serif)" }}>
          {t("keineFragenNoch")}
        </p>
      ) : (
        <div className="space-y-0 border-t border-border">
          {questions.map((q) => {
            const question = getLocalizedQuestion(q, locale);
            const qSlug = locale === "en" && (q.slugEn as { current: string })?.current
              ? (q.slugEn as { current: string }).current
              : (q.slug as { current: string })?.current;
            const verdict = q.verdict as string | undefined;
            const cat = q.category as Record<string, unknown> | null;
            const catTitle = getLocalizedCategoryTitle(cat, locale);
            const publishedAt = q.publishedAt as string | undefined;
            const shortAnswer = locale === "en"
              ? (q.shortAnswerEn as string | undefined) || (q.shortAnswerDe as string | undefined)
              : (q.shortAnswerDe as string | undefined);

            return (
              <Link
                key={q._id as string}
                href={`/${locale}/kurz-gefragt/${qSlug}`}
                className="group block border-b border-border py-6 hover:bg-surface/40 transition-colors -mx-4 px-4 rounded-sm"
              >
                <div className="flex items-start gap-3 mb-2">
                  {verdict && verdictLabels[verdict] && (
                    <span
                      className="bg-navy text-background text-[10px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-sm mt-1 shrink-0"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {locale === "en" ? verdictLabels[verdict].en : verdictLabels[verdict].de}
                    </span>
                  )}
                  <h2
                    className="text-lg font-semibold leading-snug group-hover:text-accent transition-colors"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {question}
                  </h2>
                </div>
                {shortAnswer && (
                  <p
                    className="text-sm text-muted leading-relaxed mb-3"
                    style={{ fontFamily: "var(--font-body-serif)" }}
                  >
                    {shortAnswer}
                  </p>
                )}
                <div className="flex items-center gap-3">
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

      {/* CTA: Submit a question */}
      <div className="mt-16 border border-border rounded-sm p-8 text-center bg-surface/40">
        <p
          className="text-lg font-semibold mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {locale === "de" ? "Hast du eine Frage?" : "Do you have a question?"}
        </p>
        <p
          className="text-sm text-muted mb-5 max-w-md mx-auto leading-relaxed"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {locale === "de"
            ? "Du hast eine Frage zur Bibel oder Theologie, die dich beschäftigt? Schreib mir – vielleicht wird sie hier beantwortet."
            : "Have a question about the Bible or theology? Reach out — it might be answered here."}
        </p>
        <Link
          href={`/${locale}/kontakt`}
          className="inline-block text-xs font-semibold uppercase tracking-[0.12em] px-5 py-2.5 rounded-sm bg-accent text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {locale === "de" ? "Kontakt aufnehmen" : "Get in touch"}
        </Link>
      </div>
    </div>
  );
}
